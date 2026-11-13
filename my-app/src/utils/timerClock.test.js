import assert from 'node:assert/strict'
import test from 'node:test'
import { remainingWholeSeconds } from './timerClock.js'

test('a hidden tab keeps the real time remaining', () => {
  const startedAt = 1_700_000_000_000
  const end = startedAt + 25 * 60 * 1000

  const afterTenHiddenMinutes = startedAt + 10 * 60 * 1000
  assert.equal(remainingWholeSeconds(end, afterTenHiddenMinutes), 15 * 60)
})

test('the timer is finished once the deadline passes while hidden', () => {
  const end = 50_000
  assert.equal(remainingWholeSeconds(end, end), 0)
  assert.equal(remainingWholeSeconds(end, end + 8 * 60 * 1000), 0)
})

test('a partial second still shows the current second', () => {
  const end = 10_000
  assert.equal(remainingWholeSeconds(end, 9_200), 1)
  assert.equal(remainingWholeSeconds(end, 8_001), 2)
  assert.equal(remainingWholeSeconds(end, 0), 10)
})

test('pause freezes the deadline across time spent in another tab', () => {
  const startedAt = 0
  const durationMs = 25 * 60 * 1000
  let end = startedAt + durationMs

  const pausedAt = 60 * 1000
  const remainingMs = end - pausedAt
  end = null

  const returnedAt = pausedAt + 10 * 60 * 1000
  const shownWhilePaused = remainingWholeSeconds(returnedAt + remainingMs, returnedAt)
  assert.equal(shownWhilePaused, 24 * 60)

  const resumedAt = returnedAt
  end = resumedAt + remainingMs
  const later = resumedAt + 2 * 60 * 1000
  assert.equal(remainingWholeSeconds(end, later), 22 * 60)
})

test('adding minutes extends the same deadline', () => {
  const now = 5_000
  const end = now + 20 * 1000 + 5 * 60 * 1000
  assert.equal(remainingWholeSeconds(end, now), 20 + 5 * 60)
  assert.equal(remainingWholeSeconds(end, now + 10 * 1000), 10 + 5 * 60)
})
