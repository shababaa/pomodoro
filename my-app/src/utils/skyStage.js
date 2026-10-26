/** Night is 6pm through 5am, local time. */
export function isNightHour(hour) {
  return hour >= 18 || hour < 5
}

/**
 * How grown-in the sky is for the timer that was set.
 * The scene steps in thirds of that length: a 1 minute timer
 * updates every 20 seconds, a 15 minute timer every 5 minutes.
 * Stage 3 is the full scene, reached as that timer completes.
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
