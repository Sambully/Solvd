/**
 * Deterministic Option Shuffling for Group Test Rooms (Anti-Leak Security)
 *
 * Each participant receives a deterministic permutation of options [A, B, C, D]
 * based on hash(userId + questionId).
 * This prevents neighboring students from copying letters (A/B/C/D) while ensuring
 * that reloads and server-side scoring always map back to the authentic answer key.
 */

function hashSeed(str: string): number {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/**
 * Returns a deterministic 4-element permutation of [0, 1, 2, 3] for a given (userId, questionId).
 * Example: [2, 0, 3, 1] means:
 * - Position 0 shows original option 2
 * - Position 1 shows original option 0
 * - Position 2 shows original option 3
 * - Position 3 shows original option 1
 */
export function getOptionPermutation(userId: string, questionId: string): number[] {
  const perm = [0, 1, 2, 3];
  let seed = hashSeed(`${userId}:${questionId}`);

  // Fisher-Yates shuffle with deterministic LCG
  for (let i = perm.length - 1; i > 0; i--) {
    seed = (Math.imul(1103515245, seed) + 12345) >>> 0;
    const j = seed % (i + 1);
    const temp = perm[i];
    perm[i] = perm[j];
    perm[j] = temp;
  }

  return perm;
}

/**
 * Permutes options for client-side rendering during room exams.
 */
export function shuffleOptionsForParticipant(
  options: string[],
  userId: string,
  questionId: string
): { shuffledOptions: string[]; permutation: number[] } {
  const perm = getOptionPermutation(userId, questionId);
  const shuffledOptions = perm.map((originalIdx) => options[originalIdx] ?? "");
  return { shuffledOptions, permutation: perm };
}

/**
 * Resolves a participant's selected shuffled index (0..3) back to the original option index (0..3)
 * for authentic NEET server-side scoring.
 */
export function mapShuffledToOriginalOptionIndex(
  shuffledSelection: number,
  userId: string,
  questionId: string
): number {
  const perm = getOptionPermutation(userId, questionId);
  return perm[shuffledSelection] ?? shuffledSelection;
}
