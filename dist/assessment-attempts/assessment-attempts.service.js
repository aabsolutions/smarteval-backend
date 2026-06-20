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
exports.AssessmentAttemptsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const assessment_attempt_schema_1 = require("./assessment-attempt.schema");
const assessment_schema_1 = require("../assessments/assessment.schema");
const question_schema_1 = require("../questions/question.schema");
const late_request_schema_1 = require("../late-requests/late-request.schema");
let AssessmentAttemptsService = class AssessmentAttemptsService {
    constructor(attemptModel, assessmentModel, questionModel, lateRequestModel) {
        this.attemptModel = attemptModel;
        this.assessmentModel = assessmentModel;
        this.questionModel = questionModel;
        this.lateRequestModel = lateRequestModel;
    }
    sanitizeAttempt(attempt) {
        const attemptObj = attempt.toObject ? attempt.toObject() : attempt;
        if (attemptObj.status !== assessment_attempt_schema_1.AttemptStatus.COMPLETED) {
            if (attemptObj.questionsPulled) {
                attemptObj.questionsPulled.forEach(q => {
                    delete q.correctAnswers;
                });
            }
        }
        return attemptObj;
    }
    async startAttempt(assessmentId, studentId) {
        const assessment = await this.assessmentModel.findById(assessmentId);
        if (!assessment)
            throw new common_1.NotFoundException('Assessment not found');
        const now = new Date();
        if (now < assessment.startTime) {
            throw new common_1.BadRequestException('El examen aún no ha comenzado, revisa la fecha y hora de inicio.');
        }
        const approvedRequest = await this.lateRequestModel.findOne({
            assessmentId: new mongoose_2.Types.ObjectId(assessmentId),
            studentId: new mongoose_2.Types.ObjectId(studentId),
            status: late_request_schema_1.LateRequestStatus.APROBADA
        });
        const isLateStudent = !!approvedRequest;
        if (!isLateStudent && now > assessment.endTime) {
            throw new common_1.BadRequestException('El plazo para rendir este examen ya ha finalizado.');
        }
        if (isLateStudent && approvedRequest.extensionUntil && now > approvedRequest.extensionUntil) {
            throw new common_1.BadRequestException('El plazo de tu extensión para rendir este examen ha expirado.');
        }
        const inProgress = await this.attemptModel.findOne({
            assessmentId: new mongoose_2.Types.ObjectId(assessmentId),
            studentId: new mongoose_2.Types.ObjectId(studentId),
            status: assessment_attempt_schema_1.AttemptStatus.IN_PROGRESS
        });
        if (inProgress) {
            return inProgress;
        }
        const previousAttempts = await this.attemptModel.countDocuments({
            assessmentId: new mongoose_2.Types.ObjectId(assessmentId),
            studentId: new mongoose_2.Types.ObjectId(studentId),
            isArchived: { $ne: true }
        });
        if (previousAttempts >= assessment.maxAttempts) {
            throw new common_1.BadRequestException(`Ya has alcanzado el máximo de intentos (${assessment.maxAttempts})`);
        }
        const pipeline = [
            { $match: { topicId: assessment.topicId } },
            { $sample: { size: assessment.totalQuestionsToPull } }
        ];
        const randomQuestions = await this.questionModel.aggregate(pipeline);
        if (randomQuestions.length === 0) {
            throw new common_1.BadRequestException('No hay preguntas disponibles en este tema para armar el examen');
        }
        let maxScore = 0;
        const snapshotQuestions = randomQuestions.map(q => {
            maxScore += q.points || 1;
            let options = q.options || [];
            let correctAnswers = q.correctAnswers || [];
            if (assessment.shuffleOptions && options.length > 0) {
                if (q.type !== 'matching') {
                    options = [...options].sort(() => Math.random() - 0.5);
                }
            }
            let matchingOptions = [];
            if (q.type === 'matching' && correctAnswers.length > 0) {
                matchingOptions = [...correctAnswers];
                for (let i = matchingOptions.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    const temp = matchingOptions[i];
                    matchingOptions[i] = matchingOptions[j];
                    matchingOptions[j] = temp;
                }
            }
            return {
                questionId: q._id.toString(),
                type: q.type,
                statement: q.statement,
                options: options,
                correctAnswers: correctAnswers,
                matchingOptions: matchingOptions,
                points: q.points || 1,
                imageUrl: q.imageUrl
            };
        });
        const newAttempt = new this.attemptModel({
            assessmentId: new mongoose_2.Types.ObjectId(assessmentId),
            studentId: new mongoose_2.Types.ObjectId(studentId),
            startTime: now,
            status: assessment_attempt_schema_1.AttemptStatus.IN_PROGRESS,
            questionsPulled: snapshotQuestions,
            maxScore: maxScore
        });
        const savedAttempt = await newAttempt.save();
        return this.sanitizeAttempt(savedAttempt);
    }
    async submitAttempt(attemptId, studentId, studentAnswers, antiCheatLog, isTimeout) {
        const attempt = await this.attemptModel.findOne({ _id: attemptId, studentId: new mongoose_2.Types.ObjectId(studentId) }).populate('assessmentId');
        if (!attempt)
            throw new common_1.NotFoundException('Attempt not found');
        if (attempt.status === assessment_attempt_schema_1.AttemptStatus.COMPLETED) {
            throw new common_1.BadRequestException('This attempt is already submitted');
        }
        const assessment = attempt.assessmentId;
        const now = new Date();
        let outOfTime = false;
        if (assessment.durationMinutes) {
            const allowedTimeMs = (assessment.durationMinutes + 5) * 60 * 1000;
            const timeTakenMs = now.getTime() - attempt.startTime.getTime();
            if (timeTakenMs > allowedTimeMs) {
                outOfTime = true;
            }
        }
        let score = 0;
        const answersMap = new Map();
        studentAnswers.forEach(sa => answersMap.set(sa.questionId, sa.answers));
        attempt.questionsPulled.forEach(q => {
            const sAns = answersMap.get(q.questionId) || [];
            let isCorrect = false;
            if (q.type === 'single-choice' || q.type === 'true-false') {
                if (sAns.length > 0 && q.correctAnswers.length > 0 && sAns[0] === q.correctAnswers[0]) {
                    isCorrect = true;
                }
            }
            else if (q.type === 'multiple-choice') {
                if (sAns.length === q.correctAnswers.length) {
                    const sortedS = [...sAns].sort();
                    const sortedC = [...q.correctAnswers].sort();
                    isCorrect = sortedS.every((val, index) => val === sortedC[index]);
                }
            }
            else if (q.type === 'fill-blank') {
                if (sAns.length > 0) {
                    const normalizeStr = (str) => (str || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
                    const userAns = normalizeStr(sAns[0]);
                    isCorrect = q.correctAnswers.some(c => normalizeStr(c) === userAns);
                }
            }
            else if (q.type === 'matching') {
                let correctPairs = 0;
                const totalPairs = q.correctAnswers.length;
                for (let i = 0; i < totalPairs; i++) {
                    if (sAns[i] && sAns[i] === q.correctAnswers[i]) {
                        correctPairs++;
                    }
                }
                if (correctPairs > 0) {
                    score += (correctPairs / totalPairs) * q.points;
                    if (correctPairs === totalPairs) {
                        isCorrect = true;
                    }
                }
            }
            if (isCorrect && q.type !== 'matching') {
                score += q.points;
            }
        });
        attempt.studentAnswers = studentAnswers;
        attempt.score = score;
        attempt.status = assessment_attempt_schema_1.AttemptStatus.COMPLETED;
        attempt.endTime = now;
        if (antiCheatLog)
            attempt.antiCheatLog = antiCheatLog;
        if (isTimeout)
            attempt.isTimeout = true;
        if (outOfTime)
            attempt.outOfTime = true;
        return attempt.save();
    }
    async getAttemptStatus(assessmentId, studentId) {
        const attempts = await this.attemptModel.find({
            assessmentId: new mongoose_2.Types.ObjectId(assessmentId),
            studentId: new mongoose_2.Types.ObjectId(studentId),
            isArchived: { $ne: true }
        }).sort({ createdAt: -1 }).exec();
        return {
            attemptsCount: attempts.length,
            history: attempts.map(a => this.sanitizeAttempt(a))
        };
    }
    async getAttemptsByAssessment(assessmentId, studentId) {
        return this.attemptModel.find({
            assessmentId: new mongoose_2.Types.ObjectId(assessmentId),
            studentId: new mongoose_2.Types.ObjectId(studentId),
            isArchived: { $ne: true }
        }).sort({ createdAt: -1 }).exec();
    }
    async removeAllForStudent(studentId) {
        return this.attemptModel.deleteMany({ studentId: new mongoose_2.Types.ObjectId(studentId) }).exec();
    }
    async getAttemptDetails(attemptId, studentId) {
        const attempt = await this.attemptModel.findOne({ _id: attemptId, studentId: new mongoose_2.Types.ObjectId(studentId) }).populate('assessmentId');
        if (!attempt)
            throw new common_1.NotFoundException('Attempt not found');
        return this.sanitizeAttempt(attempt);
    }
    async archiveAttempt(attemptId) {
        const attempt = await this.attemptModel.findById(attemptId);
        if (!attempt)
            throw new common_1.NotFoundException('Attempt not found');
        attempt.isArchived = true;
        return attempt.save();
    }
    async getArchivedAttempts(assessmentId) {
        return this.attemptModel.find({
            assessmentId: new mongoose_2.Types.ObjectId(assessmentId),
            isArchived: true
        }).populate('studentId', 'name username email group').sort({ createdAt: -1 }).exec();
    }
};
exports.AssessmentAttemptsService = AssessmentAttemptsService;
exports.AssessmentAttemptsService = AssessmentAttemptsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(assessment_attempt_schema_1.AssessmentAttempt.name)),
    __param(1, (0, mongoose_1.InjectModel)(assessment_schema_1.Assessment.name)),
    __param(2, (0, mongoose_1.InjectModel)(question_schema_1.Question.name)),
    __param(3, (0, mongoose_1.InjectModel)(late_request_schema_1.LateRequest.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], AssessmentAttemptsService);
//# sourceMappingURL=assessment-attempts.service.js.map