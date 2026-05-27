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
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const assessment_attempt_schema_1 = require("../assessment-attempts/assessment-attempt.schema");
const assessment_schema_1 = require("./assessment.schema");
const ExcelJS = require("exceljs");
let ReportsService = class ReportsService {
    constructor(attemptModel, assessmentModel) {
        this.attemptModel = attemptModel;
        this.assessmentModel = assessmentModel;
    }
    async getResults(assessmentId, teacherId) {
        const assessment = await this.assessmentModel.findOne({ _id: assessmentId, teacherId: new mongoose_2.Types.ObjectId(teacherId) });
        if (!assessment)
            throw new common_1.NotFoundException('Examen no encontrado');
        const attempts = await this.attemptModel.find({
            assessmentId: new mongoose_2.Types.ObjectId(assessmentId),
            status: assessment_attempt_schema_1.AttemptStatus.COMPLETED
        })
            .populate('studentId', 'name username email')
            .sort({ score: -1 })
            .exec();
        if (assessment.isSimulator) {
            const studentMap = new Map();
            attempts.filter(a => a.studentId != null).forEach(attempt => {
                const studentObj = attempt.studentId;
                const sId = studentObj._id.toString();
                if (!studentMap.has(sId)) {
                    studentMap.set(sId, {
                        _id: sId,
                        student: studentObj,
                        attemptsCount: 0
                    });
                }
                studentMap.get(sId).attemptsCount++;
            });
            const formattedAttempts = Array.from(studentMap.values());
            return {
                assessment: {
                    title: assessment.title,
                    maxAttempts: assessment.maxAttempts,
                    isSimulator: true
                },
                metrics: {
                    totalRespondieron: formattedAttempts.length,
                    promedio: 0,
                    aprobados: 0
                },
                results: formattedAttempts
            };
        }
        const formattedAttempts = attempts
            .filter(attempt => attempt.studentId != null)
            .map(attempt => {
            const durationMinutes = Math.round((attempt.endTime.getTime() - attempt.startTime.getTime()) / 60000);
            const percentage = attempt.maxScore > 0 ? (attempt.score / attempt.maxScore) * 100 : 0;
            return {
                _id: attempt._id,
                student: attempt.studentId,
                score: attempt.score,
                maxScore: attempt.maxScore,
                percentage: Math.round(percentage * 10) / 10,
                durationMinutes,
                startTime: attempt.startTime,
                endTime: attempt.endTime,
                antiCheatLog: attempt.antiCheatLog,
                isTimeout: attempt.isTimeout,
                outOfTime: attempt.outOfTime
            };
        });
        const totalRespondieron = formattedAttempts.length;
        let promedio = 0;
        let aprobados = 0;
        if (totalRespondieron > 0) {
            const sumPercentage = formattedAttempts.reduce((acc, curr) => acc + curr.percentage, 0);
            promedio = Math.round((sumPercentage / totalRespondieron) * 10) / 10;
            aprobados = formattedAttempts.filter(a => a.percentage >= 70).length;
        }
        return {
            assessment: {
                title: assessment.title,
                maxAttempts: assessment.maxAttempts,
                isSimulator: false
            },
            metrics: {
                totalRespondieron,
                promedio,
                aprobados
            },
            results: formattedAttempts
        };
    }
    async getQuestionAnalytics(assessmentId, teacherId) {
        const assessment = await this.assessmentModel.findOne({ _id: assessmentId, teacherId: new mongoose_2.Types.ObjectId(teacherId) });
        if (!assessment)
            throw new common_1.NotFoundException('Examen no encontrado');
        if (assessment.isSimulator) {
            return [];
        }
        const attempts = await this.attemptModel.find({
            assessmentId: new mongoose_2.Types.ObjectId(assessmentId),
            status: assessment_attempt_schema_1.AttemptStatus.COMPLETED
        })
            .populate('studentId', '_id')
            .exec();
        const validAttempts = attempts.filter(a => a.studentId != null);
        const questionStats = new Map();
        for (const attempt of validAttempts) {
            const studentAnswersMap = new Map();
            attempt.studentAnswers.forEach(sa => studentAnswersMap.set(sa.questionId, sa.answers));
            for (const q of attempt.questionsPulled) {
                if (!questionStats.has(q.questionId)) {
                    questionStats.set(q.questionId, {
                        statement: q.statement,
                        type: q.type,
                        correctCount: 0,
                        totalCount: 0
                    });
                }
                const stats = questionStats.get(q.questionId);
                stats.totalCount++;
                const sAns = studentAnswersMap.get(q.questionId) || [];
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
                        const userAns = sAns[0].toLowerCase().trim();
                        isCorrect = q.correctAnswers.some(c => c.toLowerCase().trim() === userAns);
                    }
                }
                if (isCorrect) {
                    stats.correctCount++;
                }
            }
        }
        const analytics = Array.from(questionStats.values()).map(stats => {
            const percentage = stats.totalCount > 0 ? (stats.correctCount / stats.totalCount) * 100 : 0;
            return {
                statement: stats.statement,
                type: stats.type,
                correctCount: stats.correctCount,
                totalCount: stats.totalCount,
                percentage: Math.round(percentage * 10) / 10
            };
        });
        analytics.sort((a, b) => a.percentage - b.percentage);
        return analytics;
    }
    async exportExcel(assessmentId, teacherId, res) {
        const resultsData = await this.getResults(assessmentId, teacherId);
        const workbook = new ExcelJS.Workbook();
        if (resultsData.assessment.isSimulator) {
            const sheet1 = workbook.addWorksheet('Simulador - Intentos');
            sheet1.columns = [
                { header: 'Estudiante', key: 'studentName', width: 30 },
                { header: 'Cédula/Código', key: 'identifier', width: 20 },
                { header: 'Email', key: 'email', width: 30 },
                { header: 'Número de Intentos', key: 'attemptsCount', width: 20 }
            ];
            resultsData.results.forEach(r => {
                const student = r.student || {};
                sheet1.addRow({
                    studentName: student.name || 'N/A',
                    identifier: student.username || 'N/A',
                    email: student.email || 'N/A',
                    attemptsCount: r.attemptsCount
                });
            });
        }
        else {
            const analyticsData = await this.getQuestionAnalytics(assessmentId, teacherId);
            const sheet1 = workbook.addWorksheet('Calificaciones');
            sheet1.columns = [
                { header: 'Estudiante', key: 'studentName', width: 30 },
                { header: 'Cédula/Código', key: 'identifier', width: 20 },
                { header: 'Email', key: 'email', width: 30 },
                { header: 'Puntaje', key: 'score', width: 15 },
                { header: 'Porcentaje (%)', key: 'percentage', width: 15 },
                { header: 'Tiempo (min)', key: 'duration', width: 15 },
                { header: 'Estado', key: 'status', width: 15 }
            ];
            resultsData.results.forEach(r => {
                const student = r.student || {};
                sheet1.addRow({
                    studentName: student.name || 'N/A',
                    identifier: student.username || 'N/A',
                    email: student.email || 'N/A',
                    score: r.score,
                    percentage: r.percentage,
                    duration: r.durationMinutes,
                    status: r.percentage >= 70 ? 'Aprobado' : 'Reprobado'
                });
            });
            const sheet2 = workbook.addWorksheet('Análisis por Pregunta');
            sheet2.columns = [
                { header: 'Enunciado', key: 'statement', width: 60 },
                { header: 'Tipo', key: 'type', width: 20 },
                { header: 'Aciertos', key: 'correct', width: 15 },
                { header: 'Total', key: 'total', width: 15 },
                { header: '% Acierto', key: 'percentage', width: 15 }
            ];
            analyticsData.forEach(a => {
                sheet2.addRow({
                    statement: a.statement,
                    type: a.type,
                    correct: a.correctCount,
                    total: a.totalCount,
                    percentage: a.percentage
                });
            });
        }
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=resultados_${assessmentId}.xlsx`);
        await workbook.xlsx.write(res);
        res.end();
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(assessment_attempt_schema_1.AssessmentAttempt.name)),
    __param(1, (0, mongoose_1.InjectModel)(assessment_schema_1.Assessment.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], ReportsService);
//# sourceMappingURL=reports.service.js.map