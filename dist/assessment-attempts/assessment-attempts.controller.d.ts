import { AssessmentAttemptsService } from './assessment-attempts.service';
export declare class AssessmentAttemptsController {
    private readonly attemptsService;
    constructor(attemptsService: AssessmentAttemptsService);
    startAttempt(assessmentId: string, req: any): Promise<import("./assessment-attempt.schema").AssessmentAttempt>;
    submitAttempt(attemptId: string, answers: {
        questionId: string;
        answers: string[];
    }[], antiCheatLog: any, isTimeout: boolean, req: any): Promise<import("./assessment-attempt.schema").AssessmentAttempt>;
    generatePaperAttempts(assessmentId: string, studentIds: string[]): Promise<import("./assessment-attempt.schema").AssessmentAttempt[]>;
    getEligibleStudents(assessmentId: string): Promise<any[]>;
    submitPaperAttempt(attemptId: string, studentId: string, answers: {
        questionId: string;
        answers: string[];
    }[]): Promise<import("./assessment-attempt.schema").AssessmentAttempt>;
    getStudentLeaderboard(req: any): Promise<any[]>;
    getStudentHistory(req: any): Promise<any[]>;
    getStudentHistoryForTeacher(studentId: string): Promise<any[]>;
    getAttemptStatus(assessmentId: string, req: any): Promise<any>;
    getAttemptDetails(attemptId: string, req: any): Promise<any>;
    getPaperAttempt(attemptId: string): Promise<import("./assessment-attempt.schema").AssessmentAttempt>;
    archiveAttempt(id: string): Promise<import("./assessment-attempt.schema").AssessmentAttempt>;
    getArchivedAttempts(assessmentId: string): Promise<import("./assessment-attempt.schema").AssessmentAttempt[]>;
}
