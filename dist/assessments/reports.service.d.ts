import { Model } from 'mongoose';
import { AssessmentAttemptDocument } from '../assessment-attempts/assessment-attempt.schema';
import { AssessmentDocument } from './assessment.schema';
import { Response } from 'express';
import { StudentsService } from '../students/students.service';
export declare class ReportsService {
    private attemptModel;
    private assessmentModel;
    private studentsService;
    constructor(attemptModel: Model<AssessmentAttemptDocument>, assessmentModel: Model<AssessmentDocument>, studentsService: StudentsService);
    getResults(assessmentId: string, teacherId: string): Promise<{
        assessment: {
            title: string;
            maxAttempts: number;
            isSimulator: boolean;
        };
        metrics: {
            totalRespondieron: number;
            promedio: number;
            aprobados: number;
        };
        results: any[];
    }>;
    getAttemptDetail(assessmentId: string, attemptId: string, teacherId: string): Promise<any>;
    getQuestionAnalytics(assessmentId: string, teacherId: string): Promise<{
        statement: string;
        type: string;
        correctCount: number;
        totalCount: number;
        percentage: number;
    }[]>;
    exportExcel(assessmentId: string, teacherId: string, res: Response): Promise<void>;
}
