/**
 * Whole seconds left until an absolute deadline.
 * The current partial second still counts, and the result is 0 once the
 * deadline has passed. A deadline stays correct when the browser throttles
 * timers in a background tab; subtracting 1 on each tick does not.
 */
export function remainingWholeSeconds(endTimeMs, nowMs) {
  const remainingMs = endTimeMs - nowMs
  if (remainingMs <= 0) return 0
  return Math.ceil(remainingMs / 1000)
}
