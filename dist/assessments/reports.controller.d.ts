import { ReportsService } from './reports.service';
import { Response } from 'express';
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
    getResults(id: string, req: any): Promise<{
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
    getQuestionAnalytics(id: string, req: any): Promise<{
        statement: string;
        type: string;
        correctCount: number;
        totalCount: number;
        percentage: number;
    }[]>;
    exportExcel(id: string, req: any, res: Response): Promise<void>;
}
