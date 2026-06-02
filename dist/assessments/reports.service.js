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
const students_service_1 = require("../students/students.service");
let ReportsService = class ReportsService {
    constructor(attemptModel, assessmentModel, studentsService) {
        this.attemptModel = attemptModel;
        this.assessmentModel = assessmentModel;
        this.studentsService = studentsService;
    }
    async getResults(assessmentId, teacherId) {
        const assessment = await this.assessmentModel.findOne({ _id: assessmentId, teacherId: new mongoose_2.Types.ObjectId(teacherId) });
        if (!assessment)
            throw new common_1.NotFoundException('Examen no encontrado');
        const attemptsRaw = await this.attemptModel.find({
            assessmentId: new mongoose_2.Types.ObjectId(assessmentId),
            status: assessment_attempt_schema_1.AttemptStatus.COMPLETED
        })
            .populate('studentId', 'name username email')
            .sort({ startTime: 1 })
            .lean()
            .exec();
        const studentAttemptCounter = new Map();
        const studentBestAttempt = new Map();
        attemptsRaw.forEach(a => {
            if (a.studentId) {
                const sId = a.studentId._id.toString();
                const count = (studentAttemptCounter.get(sId) || 0) + 1;
                studentAttemptCounter.set(sId, count);
                a.attemptNumber = count;
                const currentBest = studentBestAttempt.get(sId);
                if (!currentBest || a.score >= currentBest.score) {
                    studentBestAttempt.set(sId, { id: a._id.toString(), score: a.score });
                }
            }
        });
        attemptsRaw.forEach(a => {
            if (a.studentId) {
                const sId = a.studentId._id.toString();
                const totalAttempts = studentAttemptCounter.get(sId) || 1;
                const bestId = studentBestAttempt.get(sId)?.id;
                a.isHighestScore = (totalAttempts > 1 && a._id.toString() === bestId);
            }
        });
        const attempts = attemptsRaw.sort((a, b) => {
            const nameA = a.studentId?.name?.toLowerCase() || '';
            const nameB = b.studentId?.name?.toLowerCase() || '';
            const nameComparison = nameA.localeCompare(nameB);
            if (nameComparison !== 0) {
                return nameComparison;
            }
            return (a.attemptNumber || 0) - (b.attemptNumber || 0);
        });
        const usernames = attempts.map(a => a.studentId && a.studentId.username).filter(Boolean);
        const studentProfiles = await this.studentsService.findByIdentifiers(usernames);
        const profileMap = new Map();
        studentProfiles.forEach(profile => {
            profileMap.set(profile.identifier, profile.groupId ? profile.groupId['name'] : 'N/A');
        });
        attempts.forEach(attempt => {
            if (attempt.studentId) {
                const username = attempt.studentId.username;
                attempt.studentId.group = profileMap.get(username) || 'N/A';
            }
        });
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
                outOfTime: attempt.outOfTime,
                attemptNumber: attempt.attemptNumber,
                isHighestScore: attempt.isHighestScore
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
    async getAttemptDetail(assessmentId, attemptId, teacherId) {
        const assessment = await this.assessmentModel.findOne({ _id: assessmentId, teacherId: new mongoose_2.Types.ObjectId(teacherId) });
        if (!assessment)
            throw new common_1.NotFoundException('Examen no encontrado');
        const attempt = await this.attemptModel.findOne({
            _id: new mongoose_2.Types.ObjectId(attemptId),
            assessmentId: new mongoose_2.Types.ObjectId(assessmentId),
        }).populate('studentId', 'name username email')
            .populate({
            path: 'assessmentId',
            select: 'startTime endTime teacherId title',
            populate: { path: 'teacherId', select: 'name' }
        })
            .lean()
            .exec();
        if (!attempt)
            throw new common_1.NotFoundException('Intento no encontrado');
        let groupName = 'N/A';
        if (attempt.studentId && attempt.studentId['username']) {
            const studentProfile = await this.studentsService.findByIdentifier(attempt.studentId['username']);
            if (studentProfile && studentProfile.groupId) {
                groupName = studentProfile.groupId['name'] || 'N/A';
            }
        }
        return {
            ...attempt,
            studentGroup: groupName
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
                        const normalizeStr = (str) => (str || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
                        const userAns = normalizeStr(sAns[0]);
                        isCorrect = q.correctAnswers.some(c => normalizeStr(c) === userAns);
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
                { header: 'Grupo', key: 'group', width: 20 },
                { header: 'Email', key: 'email', width: 30 },
                { header: 'Número de Intentos', key: 'attemptsCount', width: 20 }
            ];
            resultsData.results.forEach(r => {
                const student = r.student || {};
                sheet1.addRow({
                    studentName: student.name || 'N/A',
                    identifier: student.username || 'N/A',
                    group: student.group || 'N/A',
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
                { header: 'Grupo', key: 'group', width: 20 },
                { header: 'Email', key: 'email', width: 30 },
                { header: 'Intento', key: 'attemptNumber', width: 15 },
                { header: 'Puntaje', key: 'score', width: 15 },
                { header: 'Porcentaje (%)', key: 'percentage', width: 15 },
                { header: 'Finalizado', key: 'endTime', width: 20 },
                { header: 'Tiempo (min)', key: 'duration', width: 15 },
                { header: 'Estado', key: 'status', width: 15 },
                { header: 'Faltas / AntiTrampas', key: 'warnings', width: 30 }
            ];
            resultsData.results.forEach(r => {
                const student = r.student || {};
                const isApproved = r.percentage >= 70;
                let warningsTxt = 'Sin advertencias';
                if (r.outOfTime || r.isTimeout)
                    warningsTxt = 'Cierre forzado/Exceso de tiempo';
                else if (r.antiCheatLog) {
                    const parts = [];
                    if (r.antiCheatLog.tabSwitches)
                        parts.push(`${r.antiCheatLog.tabSwitches} salidas de app`);
                    if (r.antiCheatLog.fullscreenExits)
                        parts.push(`${r.antiCheatLog.fullscreenExits} capturas`);
                    if (r.antiCheatLog.copyPasteAttempts)
                        parts.push(`${r.antiCheatLog.copyPasteAttempts} intentos de pegado`);
                    if (parts.length > 0)
                        warningsTxt = parts.join(', ');
                }
                sheet1.addRow({
                    studentName: student.name || 'N/A',
                    identifier: student.username || 'N/A',
                    group: student.group || 'N/A',
                    email: student.email || 'N/A',
                    attemptNumber: `#${r.attemptNumber || 1}${r.isHighestScore ? ' (Mejor)' : ''}`,
                    score: `${r.score} / ${r.maxScore}`,
                    percentage: r.percentage,
                    endTime: new Date(r.endTime).toLocaleString('es-ES'),
                    duration: r.durationMinutes,
                    status: isApproved ? 'Aprobado' : 'Reprobado',
                    warnings: warningsTxt
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
        mongoose_2.Model,
        students_service_1.StudentsService])
], ReportsService);
//# sourceMappingURL=reports.service.js.map