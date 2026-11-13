import assert from 'node:assert/strict'
import test from 'node:test'
import { loadTimerDraft, readTimerDraft, settleTimerDraft, writeTimerDraft } from './timerDraft.js'

function memory() {
  const data = new Map()
  return {
    getItem: (key) => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => data.set(key, String(value)),
    removeItem: (key) => data.delete(key),
  }
}

test('a future deadline survives a reload', () => {
  const storage = memory()
  const now = 1_000_000
  writeTimerDraft(storage, {
    running: true,
    endTime: now + 25_000,
    remainingMs: 25_000,
    plannedSeconds: 60,
  })
  const loaded = loadTimerDraft(storage, now + 5_000)
  assert.equal(loaded.running, true)
  assert.equal(loaded.endTime, now + 25_000)
  assert.equal(loaded.studySeconds, 0)
})

test('a deadline that passed while the page was closed is counted once', () => {
  const storage = memory()
  const now = 1_000_000
  writeTimerDraft(storage, {
    running: true,
    endTime: now - 5,
    plannedSeconds: 60,
    studySeconds: 25,
    studyMs: 25_000,
  })
  const once = loadTimerDraft(storage, now)
  assert.equal(once.running, false)
  assert.equal(once.showBreakOptions, true)
  assert.equal(once.studySeconds, 85)
  assert.equal(once.earned, 1)
  const twice = loadTimerDraft(storage, now + 10_000)
  assert.equal(twice.studySeconds, 85)
})

test('pause keeps the frozen remainder instead of the old deadline', () => {
  const storage = memory()
  writeTimerDraft(storage, {
    running: true,
    paused: true,
    endTime: 50,
    remainingMs: 12_000,
    plannedSeconds: 60,
  })
  const loaded = settleTimerDraft(readTimerDraft(storage), 1_000_000)
  assert.equal(loaded.paused, true)
  assert.equal(loaded.running, true)
  assert.equal(loaded.remainingMs, 12_000)
  assert.equal(loaded.studySeconds, 0)
})

test('an idle timer leaves nothing stored', () => {
  const storage = memory()
  writeTimerDraft(storage, { running: true, plannedSeconds: 15 })
  writeTimerDraft(storage, { running: false })
  assert.equal(readTimerDraft(storage), null)
})
