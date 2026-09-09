/**
 * Calcula los puntos otorgados por una respuesta.
 *
 * `correctRatio` va de 0 (todo mal) a 1 (todo bien) — para single/multiple-choice,
 * true-false y fill-blank es siempre 0 o 1; para matching es correctPairs/totalPairs,
 * igual que el criterio de puntaje parcial de assessment-attempts.service.ts.
 *
 * Fórmula (escalada por correctRatio):
 *   basePts  = correctRatio × questionPoints × 1000
 *   speedPts = correctRatio × (1 - responseTimeMs / timeLimitMs) × questionPoints × 500
 *   total    = basePts + speedPts
 */
export function calculatePoints(
  correctRatio: number,
  responseTimeMs: number,
  timeLimitMs: number,
  questionPoints: number = 1,
): number {
  if (correctRatio <= 0) return 0;

  const basePts = correctRatio * questionPoints * 1000;
  const speedRatio = Math.max(0, 1 - responseTimeMs / timeLimitMs);
  const speedPts = correctRatio * speedRatio * questionPoints * 500;

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
