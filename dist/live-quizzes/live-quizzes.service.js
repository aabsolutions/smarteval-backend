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
exports.LiveQuizzesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const live_quiz_schema_1 = require("./schemas/live-quiz.schema");
const question_schema_1 = require("../questions/question.schema");
let LiveQuizzesService = class LiveQuizzesService {
    constructor(liveQuizModel, questionModel) {
        this.liveQuizModel = liveQuizModel;
        this.questionModel = questionModel;
    }
    async create(createDto, teacherId) {
        const pin = await this.generateUniquePin();
        const createdQuiz = new this.liveQuizModel({
            ...createDto,
            teacherId: new mongoose_2.Types.ObjectId(teacherId),
            pin,
            status: live_quiz_schema_1.LiveQuizStatus.DRAFT,
            participants: [],
            answers: [],
            currentQuestionIndex: -1,
            groupIds: createDto.groupIds ? createDto.groupIds.map(id => new mongoose_2.Types.ObjectId(id)) : [],
        });
        return createdQuiz.save();
    }
    async findAllByTeacher(teacherId) {
        return this.liveQuizModel.find({ teacherId: new mongoose_2.Types.ObjectId(teacherId) }).sort({ createdAt: -1 }).exec();
    }
    async findOne(id) {
        const quiz = await this.liveQuizModel.findById(id).populate('groupIds').exec();
        if (!quiz) {
            throw new common_1.NotFoundException(`Quiz con ID ${id} no encontrado`);
        }
        return quiz;
    }
    async findOneByTeacher(id, teacherId) {
        const quiz = await this.findOne(id);
        if (quiz.teacherId.toString() !== teacherId) {
            throw new common_1.ForbiddenException('No tienes permiso para acceder a este quiz');
        }
        return quiz;
    }
    async findByPin(pin) {
        const quiz = await this.liveQuizModel.findOne({ pin, status: { $ne: live_quiz_schema_1.LiveQuizStatus.FINISHED } }).exec();
        if (!quiz) {
            throw new common_1.NotFoundException(`Quiz con PIN ${pin} no encontrado o ya finalizó`);
        }
        return quiz;
    }
    async update(id, updateDto, teacherId) {
        const quiz = await this.findOneByTeacher(id, teacherId);
        if (quiz.status !== live_quiz_schema_1.LiveQuizStatus.DRAFT) {
            throw new common_1.BadRequestException('Solo se pueden actualizar quizzes en estado DRAFT');
        }
        Object.assign(quiz, updateDto);
        if (updateDto.groupIds) {
            quiz.groupIds = updateDto.groupIds.map(gid => new mongoose_2.Types.ObjectId(gid));
        }
        return quiz.save();
    }
    async delete(id, teacherId) {
        const quiz = await this.findOneByTeacher(id, teacherId);
        await this.liveQuizModel.deleteOne({ _id: id }).exec();
    }
    async importQuestionsFromBank(quizId, dto, teacherId) {
        const quiz = await this.findOneByTeacher(quizId, teacherId);
        if (quiz.status !== live_quiz_schema_1.LiveQuizStatus.DRAFT) {
            throw new common_1.BadRequestException('Solo se pueden importar preguntas en estado DRAFT');
        }
        const questionsFromBank = await this.questionModel.find({
            _id: { $in: dto.questionIds.map(id => new mongoose_2.Types.ObjectId(id)) },
            teacherId: new mongoose_2.Types.ObjectId(teacherId)
        }).exec();
        const importedQuestions = questionsFromBank.map(q => ({
            questionId: q._id.toString(),
            type: q.type,
            statement: q.statement,
            options: q.options,
            correctAnswers: q.correctAnswers,
            points: q.points,
            imageUrl: q.imageUrl,
            timeLimitSeconds: dto.defaultTimeLimitSeconds
        }));
        quiz.questions.push(...importedQuestions);
        return quiz.save();
    }
    async generateUniquePin() {
        let pin;
        let exists = true;
        while (exists) {
            pin = Math.floor(100000 + Math.random() * 900000).toString();
            const existing = await this.liveQuizModel.findOne({
                pin,
                status: { $nin: [live_quiz_schema_1.LiveQuizStatus.FINISHED] },
            }).exec();
            exists = !!existing;
        }
        return pin;
    }
};
exports.LiveQuizzesService = LiveQuizzesService;
exports.LiveQuizzesService = LiveQuizzesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(live_quiz_schema_1.LiveQuiz.name)),
    __param(1, (0, mongoose_1.InjectModel)(question_schema_1.Question.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], LiveQuizzesService);
//# sourceMappingURL=live-quizzes.service.js.map