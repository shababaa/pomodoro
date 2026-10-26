import assert from 'node:assert/strict'
import test from 'node:test'
import { isNightHour, skyStage } from './skyStage.js'

test('evening and late night are the starry scene', () => {
  assert.equal(isNightHour(18), true)
  assert.equal(isNightHour(23), true)
  assert.equal(isNightHour(0), true)
  assert.equal(isNightHour(4), true)
  assert.equal(isNightHour(5), false)
  assert.equal(isNightHour(12), false)
  assert.equal(isNightHour(17), false)
})

test('a 1 minute timer steps the sky every 20 seconds', () => {
  const minute = 60 * 1000
  assert.equal(skyStage(0, minute), 0)
  assert.equal(skyStage(19 * 1000, minute), 0)
  assert.equal(skyStage(20 * 1000, minute), 1)
  assert.equal(skyStage(39 * 1000, minute), 1)
  assert.equal(skyStage(40 * 1000, minute), 2)
  assert.equal(skyStage(59 * 1000, minute), 2)
  assert.equal(skyStage(60 * 1000, minute), 3)
})

test('longer timers step in thirds of the length that was set', () => {
  const min = 60 * 1000
  assert.equal(skyStage(5 * min - 1, 15 * min), 0)
  assert.equal(skyStage(5 * min, 15 * min), 1)
  assert.equal(skyStage(10 * min, 15 * min), 2)
  assert.equal(skyStage(15 * min, 15 * min), 3)

  assert.equal(skyStage(8 * min + 20 * 1000, 25 * min), 1)
  assert.equal(skyStage(16 * min + 40 * 1000, 25 * min), 2)
  assert.equal(skyStage(25 * min, 25 * min), 3)

  assert.equal(skyStage(20 * min, 60 * min), 1)
  assert.equal(skyStage(40 * min, 60 * min), 2)
  assert.equal(skyStage(60 * min, 60 * min), 3)
  assert.equal(skyStage(90 * min, 60 * min), 3)
})

test('an unset timer stays on the quiet sky', () => {
  assert.equal(skyStage(0, 0), 0)
  assert.equal(skyStage(20 * 1000, 0), 0)
  assert.equal(skyStage(0, 15 * 60 * 1000), 0)
})
