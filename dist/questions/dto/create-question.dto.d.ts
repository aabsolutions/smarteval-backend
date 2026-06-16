import { QuestionDifficulty, QuestionType } from '../question.schema';
export declare class CreateQuestionDto {
    type: QuestionType;
    statement: string;
    options: string[];
    correctAnswers: string[];
    points: number;
    difficulty: QuestionDifficulty;
    topicId: string;
    imageUrl?: string;
    imagePublicId?: string;
}
