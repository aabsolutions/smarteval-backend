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
exports.TopicsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const topic_schema_1 = require("./topic.schema");
let TopicsService = class TopicsService {
    constructor(topicModel) {
        this.topicModel = topicModel;
    }
    async create(createTopicDto, teacherId) {
        const createdTopic = new this.topicModel({
            ...createTopicDto,
            teacherId: new mongoose_2.Types.ObjectId(teacherId),
        });
        return createdTopic.save();
    }
    async findAllByTeacher(teacherId) {
        return this.topicModel.find({ teacherId: new mongoose_2.Types.ObjectId(teacherId) }).exec();
    }
    async findOne(id, teacherId) {
        const topic = await this.topicModel.findOne({ _id: id, teacherId: new mongoose_2.Types.ObjectId(teacherId) }).exec();
        if (!topic) {
            throw new common_1.NotFoundException(`Topic #${id} not found or unauthorized`);
        }
        return topic;
    }
    async update(id, updateTopicDto, teacherId) {
        const updatedTopic = await this.topicModel
            .findOneAndUpdate({ _id: id, teacherId: new mongoose_2.Types.ObjectId(teacherId) }, updateTopicDto, { new: true })
            .exec();
        if (!updatedTopic) {
            throw new common_1.NotFoundException(`Topic #${id} not found or unauthorized`);
        }
        return updatedTopic;
    }
    async remove(id, teacherId) {
        const deletedTopic = await this.topicModel
            .findOneAndDelete({ _id: id, teacherId: new mongoose_2.Types.ObjectId(teacherId) })
            .exec();
        if (!deletedTopic) {
            throw new common_1.NotFoundException(`Topic #${id} not found or unauthorized`);
        }
        return deletedTopic;
    }
};
exports.TopicsService = TopicsService;
exports.TopicsService = TopicsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(topic_schema_1.Topic.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], TopicsService);
//# sourceMappingURL=topics.service.js.map