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

test('the sky grows at 3, 10, and 20 minutes of study', () => {
  assert.equal(skyStage(0), 0)
  assert.equal(skyStage(2 * 60 * 1000), 0)
  assert.equal(skyStage(3 * 60 * 1000), 1)
  assert.equal(skyStage(9 * 60 * 1000), 1)
  assert.equal(skyStage(10 * 60 * 1000), 2)
  assert.equal(skyStage(19 * 60 * 1000), 2)
  assert.equal(skyStage(20 * 60 * 1000), 3)
  assert.equal(skyStage(50 * 60 * 1000), 3)
})
