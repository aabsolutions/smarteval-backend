export declare class CreateAssessmentDto {
    title: string;
    description: string;
    topicId: string;
    groupIds: string[];
    startTime: string;
    endTime: string;
    durationMinutes: number;
    totalQuestionsToPull: number;
    isActive?: boolean;
    antiCheat?: boolean;
    shuffleOptions: boolean;
    maxAttempts: number;
    isSimulator?: boolean;
    flashcardsTimeLimitMinutes?: number;
}
