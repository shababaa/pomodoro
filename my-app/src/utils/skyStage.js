/** Local hour picks the painted sky. The device clock is never changed. */
export function sceneForHour(hour) {
  const value = Number(hour)
  if (!Number.isFinite(value)) return 'day'
  const hourOfDay = ((Math.floor(value) % 24) + 24) % 24
  if (hourOfDay >= 20 || hourOfDay < 5) return 'night'
  if (hourOfDay >= 17) return 'sunset'
  return 'day'
}

export function isNightHour(hour) {
  return sceneForHour(hour) === 'night'
}

export function sanitizeSceneChoice(value) {
  if (value === 'day' || value === 'sunset' || value === 'night' || value === 'auto') return value
  return 'auto'
}

/** Manual day, sunset, or night wins. Auto follows the local hour. */
export function resolveScene(choice, hour) {
  const scene = sanitizeSceneChoice(choice)
  if (scene === 'auto') return sceneForHour(hour)
  return scene
}

/**
 * Amount the sky should paint, from 0 to 1.
 * A numeric preview replaces the live amount, including 0.
 * This value is display-only: it must not reach the timer or the session API.
 */
export function displaySkyProgress(liveProgress, previewProgress) {
  const live = clamp01(liveProgress)
  if (previewProgress == null) return live
  return clamp01(previewProgress)
}

function clamp01(value) {
  const number = Number(value)
  if (!Number.isFinite(number)) return 0
  return Math.min(1, Math.max(0, number))
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
