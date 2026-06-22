import { Model } from 'mongoose';
import { AssessmentAttempt, AssessmentAttemptDocument } from './assessment-attempt.schema';
import { AssessmentDocument } from '../assessments/assessment.schema';
import { QuestionDocument } from '../questions/question.schema';
import { LateRequestDocument } from '../late-requests/late-request.schema';
export declare class AssessmentAttemptsService {
    private attemptModel;
    private assessmentModel;
    private questionModel;
    private lateRequestModel;
    constructor(attemptModel: Model<AssessmentAttemptDocument>, assessmentModel: Model<AssessmentDocument>, questionModel: Model<QuestionDocument>, lateRequestModel: Model<LateRequestDocument>);
    private sanitizeAttempt;
    startAttempt(assessmentId: string, studentId: string): Promise<AssessmentAttempt>;
    submitAttempt(attemptId: string, studentId: string, studentAnswers: {
        questionId: string;
        answers: string[];
    }[], antiCheatLog?: any, isTimeout?: boolean): Promise<AssessmentAttempt>;
    getAttemptStatus(assessmentId: string, studentId: string): Promise<any>;
    getStudentHistory(studentId: string): Promise<any[]>;
    getAttemptsByAssessment(assessmentId: string, studentId: string): Promise<AssessmentAttempt[]>;
    removeAllForStudent(studentId: string): Promise<any>;
    getAttemptDetails(attemptId: string, studentId: string): Promise<any>;
    archiveAttempt(attemptId: string): Promise<AssessmentAttempt>;
    getArchivedAttempts(assessmentId: string): Promise<AssessmentAttempt[]>;
}
