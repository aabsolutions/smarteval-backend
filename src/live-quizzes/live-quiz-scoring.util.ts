/**
 * Calcula los puntos otorgados por una respuesta.
 *
 * Fórmula:
 *   - Respuesta CORRECTA:
 *     basePts  = questionPoints × 1000
 *     speedPts = (1 - responseTimeMs / timeLimitMs) × questionPoints × 500
 *     total    = basePts + speedPts
 *
 *   - Respuesta INCORRECTA: 0 puntos
 */
export function calculatePoints(
  isCorrect: boolean,
  responseTimeMs: number,
  timeLimitMs: number,
  questionPoints: number = 1,
): number {
  if (!isCorrect) return 0;

  const basePts = questionPoints * 1000;
  const speedRatio = Math.max(0, 1 - responseTimeMs / timeLimitMs);
  const speedPts = speedRatio * questionPoints * 500;

  return Math.round(basePts + speedPts);
}

/**
 * Genera el ranking final, ordenado por:
 * 1. totalScore DESC
 * 2. totalResponseTimeMs ASC (desempate por velocidad)
 */
export function generateRanking(
  participants: { userId: string; name: string; totalScore: number; correctAnswers: number; totalResponseTimeMs: number }[],
): { rank: number; userId: string; name: string; totalScore: number; correctAnswers: number; totalResponseTimeMs: number }[] {
  return [...participants]
    .sort((a, b) => {
      if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
      return a.totalResponseTimeMs - b.totalResponseTimeMs;
    })
    .map((p, i) => ({ ...p, rank: i + 1 }));
}
