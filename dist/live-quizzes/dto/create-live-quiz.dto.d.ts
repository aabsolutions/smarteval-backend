export declare class CreateLiveQuizQuestionDto {
    questionId?: string;
    type: string;
    statement: string;
    options: string[];
    correctAnswers: string[];
    matchingOptions?: string[];
    points: number;
    imageUrl?: string;
    timeLimitSeconds: number;
}
export declare class CreateLiveQuizDto {
    title: string;
    description?: string;
    groupIds?: string[];
    questions: CreateLiveQuizQuestionDto[];
}
