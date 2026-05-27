import { AssessmentAttemptsService } from './assessment-attempts.service';
export declare class AssessmentAttemptsController {
    private readonly attemptsService;
    constructor(attemptsService: AssessmentAttemptsService);
    startAttempt(assessmentId: string, req: any): Promise<import("./assessment-attempt.schema").AssessmentAttempt>;
    submitAttempt(attemptId: string, answers: {
        questionId: string;
        answers: string[];
    }[], antiCheatLog: any, isTimeout: boolean, req: any): Promise<import("./assessment-attempt.schema").AssessmentAttempt>;
    getAttemptStatus(assessmentId: string, req: any): Promise<any>;
    getAttemptDetails(attemptId: string, req: any): Promise<any>;
}
