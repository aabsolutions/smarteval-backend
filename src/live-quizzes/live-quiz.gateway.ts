import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LiveQuiz, LiveQuizStatus } from './schemas/live-quiz.schema';
import { calculatePoints, generateRanking } from './live-quiz-scoring.util';
import { UsersService } from '../users/users.service';

interface UserSocketData {
  userId: string;
  username: string;
  roles: any[];
  name: string;
}

@WebSocketGateway({
  namespace: '/live-quiz',
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') ?? ['http://localhost:4200'],
    credentials: true,
  },
})
export class LiveQuizGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<string, UserSocketData>();
  private questionTimers = new Map<string, NodeJS.Timeout>();
  private currentQuestionAnswers = new Map<string, Set<string>>();

  constructor(
    private jwtService: JwtService,
    @InjectModel(LiveQuiz.name) private liveQuizModel: Model<LiveQuiz>,
    private usersService: UsersService,
  ) {}

  // Helpers
  private getUser(client: Socket): UserSocketData | undefined {
    let user = this.connectedUsers.get(client.id);
    if (!user) {
      try {
        const token = client.handshake.auth?.token;
        if (token) {
          const payload = this.jwtService.verify(token);
          user = {
            userId: payload.sub,
            username: payload.username,
            roles: payload.roles,
            name: payload.name || payload.username,
          };
          this.connectedUsers.set(client.id, user);
        }
      } catch (e) {
        return undefined;
      }
    }
    return user;
  }

  async handleConnection(client: Socket) {
    // Si bien podemos extraerlo acá, getUser() lo hará on-demand si llegan mensajes antes
    const user = this.getUser(client);
    if (!user) {
      client.emit('quiz:error', { message: 'Token requerido o inválido', code: 'AUTH_REQUIRED' });
      setTimeout(() => client.disconnect(), 100);
    }
  }

  handleDisconnect(client: Socket) {
    const user = this.connectedUsers.get(client.id);
    if (user) {
      // Nota: Si estuviera en una room, podríamos notificar lobby:student-left aquí
      // pero requeriría mapear socketId -> quizId
      this.connectedUsers.delete(client.id);
    }
  }

  // ═══ EVENTOS DEL DOCENTE ═══

  @SubscribeMessage('teacher:open-lobby')
  async handleOpenLobby(client: Socket, { quizId }: { quizId: string }) {
    try {
      const user = this.getUser(client);
      if (!user) {
        return client.emit('quiz:error', { message: 'Usuario no conectado o sesión expirada' });
      }

      const quiz = await this.liveQuizModel.findById(quizId);
      if (!quiz || quiz.teacherId.toString() !== user.userId) {
        return client.emit('quiz:error', { message: 'Quiz no encontrado o no autorizado para tu usuario' });
      }

      quiz.status = LiveQuizStatus.LOBBY;
      quiz.participants = [];
      await quiz.save();

      const room = `quiz:${quizId}`;
      client.join(room);

      client.emit('lobby:opened', { pin: quiz.pin, participants: [] });
    } catch (err: any) {
      console.error('[LiveQuizGateway] Error en open-lobby:', err.message);
      client.emit('quiz:error', { message: 'Error interno al abrir la sala: ' + err.message });
    }
  }

  @SubscribeMessage('teacher:start-quiz')
  async handleStartQuiz(client: Socket, { quizId }: { quizId: string }) {
    const quiz = await this.liveQuizModel.findById(quizId);
    if (!quiz) return;

    quiz.status = LiveQuizStatus.IN_PROGRESS;
    quiz.currentQuestionIndex = 0;
    quiz.startedAt = new Date();
    quiz.answers = [];
    await quiz.save();

    this.sendQuestion(quiz);
  }

  @SubscribeMessage('teacher:next-question')
  async handleNextQuestion(client: Socket, { quizId }: { quizId: string }) {
    const quiz = await this.liveQuizModel.findById(quizId);
    if (!quiz) return;

    this.cancelTimer(quizId);

    quiz.currentQuestionIndex++;
    if (quiz.currentQuestionIndex < quiz.questions.length) {
      quiz.status = LiveQuizStatus.IN_PROGRESS;
      await quiz.save();
      this.sendQuestion(quiz);
    } else {
      quiz.status = LiveQuizStatus.PODIUM;
      await quiz.save();
      this.showPodium(quiz);
    }
  }

  @SubscribeMessage('teacher:show-podium')
  async handleShowPodium(client: Socket, { quizId }: { quizId: string }) {
    const quiz = await this.liveQuizModel.findById(quizId);
    if (!quiz) return;

    quiz.status = LiveQuizStatus.FINISHED;
    quiz.finishedAt = new Date();
    await quiz.save();
    this.showPodium(quiz);
    
    // Cleanup
    this.cancelTimer(quizId);
    this.currentQuestionAnswers.delete(quizId);
  }

  // ═══ EVENTOS DEL ESTUDIANTE ═══

  @SubscribeMessage('student:join')
  async handleStudentJoin(client: Socket, { pin }: { pin: string }) {
    const user = this.getUser(client);
    if (!user) {
      return client.emit('quiz:error', { message: 'Sesión no válida o expirada' });
    }

    // Buscar nombre real acá, justo antes de unirlo
    try {
      const dbUser = await this.usersService.findById(user.userId);
      if (dbUser && dbUser.name) {
        user.name = dbUser.name.trim();
        this.connectedUsers.set(client.id, user);
      }
    } catch(e) {}

    let quiz = await this.liveQuizModel.findOne({ pin, status: LiveQuizStatus.LOBBY });
    if (!quiz) {
      return client.emit('quiz:error', { message: 'El PIN es inválido o la sala no está abierta' });
    }

    // Actualización ATÓMICA en Mongo para evitar duplicados si hay clics simultáneos (Race Condition)
    const updatedQuiz = await this.liveQuizModel.findOneAndUpdate(
      { _id: quiz._id, 'participants.userId': { $ne: user.userId } },
      { 
        $push: { 
          participants: {
            userId: user.userId as any,
            name: user.name,
            totalScore: 0,
            correctAnswers: 0,
            totalResponseTimeMs: 0,
            currentStreak: 0,
          } 
        } 
      },
      { new: true }
    );

    // Si updatedQuiz existe, es porque lo insertamos con éxito. Si no, ya estaba en la lista, así que refrescamos.
    quiz = (updatedQuiz || await this.liveQuizModel.findById(quiz._id)) as any;

    const room = `quiz:${quiz._id}`;
    client.join(room);

    // Avisar al docente
    this.server.to(room).emit('lobby:student-joined', {
      userId: user.userId,
      name: user.name,
      totalParticipants: quiz.participants.length,
    });

    // Confirmar al estudiante
    client.emit('lobby:joined', {
      quizId: quiz._id,
      quizTitle: quiz.title,
      participantCount: quiz.participants.length,
    });
  }

  @SubscribeMessage('student:answer')
  async handleStudentAnswer(
    client: Socket,
    { quizId, questionIndex, answers, responseTimeMs }:
    { quizId: string; questionIndex: number; answers: string[]; responseTimeMs: number },
  ) {
    const user = this.connectedUsers.get(client.id);
    if (!user) return;

    const quiz = await this.liveQuizModel.findById(quizId);
    if (!quiz || quiz.status !== LiveQuizStatus.IN_PROGRESS || quiz.currentQuestionIndex !== questionIndex) {
      return;
    }

    const answersSet = this.currentQuestionAnswers.get(quizId) || new Set();
    if (answersSet.has(user.userId)) {
      return; // Ya respondió
    }
    answersSet.add(user.userId);
    this.currentQuestionAnswers.set(quizId, answersSet);

    const question = quiz.questions[questionIndex];
    
    // Validar isCorrect básico (expandir según tipo de pregunta)
    let isCorrect = false;
    if (question.type === 'single-choice' || question.type === 'true-false') {
      isCorrect = answers[0] === question.correctAnswers[0];
    } else if (question.type === 'multiple-choice') {
      const sortedAns = [...answers].sort();
      const sortedCorr = [...question.correctAnswers].sort();
      isCorrect = JSON.stringify(sortedAns) === JSON.stringify(sortedCorr);
    }

    const pointsAwarded = calculatePoints(isCorrect, responseTimeMs, question.timeLimitSeconds * 1000, question.points);

    // Actualizar datos del estudiante
    const participant = quiz.participants.find(p => p.userId.toString() === user.userId);
    if (participant) {
      participant.totalScore += pointsAwarded;
      if (isCorrect) {
        participant.correctAnswers += 1;
        participant.currentStreak += 1;
      } else {
        participant.currentStreak = 0;
      }
      participant.totalResponseTimeMs += responseTimeMs;
    }

    quiz.answers.push({
      userId: user.userId as any,
      questionIndex,
      answers,
      responseTimeMs,
      isCorrect,
      pointsAwarded,
    });

    await quiz.save();

    // Calcular ranking actual para feedback inmediato
    const ranking = generateRanking(quiz.participants.map(p => ({
      userId: p.userId.toString(),
      name: p.name,
      totalScore: p.totalScore,
      correctAnswers: p.correctAnswers,
      totalResponseTimeMs: p.totalResponseTimeMs,
    })));
    const rank = ranking.find(r => r.userId === user.userId)?.rank || 0;

    // Enviar resultado INMEDIATO al estudiante que respondió (no esperar al resto)
    client.emit('quiz:your-result', {
      isCorrect,
      pointsAwarded,
      currentRank: rank,
      totalScore: participant?.totalScore || 0,
      streak: participant?.currentStreak || 0,
      timedOut: false,
    });
    
    // Notificar avance al docente
    this.server.to(`quiz:${quizId}`).emit('quiz:answer-received', {
      answeredCount: answersSet.size,
      totalParticipants: quiz.participants.length,
    });

    // Si todos respondieron, auto-avanzar (handleTimerExpired solo envía al docente y a quienes no respondieron)
    if (answersSet.size >= quiz.participants.length) {
      this.cancelTimer(quizId);
      this.handleTimerExpired(quizId);
    }
  }

  // ═══ MÉTODOS INTERNOS ═══

  private sendQuestion(quiz: LiveQuiz) {
    const room = `quiz:${quiz._id}`;
    const q = quiz.questions[quiz.currentQuestionIndex];
    
    // Iniciar tracking de respuestas para esta pregunta
    this.currentQuestionAnswers.set(quiz._id.toString(), new Set());

    // Pregunta para estudiantes (SIN correctAnswers)
    this.server.to(room).emit('quiz:question', {
      index: quiz.currentQuestionIndex,
      total: quiz.questions.length,
      question: {
        type: q.type,
        statement: q.statement,
        options: q.options,
        matchingOptions: q.matchingOptions,
        points: q.points,
        imageUrl: q.imageUrl,
      },
      timeLimit: q.timeLimitSeconds,
    });

    // Pregunta para proyector del docente (CON correctAnswers)
    this.server.to(room).emit('quiz:question-projected', {
      index: quiz.currentQuestionIndex,
      total: quiz.questions.length,
      question: q, // Objeto completo
      timeLimit: q.timeLimitSeconds,
    });

    this.startQuestionTimer(quiz._id.toString(), q.timeLimitSeconds);
  }

  private startQuestionTimer(quizId: string, timeLimitSeconds: number) {
    const room = `quiz:${quizId}`;
    let remaining = timeLimitSeconds;
    
    const interval = setInterval(() => {
      remaining--;
      this.server.to(room).emit('quiz:countdown', { secondsRemaining: remaining });
      if (remaining <= 0) {
        this.cancelTimer(quizId);
        this.handleTimerExpired(quizId);
      }
    }, 1000);
    this.questionTimers.set(quizId, interval);
  }

  private cancelTimer(quizId: string) {
    if (this.questionTimers.has(quizId)) {
      clearInterval(this.questionTimers.get(quizId));
      this.questionTimers.delete(quizId);
    }
  }

  private async handleTimerExpired(quizId: string) {
    const quiz = await this.liveQuizModel.findById(quizId);
    if (!quiz) return;

    const answeredSet = this.currentQuestionAnswers.get(quizId) || new Set();

    // Resetear racha de quienes NO respondieron
    for (const participant of quiz.participants) {
      if (!answeredSet.has(participant.userId.toString())) {
        participant.currentStreak = 0;
      }
    }

    quiz.status = LiveQuizStatus.BETWEEN_QUESTIONS;
    await quiz.save();

    const q = quiz.questions[quiz.currentQuestionIndex];
    const room = `quiz:${quizId}`;
    
    // Estadísticas
    const currentAnswers = quiz.answers.filter(a => a.questionIndex === quiz.currentQuestionIndex);
    const correctCount = currentAnswers.filter(a => a.isCorrect).length;
    
    const stats = {
      totalParticipants: quiz.participants.length,
      totalAnswered: currentAnswers.length,
      correctCount,
      correctPercentage: currentAnswers.length ? (correctCount / currentAnswers.length) * 100 : 0,
      averageResponseTimeMs: currentAnswers.length 
        ? currentAnswers.reduce((sum, a) => sum + a.responseTimeMs, 0) / currentAnswers.length 
        : 0,
    };

    // Distribución
    const distribution: Record<string, any> = {};
    q.options.forEach(opt => {
      const count = currentAnswers.filter(a => a.answers.includes(opt)).length;
      distribution[opt] = {
        count,
        percentage: currentAnswers.length ? (count / currentAnswers.length) * 100 : 0,
        isCorrect: q.correctAnswers.includes(opt),
      };
    });

    // Enviar resultados al docente
    this.server.to(room).emit('quiz:question-results', {
      questionIndex: quiz.currentQuestionIndex,
      stats,
      correctAnswer: q.correctAnswers,
      distribution,
    });

    // Calcular ranking actual
    const ranking = generateRanking(quiz.participants.map(p => ({
      userId: p.userId.toString(),
      name: p.name,
      totalScore: p.totalScore,
      correctAnswers: p.correctAnswers,
      totalResponseTimeMs: p.totalResponseTimeMs,
    })));

    // Enviar resultados SOLO a quienes NO respondieron (los demás ya recibieron su resultado inmediato)
    for (const participant of quiz.participants) {
      const pId = participant.userId.toString();
      
      if (answeredSet.has(pId)) continue; // Ya recibió resultado en handleStudentAnswer
      
      const rank = ranking.find(r => r.userId === pId)?.rank || 0;
      
      for (const [socketId, userData] of this.connectedUsers.entries()) {
        if (userData.userId === pId) {
          this.server.to(socketId).emit('quiz:your-result', {
            isCorrect: false,
            pointsAwarded: 0,
            currentRank: rank,
            totalScore: participant.totalScore,
            streak: 0,
            timedOut: true,
          });
        }
      }
    }
  }

  private showPodium(quiz: LiveQuiz) {
    const ranking = generateRanking(quiz.participants.map(p => ({
      userId: p.userId.toString(),
      name: p.name,
      totalScore: p.totalScore,
      correctAnswers: p.correctAnswers,
      totalResponseTimeMs: p.totalResponseTimeMs,
    })));

    const top3 = ranking.slice(0, 3);
    const room = `quiz:${quiz._id}`;

    // Al docente (todos)
    this.server.to(room).emit('quiz:podium', { top3, fullRanking: ranking });

    // Individuales
    for (const p of quiz.participants) {
      const pId = p.userId.toString();
      const rank = ranking.find(r => r.userId === pId)?.rank || 0;
      
      for (const [socketId, user] of this.connectedUsers.entries()) {
        if (user.userId === pId) {
          this.server.to(socketId).emit('quiz:final-result', {
            yourRank: rank,
            totalPoints: p.totalScore,
            correctCount: p.correctAnswers,
            totalQuestions: quiz.questions.length,
          });
        }
      }
    }
  }
}
