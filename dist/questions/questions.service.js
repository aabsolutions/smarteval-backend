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
exports.QuestionsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const question_schema_1 = require("./question.schema");
let QuestionsService = class QuestionsService {
    constructor(questionModel) {
        this.questionModel = questionModel;
    }
    validateMatchingQuestion(type, options, correctAnswers) {
        if (type === question_schema_1.QuestionType.MATCHING) {
            if (!options || !correctAnswers || options.length !== correctAnswers.length) {
                throw new common_1.BadRequestException('Matching questions require options and correctAnswers to have the same length.');
            }
            if (options.length < 3) {
                throw new common_1.BadRequestException('Matching questions require at least 3 pairs.');
            }
        }
    }
    async create(createQuestionDto, teacherId) {
        this.validateMatchingQuestion(createQuestionDto.type, createQuestionDto.options, createQuestionDto.correctAnswers);
        const createdQuestion = new this.questionModel({
            ...createQuestionDto,
            topicId: new mongoose_2.Types.ObjectId(createQuestionDto.topicId),
            teacherId: new mongoose_2.Types.ObjectId(teacherId),
        });
        return createdQuestion.save();
    }
    async createBulk(questions, teacherId) {
        questions.forEach(q => this.validateMatchingQuestion(q.type, q.options, q.correctAnswers));
        const questionsToInsert = questions.map(q => ({
            ...q,
            topicId: new mongoose_2.Types.ObjectId(q.topicId),
            teacherId: new mongoose_2.Types.ObjectId(teacherId),
        }));
        return this.questionModel.insertMany(questionsToInsert);
    }
    async findAllByTeacher(teacherId, topicId) {
        const filter = { teacherId: new mongoose_2.Types.ObjectId(teacherId) };
        if (topicId) {
            filter.topicId = new mongoose_2.Types.ObjectId(topicId);
        }
        return this.questionModel.find(filter).populate('topicId', 'name').exec();
    }
    async findOne(id, teacherId) {
        const question = await this.questionModel.findOne({ _id: id, teacherId: new mongoose_2.Types.ObjectId(teacherId) }).populate('topicId', 'name').exec();
        if (!question) {
            throw new common_1.NotFoundException(`Question #${id} not found or unauthorized`);
        }
        return question;
    }
    async update(id, updateQuestionDto, teacherId) {
        if (updateQuestionDto.type === question_schema_1.QuestionType.MATCHING || updateQuestionDto.options || updateQuestionDto.correctAnswers) {
            if (updateQuestionDto.type === question_schema_1.QuestionType.MATCHING) {
                this.validateMatchingQuestion(updateQuestionDto.type, updateQuestionDto.options, updateQuestionDto.correctAnswers);
            }
        }
        const dataToUpdate = { ...updateQuestionDto };
        if (dataToUpdate.topicId) {
            dataToUpdate.topicId = new mongoose_2.Types.ObjectId(dataToUpdate.topicId);
        }
        const updatedQuestion = await this.questionModel
            .findOneAndUpdate({ _id: id, teacherId: new mongoose_2.Types.ObjectId(teacherId) }, dataToUpdate, { new: true })
            .exec();
        if (!updatedQuestion) {
            throw new common_1.NotFoundException(`Question #${id} not found or unauthorized`);
        }
        return updatedQuestion;
    }
    async remove(id, teacherId) {
        const deletedQuestion = await this.questionModel
            .findOneAndDelete({ _id: id, teacherId: new mongoose_2.Types.ObjectId(teacherId) })
            .exec();
        if (!deletedQuestion) {
            throw new common_1.NotFoundException(`Question #${id} not found or unauthorized`);
        }
        return deletedQuestion;
    }
};
exports.QuestionsService = QuestionsService;
exports.QuestionsService = QuestionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(question_schema_1.Question.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], QuestionsService);
//# sourceMappingURL=questions.service.js.map