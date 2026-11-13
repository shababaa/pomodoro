/** Night is 6pm through 5am, local time. */
export function isNightHour(hour) {
  return hour >= 18 || hour < 5
}

/**
 * Portion of the chosen focus length that has elapsed, from 0 to 1.
 * The sky uses this so details can fade in across the session
 * instead of waiting for three large jumps.
 */
export function skyProgress(elapsedMs, durationMs) {
  const elapsed = Math.max(0, Number(elapsedMs) || 0)
  const duration = Math.max(0, Number(durationMs) || 0)
  if (!(duration > 0) || !(elapsed > 0)) return 0
  return Math.min(1, elapsed / duration)
}

/**
 * Coarse stage kept for the older third-based checks.
 * The painted sky follows skyProgress.
 */
export function skyStage(elapsedMs, durationMs) {
  const elapsed = Math.floor(elapsedMs)
  const duration = Math.floor(durationMs)
  if (!(duration > 0) || !(elapsed > 0)) return 0
  if (elapsed >= duration) return 3
  if (elapsed * 3 >= duration * 2) return 2
  if (elapsed * 3 >= duration) return 1
  return 0
}
