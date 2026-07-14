import { Model, Connection } from 'mongoose';
import { AssessmentAttempt, AssessmentAttemptDocument } from './assessment-attempt.schema';
import { AssessmentDocument } from '../assessments/assessment.schema';
import { QuestionDocument } from '../questions/question.schema';
import { LateRequestDocument } from '../late-requests/late-request.schema';
export declare class AssessmentAttemptsService {
    private attemptModel;
    private assessmentModel;
    private questionModel;
    private lateRequestModel;
    private readonly connection;
    constructor(attemptModel: Model<AssessmentAttemptDocument>, assessmentModel: Model<AssessmentDocument>, questionModel: Model<QuestionDocument>, lateRequestModel: Model<LateRequestDocument>, connection: Connection);
    private sanitizeAttempt;
    startAttempt(assessmentId: string, studentId: string): Promise<AssessmentAttempt>;
    getEligibleStudentsForPaper(assessmentId: string): Promise<any[]>;
    generatePaperAttempts(assessmentId: string, studentIds: string[]): Promise<AssessmentAttempt[]>;
    submitPaperAttempt(attemptId: string, studentId: string, studentAnswers: {
        questionId: string;
        answers: string[];
    }[]): Promise<AssessmentAttempt>;
    submitAttempt(attemptId: string, studentId: string, studentAnswers: {
        questionId: string;
        answers: string[];
    }[], antiCheatLog?: any, isTimeout?: boolean): Promise<AssessmentAttempt>;
    getAttemptStatus(assessmentId: string, studentId: string): Promise<any>;
    getStudentHistory(studentId: string): Promise<any[]>;
    getAttemptsByAssessment(assessmentId: string, studentId: string): Promise<AssessmentAttempt[]>;
    removeAllForStudent(studentId: string): Promise<any>;
    getAttemptDetails(attemptId: string, studentId: string): Promise<any>;
    getPaperAttemptById(attemptId: string): Promise<AssessmentAttempt>;
    archiveAttempt(attemptId: string): Promise<AssessmentAttempt>;
    getArchivedAttempts(assessmentId: string): Promise<AssessmentAttempt[]>;
}
