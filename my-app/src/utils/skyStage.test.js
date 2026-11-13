import assert from 'node:assert/strict'
import test from 'node:test'
import {
  displaySkyProgress,
  isNightHour,
  resolveScene,
  sceneForHour,
  skyProgress,
  skyStage,
} from './skyStage.js'

test('local hour picks day, sunset, or night', () => {
  assert.equal(sceneForHour(4), 'night')
  assert.equal(sceneForHour(5), 'day')
  assert.equal(sceneForHour(12), 'day')
  assert.equal(sceneForHour(16), 'day')
  assert.equal(sceneForHour(17), 'sunset')
  assert.equal(sceneForHour(19), 'sunset')
  assert.equal(sceneForHour(20), 'night')
  assert.equal(sceneForHour(23), 'night')
  assert.equal(sceneForHour(0), 'night')
})

test('night is 8pm through just before 5am', () => {
  assert.equal(isNightHour(20), true)
  assert.equal(isNightHour(23), true)
  assert.equal(isNightHour(0), true)
  assert.equal(isNightHour(4), true)
  assert.equal(isNightHour(5), false)
  assert.equal(isNightHour(17), false)
  assert.equal(isNightHour(18), false)
  assert.equal(isNightHour(19), false)
})

test('a chosen scene ignores the clock', () => {
  assert.equal(resolveScene('auto', 12), 'day')
  assert.equal(resolveScene('auto', 18), 'sunset')
  assert.equal(resolveScene('auto', 21), 'night')
  assert.equal(resolveScene('day', 21), 'day')
  assert.equal(resolveScene('sunset', 9), 'sunset')
  assert.equal(resolveScene('night', 9), 'night')
  assert.equal(resolveScene('nope', 18), 'sunset')
})

test('a preview scrub only replaces the painted amount', () => {
  assert.equal(displaySkyProgress(0.2, null), 0.2)
  assert.equal(displaySkyProgress(0.2, undefined), 0.2)
  assert.equal(displaySkyProgress(0.2, 0.8), 0.8)
  assert.equal(displaySkyProgress(1, 0), 0)
  assert.equal(displaySkyProgress(0.2, 2), 1)
  assert.equal(displaySkyProgress(0.2, -1), 0)
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

test('sky progress fills evenly across whatever length was set', () => {
  const minute = 60 * 1000
  assert.equal(skyProgress(0, minute), 0)
  assert.equal(skyProgress(6 * 1000, minute), 0.1)
  assert.equal(skyProgress(15 * 1000, minute), 0.25)
  assert.equal(skyProgress(30 * 1000, minute), 0.5)
  assert.equal(skyProgress(45 * 1000, minute), 0.75)
  assert.equal(skyProgress(60 * 1000, minute), 1)
  assert.equal(skyProgress(90 * 1000, minute), 1)
  assert.equal(skyProgress(5 * 60 * 1000, 20 * 60 * 1000), 0.25)
  assert.equal(skyProgress(20 * 1000, 0), 0)
})

test('an unset timer stays on the quiet sky', () => {
  assert.equal(skyStage(0, 0), 0)
  assert.equal(skyStage(20 * 1000, 0), 0)
  assert.equal(skyStage(0, 15 * 60 * 1000), 0)
})
