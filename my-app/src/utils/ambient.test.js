import assert from 'node:assert/strict'
import test from 'node:test'
import { AMBIENT_TRACKS, ambientGain, clampVolume } from './ambient.js'

test('volume stays between silent and full', () => {
  assert.equal(clampVolume(-2), 0)
  assert.equal(clampVolume(3), 1)
  assert.equal(clampVolume('0.25'), 0.25)
  assert.equal(clampVolume('loud'), 0)
})

test('silence and unknown tracks produce no gain', () => {
  assert.equal(ambientGain(1, 'silence'), 0)
  assert.equal(ambientGain(1, 'nope'), 0)
  assert.equal(ambientGain(0, 'rain'), 0)
  assert.ok(ambientGain(1, 'rain') <= 0.4)
  assert.ok(ambientGain(0.5, 'wind') < ambientGain(1, 'wind'))
})

test('the panel offers silence, rain, wind, and night', () => {
  assert.deepEqual(AMBIENT_TRACKS.map((track) => track.id), ['silence', 'rain', 'wind', 'night'])
})
