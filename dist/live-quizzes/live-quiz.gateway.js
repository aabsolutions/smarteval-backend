"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LiveQuizGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const jwt_1 = require("@nestjs/jwt");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const live_quiz_schema_1 = require("./schemas/live-quiz.schema");
const live_quiz_scoring_util_1 = require("./live-quiz-scoring.util");
const users_service_1 = require("../users/users.service");
let LiveQuizGateway = class LiveQuizGateway {
    constructor(jwtService, liveQuizModel, usersService) {
        this.jwtService = jwtService;
        this.liveQuizModel = liveQuizModel;
        this.usersService = usersService;
        this.connectedUsers = new Map();
        this.questionTimers = new Map();
        this.currentQuestionAnswers = new Map();
    }
    getUser(client) {
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
            }
            catch (e) {
                return undefined;
            }
        }
        return user;
    }
    async handleConnection(client) {
        const user = this.getUser(client);
        if (!user) {
            client.emit('quiz:error', { message: 'Token requerido o inválido', code: 'AUTH_REQUIRED' });
            setTimeout(() => client.disconnect(), 100);
        }
    }
    handleDisconnect(client) {
        const user = this.connectedUsers.get(client.id);
        if (user) {
            this.connectedUsers.delete(client.id);
        }
    }
    async handleOpenLobby(client, { quizId }) {
        try {
            const user = this.getUser(client);
            if (!user) {
                return client.emit('quiz:error', { message: 'Usuario no conectado o sesión expirada' });
            }
            const quiz = await this.liveQuizModel.findById(quizId);
            if (!quiz || quiz.teacherId.toString() !== user.userId) {
                return client.emit('quiz:error', { message: 'Quiz no encontrado o no autorizado para tu usuario' });
            }
            quiz.status = live_quiz_schema_1.LiveQuizStatus.LOBBY;
            quiz.participants = [];
            await quiz.save();
            const room = `quiz:${quizId}`;
            client.join(room);
            client.emit('lobby:opened', { pin: quiz.pin, participants: [] });
        }
        catch (err) {
            console.error('[LiveQuizGateway] Error en open-lobby:', err.message);
            client.emit('quiz:error', { message: 'Error interno al abrir la sala: ' + err.message });
        }
    }
    async handleStartQuiz(client, { quizId }) {
        const quiz = await this.liveQuizModel.findById(quizId);
        if (!quiz)
            return;
        quiz.status = live_quiz_schema_1.LiveQuizStatus.IN_PROGRESS;
        quiz.currentQuestionIndex = 0;
        quiz.startedAt = new Date();
        quiz.answers = [];
        await quiz.save();
        this.sendQuestion(quiz);
    }
    async handleNextQuestion(client, { quizId }) {
        const quiz = await this.liveQuizModel.findById(quizId);
        if (!quiz)
            return;
        this.cancelTimer(quizId);
        quiz.currentQuestionIndex++;
        if (quiz.currentQuestionIndex < quiz.questions.length) {
            quiz.status = live_quiz_schema_1.LiveQuizStatus.IN_PROGRESS;
            await quiz.save();
            this.sendQuestion(quiz);
        }
        else {
            quiz.status = live_quiz_schema_1.LiveQuizStatus.PODIUM;
            await quiz.save();
            this.showPodium(quiz);
        }
    }
    async handleShowPodium(client, { quizId }) {
        const quiz = await this.liveQuizModel.findById(quizId);
        if (!quiz)
            return;
        quiz.status = live_quiz_schema_1.LiveQuizStatus.FINISHED;
        quiz.finishedAt = new Date();
        await quiz.save();
        this.showPodium(quiz);
        this.cancelTimer(quizId);
        this.currentQuestionAnswers.delete(quizId);
    }
    async handleStudentJoin(client, { pin }) {
        const user = this.getUser(client);
        if (!user) {
            return client.emit('quiz:error', { message: 'Sesión no válida o expirada' });
        }
        try {
            const dbUser = await this.usersService.findById(user.userId);
            if (dbUser && dbUser.name) {
                user.name = dbUser.name.trim();
                this.connectedUsers.set(client.id, user);
            }
        }
        catch (e) { }
        let quiz = await this.liveQuizModel.findOne({ pin, status: live_quiz_schema_1.LiveQuizStatus.LOBBY });
        if (!quiz) {
            return client.emit('quiz:error', { message: 'El PIN es inválido o la sala no está abierta' });
        }
        const updatedQuiz = await this.liveQuizModel.findOneAndUpdate({ _id: quiz._id, 'participants.userId': { $ne: user.userId } }, {
            $push: {
                participants: {
                    userId: user.userId,
                    name: user.name,
                    totalScore: 0,
                    correctAnswers: 0,
                    totalResponseTimeMs: 0,
                    currentStreak: 0,
                }
            }
        }, { new: true });
        quiz = (updatedQuiz || await this.liveQuizModel.findById(quiz._id));
        const room = `quiz:${quiz._id}`;
        client.join(room);
        this.server.to(room).emit('lobby:student-joined', {
            userId: user.userId,
            name: user.name,
            totalParticipants: quiz.participants.length,
        });
        client.emit('lobby:joined', {
            quizId: quiz._id,
            quizTitle: quiz.title,
            participantCount: quiz.participants.length,
        });
    }
    async handleStudentAnswer(client, { quizId, questionIndex, answers, responseTimeMs }) {
        const user = this.connectedUsers.get(client.id);
        if (!user)
            return;
        const quiz = await this.liveQuizModel.findById(quizId);
        if (!quiz || quiz.status !== live_quiz_schema_1.LiveQuizStatus.IN_PROGRESS || quiz.currentQuestionIndex !== questionIndex) {
            return;
        }
        const answersSet = this.currentQuestionAnswers.get(quizId) || new Set();
        if (answersSet.has(user.userId)) {
            return;
        }
        answersSet.add(user.userId);
        this.currentQuestionAnswers.set(quizId, answersSet);
        const question = quiz.questions[questionIndex];
        let isCorrect = false;
        if (question.type === 'single-choice' || question.type === 'true-false') {
            isCorrect = answers[0] === question.correctAnswers[0];
        }
        else if (question.type === 'multiple-choice') {
            const sortedAns = [...answers].sort();
            const sortedCorr = [...question.correctAnswers].sort();
            isCorrect = JSON.stringify(sortedAns) === JSON.stringify(sortedCorr);
        }
        const pointsAwarded = (0, live_quiz_scoring_util_1.calculatePoints)(isCorrect, responseTimeMs, question.timeLimitSeconds * 1000, question.points);
        const participant = quiz.participants.find(p => p.userId.toString() === user.userId);
        if (participant) {
            participant.totalScore += pointsAwarded;
            if (isCorrect) {
                participant.correctAnswers += 1;
                participant.currentStreak += 1;
            }
            else {
                participant.currentStreak = 0;
            }
            participant.totalResponseTimeMs += responseTimeMs;
        }
        quiz.answers.push({
            userId: user.userId,
            questionIndex,
            answers,
            responseTimeMs,
            isCorrect,
            pointsAwarded,
        });
        await quiz.save();
        const ranking = (0, live_quiz_scoring_util_1.generateRanking)(quiz.participants.map(p => ({
            userId: p.userId.toString(),
            name: p.name,
            totalScore: p.totalScore,
            correctAnswers: p.correctAnswers,
            totalResponseTimeMs: p.totalResponseTimeMs,
        })));
        const rank = ranking.find(r => r.userId === user.userId)?.rank || 0;
        client.emit('quiz:your-result', {
            isCorrect,
            pointsAwarded,
            currentRank: rank,
            totalScore: participant?.totalScore || 0,
            streak: participant?.currentStreak || 0,
            timedOut: false,
        });
        this.server.to(`quiz:${quizId}`).emit('quiz:answer-received', {
            answeredCount: answersSet.size,
            totalParticipants: quiz.participants.length,
        });
        if (answersSet.size >= quiz.participants.length) {
            this.cancelTimer(quizId);
            this.handleTimerExpired(quizId);
        }
    }
    sendQuestion(quiz) {
        const room = `quiz:${quiz._id}`;
        const q = quiz.questions[quiz.currentQuestionIndex];
        this.currentQuestionAnswers.set(quiz._id.toString(), new Set());
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
        this.server.to(room).emit('quiz:question-projected', {
            index: quiz.currentQuestionIndex,
            total: quiz.questions.length,
            question: q,
            timeLimit: q.timeLimitSeconds,
        });
        this.startQuestionTimer(quiz._id.toString(), q.timeLimitSeconds);
    }
    startQuestionTimer(quizId, timeLimitSeconds) {
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
    cancelTimer(quizId) {
        if (this.questionTimers.has(quizId)) {
            clearInterval(this.questionTimers.get(quizId));
            this.questionTimers.delete(quizId);
        }
    }
    async handleTimerExpired(quizId) {
        const quiz = await this.liveQuizModel.findById(quizId);
        if (!quiz)
            return;
        const answeredSet = this.currentQuestionAnswers.get(quizId) || new Set();
        for (const participant of quiz.participants) {
            if (!answeredSet.has(participant.userId.toString())) {
                participant.currentStreak = 0;
            }
        }
        quiz.status = live_quiz_schema_1.LiveQuizStatus.BETWEEN_QUESTIONS;
        await quiz.save();
        const q = quiz.questions[quiz.currentQuestionIndex];
        const room = `quiz:${quizId}`;
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
        const distribution = {};
        q.options.forEach(opt => {
            const count = currentAnswers.filter(a => a.answers.includes(opt)).length;
            distribution[opt] = {
                count,
                percentage: currentAnswers.length ? (count / currentAnswers.length) * 100 : 0,
                isCorrect: q.correctAnswers.includes(opt),
            };
        });
        this.server.to(room).emit('quiz:question-results', {
            questionIndex: quiz.currentQuestionIndex,
            stats,
            correctAnswer: q.correctAnswers,
            distribution,
        });
        const ranking = (0, live_quiz_scoring_util_1.generateRanking)(quiz.participants.map(p => ({
            userId: p.userId.toString(),
            name: p.name,
            totalScore: p.totalScore,
            correctAnswers: p.correctAnswers,
            totalResponseTimeMs: p.totalResponseTimeMs,
        })));
        for (const participant of quiz.participants) {
            const pId = participant.userId.toString();
            if (answeredSet.has(pId))
                continue;
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
    showPodium(quiz) {
        const ranking = (0, live_quiz_scoring_util_1.generateRanking)(quiz.participants.map(p => ({
            userId: p.userId.toString(),
            name: p.name,
            totalScore: p.totalScore,
            correctAnswers: p.correctAnswers,
            totalResponseTimeMs: p.totalResponseTimeMs,
        })));
        const top3 = ranking.slice(0, 3);
        const room = `quiz:${quiz._id}`;
        this.server.to(room).emit('quiz:podium', { top3, fullRanking: ranking });
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
};
exports.LiveQuizGateway = LiveQuizGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], LiveQuizGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('teacher:open-lobby'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], LiveQuizGateway.prototype, "handleOpenLobby", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('teacher:start-quiz'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], LiveQuizGateway.prototype, "handleStartQuiz", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('teacher:next-question'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], LiveQuizGateway.prototype, "handleNextQuestion", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('teacher:show-podium'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], LiveQuizGateway.prototype, "handleShowPodium", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('student:join'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], LiveQuizGateway.prototype, "handleStudentJoin", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('student:answer'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], LiveQuizGateway.prototype, "handleStudentAnswer", null);
exports.LiveQuizGateway = LiveQuizGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        namespace: '/live-quiz',
        cors: {
            origin: process.env.ALLOWED_ORIGINS?.split(',') ?? ['http://localhost:4200'],
            credentials: true,
        },
    }),
    __param(1, (0, mongoose_1.InjectModel)(live_quiz_schema_1.LiveQuiz.name)),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        mongoose_2.Model,
        users_service_1.UsersService])
], LiveQuizGateway);
//# sourceMappingURL=live-quiz.gateway.js.map