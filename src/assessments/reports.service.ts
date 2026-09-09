import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AssessmentAttempt, AssessmentAttemptDocument, AttemptStatus } from '../assessment-attempts/assessment-attempt.schema';
import { Assessment, AssessmentDocument } from './assessment.schema';
import * as ExcelJS from 'exceljs';
import { Response } from 'express';
import { StudentsService } from '../students/students.service';

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(AssessmentAttempt.name) private attemptModel: Model<AssessmentAttemptDocument>,
    @InjectModel(Assessment.name) private assessmentModel: Model<AssessmentDocument>,
    private studentsService: StudentsService,
  ) {}

  async getResults(assessmentId: string, teacherId: string) {
    const assessment = await this.assessmentModel.findOne({ _id: assessmentId, teacherId: new Types.ObjectId(teacherId) });
    if (!assessment) throw new NotFoundException('Examen no encontrado');

    const attemptsRaw = await this.attemptModel.find({
      assessmentId: new Types.ObjectId(assessmentId),
      status: { $in: [AttemptStatus.COMPLETED, AttemptStatus.PAPER_PENDING] },
      isArchived: { $ne: true }
    })
    .populate('studentId', 'name username email')
    .sort({ startTime: 1 })
    .lean()
    .exec();

    const studentAttemptCounter = new Map<string, number>();
    const studentBestAttempt = new Map<string, { id: string, score: number }>();

    attemptsRaw.forEach(a => {
      if (a.studentId) {
        const sId = (a.studentId as any)._id.toString();
        const count = (studentAttemptCounter.get(sId) || 0) + 1;
        studentAttemptCounter.set(sId, count);
        (a as any).attemptNumber = count;

        const currentBest = studentBestAttempt.get(sId);
        if (!currentBest || a.score >= currentBest.score) {
          // In case of tie, later attempt wins because attemptsRaw is chronologically sorted
          studentBestAttempt.set(sId, { id: a._id.toString(), score: a.score });
        }
      }
    });

    attemptsRaw.forEach(a => {
      if (a.studentId) {
        const sId = (a.studentId as any)._id.toString();
        const totalAttempts = studentAttemptCounter.get(sId) || 1;
        const bestId = studentBestAttempt.get(sId)?.id;
        (a as any).isHighestScore = (totalAttempts > 1 && a._id.toString() === bestId);
      }
    });

    const attempts = attemptsRaw.sort((a, b) => {
      const nameA = (a.studentId as any)?.name?.toLowerCase() || '';
      const nameB = (b.studentId as any)?.name?.toLowerCase() || '';
      const nameComparison = nameA.localeCompare(nameB);
      if (nameComparison !== 0) {
        return nameComparison;
      }
      return ((a as any).attemptNumber || 0) - ((b as any).attemptNumber || 0);
    });

    // Fetch groups for students
    const usernames = attempts.map(a => a.studentId && (a.studentId as any).username).filter(Boolean);
    const studentProfiles = await this.studentsService.findByIdentifiers(usernames);
    const profileMap = new Map();
    studentProfiles.forEach(profile => {
      profileMap.set(profile.identifier, profile.groupId ? profile.groupId['name'] : 'N/A');
    });

    // Mutate attempts to inject group into student
    attempts.forEach(attempt => {
      if (attempt.studentId) {
        const username = (attempt.studentId as any).username;
        (attempt.studentId as any).group = profileMap.get(username) || 'N/A';
      }
    });

    if (assessment.isSimulator) {
      const studentMap = new Map();
      
      attempts.filter(a => a.studentId != null).forEach(attempt => {
        const studentObj: any = attempt.studentId;
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
      .filter(attempt => attempt.studentId != null) // Ignorar registros huérfanos
      .map(attempt => {
        const hasFinished = !!attempt.endTime;
        const durationMinutes = hasFinished ? Math.round((attempt.endTime.getTime() - attempt.startTime.getTime()) / 60000) : 0;
        const percentage = attempt.maxScore > 0 ? (attempt.score / attempt.maxScore) * 100 : 0;
        return {
          _id: attempt._id,
          student: attempt.studentId,
          score: attempt.score || 0,
          maxScore: attempt.maxScore,
          percentage: Math.round(percentage * 10) / 10,
          durationMinutes,
          startTime: attempt.startTime,
          endTime: attempt.endTime || null,
          status: attempt.status,
          source: attempt.source,
          antiCheatLog: attempt.antiCheatLog,
          isTimeout: attempt.isTimeout,
          outOfTime: attempt.outOfTime,
          attemptNumber: (attempt as any).attemptNumber,
          isHighestScore: (attempt as any).isHighestScore
        };
      });

    const totalRespondieron = formattedAttempts.length;
    let promedio = 0;
    let aprobados = 0;

    if (totalRespondieron > 0) {
      const sumPercentage = formattedAttempts.reduce((acc, curr) => acc + curr.percentage, 0);
      promedio = Math.round((sumPercentage / totalRespondieron) * 10) / 10;
      aprobados = formattedAttempts.filter(a => a.percentage >= 70).length; // Pass mark 70%
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

  async getTeacherSummary(teacherId: string) {
    const teacherObjectId = new Types.ObjectId(teacherId);
    const now = new Date();

    const assessments = await this.assessmentModel
      .find({ teacherId: teacherObjectId, isArchived: { $ne: true } })
      .sort({ startTime: -1 })
      .lean()
      .exec();

    const assessmentIds = assessments.map(a => a._id);

    const attempts = await this.attemptModel
      .find({
        assessmentId: { $in: assessmentIds },
        status: { $in: [AttemptStatus.COMPLETED, AttemptStatus.PAPER_PENDING] },
        isArchived: { $ne: true },
      })
      .populate('studentId', 'name')
      .lean()
      .exec();

    const validAttempts = attempts.filter(a => a.studentId != null && a.maxScore > 0);
    const percentages = validAttempts.map(a => (a.score / a.maxScore) * 100);

    const totalAttempts = validAttempts.length;
    const averageScorePercentage = totalAttempts > 0
      ? Math.round((percentages.reduce((s, p) => s + p, 0) / totalAttempts) * 10) / 10
      : 0;
    const approvalRate = totalAttempts > 0
      ? Math.round((percentages.filter(p => p >= 70).length / totalAttempts) * 1000) / 10
      : 0;

    const activeAssessments = assessments.filter(a => a.isActive && a.startTime <= now && a.endTime >= now).length;

    // Ranking por estudiante: promedio de porcentaje entre todos sus intentos completados.
    const byStudent = new Map<string, { name: string; sum: number; count: number }>();
    for (const a of validAttempts) {
      const student: any = a.studentId;
      const id = student._id.toString();
      const entry = byStudent.get(id) || { name: student.name || 'N/A', sum: 0, count: 0 };
      entry.sum += (a.score / a.maxScore) * 100;
      entry.count += 1;
      byStudent.set(id, entry);
    }
    const rankedStudents = Array.from(byStudent.entries())
      .map(([studentId, e]) => ({
        studentId,
        name: e.name,
        averagePercentage: Math.round((e.sum / e.count) * 10) / 10,
        attemptsCount: e.count,
      }))
      .sort((a, b) => b.averagePercentage - a.averagePercentage);

    const topStudents = rankedStudents.slice(0, 5);
    // Estudiantes que necesitan apoyo: los de menor promedio, por debajo de la nota de aprobación (70%).
    const studentsNeedingSupport = rankedStudents
      .filter(s => s.averagePercentage < 70)
      .slice(-5)
      .reverse();

    // Tendencia: promedio por evaluación, para las últimas evaluaciones con al menos un intento.
    const byAssessment = new Map<string, { title: string; startTime: Date; sum: number; count: number }>();
    for (const a of validAttempts) {
      const aId = a.assessmentId.toString();
      const assessment = assessments.find(x => x._id.toString() === aId);
      if (!assessment) continue;
      const entry = byAssessment.get(aId) || { title: assessment.title, startTime: assessment.startTime, sum: 0, count: 0 };
      entry.sum += (a.score / a.maxScore) * 100;
      entry.count += 1;
      byAssessment.set(aId, entry);
    }
    const scoreTrend = Array.from(byAssessment.entries())
      .map(([assessmentId, e]) => ({
        assessmentId,
        title: e.title,
        averagePercentage: Math.round((e.sum / e.count) * 10) / 10,
        date: e.startTime,
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(-6);

    const recentAssessments = assessments.slice(0, 5).map(a => {
      let status: 'scheduled' | 'active' | 'closed' = 'closed';
      if (a.startTime > now) status = 'scheduled';
      else if (a.isActive && a.endTime >= now) status = 'active';

      return {
        id: a._id,
        title: a.title,
        status,
        startTime: a.startTime,
        endTime: a.endTime,
      };
    });

    return {
      totalAssessments: assessments.length,
      activeAssessments,
      totalAttempts,
      averageScorePercentage,
      approvalRate,
      scoreTrend,
      topStudents,
      studentsNeedingSupport,
      recentAssessments,
    };
  }

  async getAttemptDetail(assessmentId: string, attemptId: string, teacherId: string): Promise<any> {
    const assessment = await this.assessmentModel.findOne({ _id: assessmentId, teacherId: new Types.ObjectId(teacherId) });
    if (!assessment) throw new NotFoundException('Examen no encontrado');

    const attempt = await this.attemptModel.findOne({
      _id: new Types.ObjectId(attemptId),
      assessmentId: new Types.ObjectId(assessmentId),
    }).populate('studentId', 'name username email')
      .populate({
        path: 'assessmentId',
        select: 'startTime endTime teacherId title',
        populate: { path: 'teacherId', select: 'name' }
      })
      .lean()
      .exec();

    if (!attempt) throw new NotFoundException('Intento no encontrado');

    // Resolve student group
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

  async getQuestionAnalytics(assessmentId: string, teacherId: string) {
    const assessment = await this.assessmentModel.findOne({ _id: assessmentId, teacherId: new Types.ObjectId(teacherId) });
    if (!assessment) throw new NotFoundException('Examen no encontrado');
    
    if (assessment.isSimulator) {
      return [];
    }

    const attempts = await this.attemptModel.find({
      assessmentId: new Types.ObjectId(assessmentId),
      status: AttemptStatus.COMPLETED,
      isArchived: { $ne: true }
    })
    .populate('studentId', '_id') // Para poder identificar si el usuario fue eliminado
    .exec();

    const validAttempts = attempts.filter(a => a.studentId != null);

    const questionStats = new Map<string, { statement: string, type: string, correctCount: number, totalCount: number }>();

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
        
        const stats = questionStats.get(q.questionId)!;
        stats.totalCount++;

        const sAns = studentAnswersMap.get(q.questionId) || [];
        let isCorrect = false;

        if (q.type === 'single-choice' || q.type === 'true-false') {
          if (sAns.length > 0 && q.correctAnswers.length > 0 && sAns[0] === q.correctAnswers[0]) {
            isCorrect = true;
          }
        } else if (q.type === 'multiple-choice') {
          if (sAns.length === q.correctAnswers.length) {
            const sortedS = [...sAns].sort();
            const sortedC = [...q.correctAnswers].sort();
            isCorrect = sortedS.every((val, index) => val === sortedC[index]);
          }
        } else if (q.type === 'fill-blank') {
          if (sAns.length > 0) {
            const normalizeStr = (str: string) => (str || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
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

    // Ordenar de menor a mayor porcentaje (las más difíciles primero)
    analytics.sort((a, b) => a.percentage - b.percentage);

    return analytics;
  }

  async exportExcel(assessmentId: string, teacherId: string, res: Response) {
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
          const student: any = r.student || {};
          sheet1.addRow({
            studentName: student.name || 'N/A',
            identifier: student.username || 'N/A',
            group: student.group || 'N/A',
            email: student.email || 'N/A',
            attemptsCount: r.attemptsCount
          });
        });
    } else {
      const analyticsData = await this.getQuestionAnalytics(assessmentId, teacherId);
        // Hoja 1: Calificaciones
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
          const student: any = r.student || {};
          const isApproved = r.percentage >= 70;
          
          let warningsTxt = 'Sin advertencias';
          if (r.outOfTime || r.isTimeout) warningsTxt = 'Cierre forzado/Exceso de tiempo';
          else if (r.antiCheatLog) {
            const parts = [];
            if (r.antiCheatLog.tabSwitches) parts.push(`${r.antiCheatLog.tabSwitches} salidas de app`);
            if (r.antiCheatLog.fullscreenExits) parts.push(`${r.antiCheatLog.fullscreenExits} capturas`);
            if (r.antiCheatLog.copyPasteAttempts) parts.push(`${r.antiCheatLog.copyPasteAttempts} intentos de pegado`);
            if (parts.length > 0) warningsTxt = parts.join(', ');
          }

          sheet1.addRow({
            studentName: student.name || 'N/A',
            identifier: student.username || 'N/A',
            group: student.group || 'N/A',
            email: student.email || 'N/A',
            attemptNumber: `#${r.attemptNumber || 1}${r.isHighestScore ? ' (Mejor)' : ''}`,
            score: r.score,
            percentage: r.percentage,
            endTime: new Date(r.endTime).toLocaleString('es-ES'),
            duration: r.durationMinutes,
            status: isApproved ? 'Aprobado' : 'Reprobado',
            warnings: warningsTxt
          });
        });

      // Hoja 2: Análisis por Pregunta
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

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=resultados_${assessmentId}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  }
}
