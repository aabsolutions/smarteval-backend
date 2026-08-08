"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculatePoints = calculatePoints;
exports.generateRanking = generateRanking;
function calculatePoints(isCorrect, responseTimeMs, timeLimitMs, questionPoints = 1) {
    if (!isCorrect)
        return 0;
    const basePts = questionPoints * 1000;
    const speedRatio = Math.max(0, 1 - responseTimeMs / timeLimitMs);
    const speedPts = speedRatio * questionPoints * 500;
    return Math.round(basePts + speedPts);
}
function generateRanking(participants) {
    return [...participants]
        .sort((a, b) => {
        if (b.totalScore !== a.totalScore)
            return b.totalScore - a.totalScore;
        return a.totalResponseTimeMs - b.totalResponseTimeMs;
    })
        .map((p, i) => ({ ...p, rank: i + 1 }));
}
//# sourceMappingURL=live-quiz-scoring.util.js.map