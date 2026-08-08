export declare function calculatePoints(isCorrect: boolean, responseTimeMs: number, timeLimitMs: number, questionPoints?: number): number;
export declare function generateRanking(participants: {
    userId: string;
    name: string;
    totalScore: number;
    correctAnswers: number;
    totalResponseTimeMs: number;
}[]): {
    rank: number;
    userId: string;
    name: string;
    totalScore: number;
    correctAnswers: number;
    totalResponseTimeMs: number;
}[];
