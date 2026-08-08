import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { LiveQuiz } from './schemas/live-quiz.schema';
import { UsersService } from '../users/users.service';
export declare class LiveQuizGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private jwtService;
    private liveQuizModel;
    private usersService;
    server: Server;
    private connectedUsers;
    private questionTimers;
    private currentQuestionAnswers;
    constructor(jwtService: JwtService, liveQuizModel: Model<LiveQuiz>, usersService: UsersService);
    private getUser;
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): void;
    handleOpenLobby(client: Socket, { quizId }: {
        quizId: string;
    }): Promise<boolean>;
    handleStartQuiz(client: Socket, { quizId }: {
        quizId: string;
    }): Promise<void>;
    handleNextQuestion(client: Socket, { quizId }: {
        quizId: string;
    }): Promise<void>;
    handleShowPodium(client: Socket, { quizId }: {
        quizId: string;
    }): Promise<void>;
    handleStudentJoin(client: Socket, { pin }: {
        pin: string;
    }): Promise<boolean>;
    handleStudentAnswer(client: Socket, { quizId, questionIndex, answers, responseTimeMs }: {
        quizId: string;
        questionIndex: number;
        answers: string[];
        responseTimeMs: number;
    }): Promise<void>;
    private sendQuestion;
    private startQuestionTimer;
    private cancelTimer;
    private handleTimerExpired;
    private showPodium;
}
