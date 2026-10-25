/** Night is 6pm through 5am, local time. */
export function isNightHour(hour) {
  return hour >= 18 || hour < 5
}

/**
 * How grown-in the sky is, from a quiet start to a full scene.
 * Stages land at about 3, 10, and 20 minutes of real study time.
 */
export function skyStage(elapsedMs) {
  const minutes = elapsedMs / 60000
  if (minutes >= 20) return 3
  if (minutes >= 10) return 2
  if (minutes >= 3) return 1
  return 0
}
