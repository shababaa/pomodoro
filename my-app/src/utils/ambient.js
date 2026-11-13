export const AMBIENT_TRACKS = [
  { id: 'silence', label: 'Silence' },
  { id: 'rain', label: 'Rain' },
  { id: 'wind', label: 'Soft wind' },
  { id: 'night', label: 'Night' },
]

const TRACK_IDS = new Set(AMBIENT_TRACKS.map((track) => track.id))

export function clampVolume(value) {
  const number = Number(value)
  if (!Number.isFinite(number)) return 0
  return Math.min(1, Math.max(0, number))
}

/** Loudest setting stays under a speaking voice. Silence is always 0. */
export function ambientGain(volume, track) {
  if (track === 'silence' || !TRACK_IDS.has(track)) return 0
  const level = clampVolume(volume)
  return level * level * 0.4
}

function makeNoise(ctx, seconds) {
  const length = Math.floor(ctx.sampleRate * seconds)
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  let brown = 0
  for (let i = 0; i < length; i += 1) {
    const white = Math.random() * 2 - 1
    brown = (brown + 0.02 * white) / 1.02
    data[i] = brown * 3.4
  }
  return buffer
}

function loopNoise(ctx, destination, keep, { type, frequency, q, gain }) {
  const source = ctx.createBufferSource()
  source.buffer = makeNoise(ctx, 2)
  source.loop = true
  const filter = ctx.createBiquadFilter()
  filter.type = type
  filter.frequency.value = frequency
  if (q) filter.Q.value = q
  const amp = ctx.createGain()
  amp.gain.value = gain
  source.connect(filter)
  filter.connect(amp)
  amp.connect(destination)
  source.start()
  keep.push(source)
  return amp
}

function startRain(ctx, destination, keep, timers) {
  loopNoise(ctx, destination, keep, {
    type: 'lowpass',
    frequency: 860,
    gain: 0.7,
  })
  const noise = makeNoise(ctx, 1.5)
  const id = setInterval(() => {
    if (ctx.state === 'closed') return
    const drop = ctx.createBufferSource()
    drop.buffer = noise
    const filter = ctx.createBiquadFilter()
    filter.type = 'highpass'
    filter.frequency.value = 1400
    const amp = ctx.createGain()
    const now = ctx.currentTime
    amp.gain.setValueAtTime(0.0001, now)
    amp.gain.exponentialRampToValueAtTime(0.22, now + 0.012)
    amp.gain.exponentialRampToValueAtTime(0.0001, now + 0.13)
    drop.connect(filter)
    filter.connect(amp)
    amp.connect(destination)
    drop.start(now)
    drop.stop(now + 0.16)
  }, 280)
  timers.push(id)
}

function startWind(ctx, destination, keep) {
  const amp = loopNoise(ctx, destination, keep, {
    type: 'lowpass',
    frequency: 420,
    gain: 0.35,
  })
  const lfo = ctx.createOscillator()
  lfo.frequency.value = 0.07
  const depth = ctx.createGain()
  depth.gain.value = 0.22
  lfo.connect(depth)
  depth.connect(amp.gain)
  lfo.start()
  keep.push(lfo)
}

function startNight(ctx, destination, keep) {
  loopNoise(ctx, destination, keep, {
    type: 'lowpass',
    frequency: 280,
    gain: 0.45,
  })
  const tone = ctx.createOscillator()
  tone.type = 'sine'
  tone.frequency.value = 174
  const amp = ctx.createGain()
  amp.gain.value = 0.08
  const lfo = ctx.createOscillator()
  lfo.frequency.value = 0.05
  const depth = ctx.createGain()
  depth.gain.value = 0.03
  lfo.connect(depth)
  depth.connect(amp.gain)
  tone.connect(amp)
  amp.connect(destination)
  tone.start()
  lfo.start()
  keep.push(tone, lfo)
}

/**
 * Ambient bed, separate from the countdown chime.
 * Nothing is audible until play() is called with a track other than silence,
 * and that call has to come from a user gesture.
 */
export function createAmbientEngine() {
  let ctx = null
  let master = null
  let track = 'silence'
  let volume = 0.6
  let generation = 0
  const keep = []
  const timers = []

  const clearSounds = () => {
    timers.splice(0).forEach((id) => clearInterval(id))
    keep.splice(0).forEach((node) => {
      try { node.stop?.() } catch { /* already stopped */ }
      try { node.disconnect?.() } catch { /* already disconnected */ }
    })
  }

  const context = () => {
    if (ctx) return ctx
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (!AudioCtx) return null
    ctx = new AudioCtx()
    master = ctx.createGain()
    master.gain.value = 0
    master.connect(ctx.destination)
    return ctx
  }

  const applyGain = () => {
    if (!master || !ctx) return
    const next = ambientGain(volume, track)
    const now = ctx.currentTime
    master.gain.cancelScheduledValues(now)
    master.gain.setValueAtTime(master.gain.value, now)
    master.gain.linearRampToValueAtTime(next, now + 0.28)
  }

  return {
    get track() { return track },
    play(nextTrack, nextVolume) {
      if (nextVolume != null) volume = clampVolume(nextVolume)
      const id = TRACK_IDS.has(nextTrack) ? nextTrack : 'silence'
      generation += 1
      if (id === 'silence') {
        track = 'silence'
        applyGain()
        const token = generation
        setTimeout(() => {
          if (token === generation) clearSounds()
        }, 320)
        return
      }
      const audio = context()
      if (!audio) return
      if (audio.state === 'suspended') audio.resume()
      clearSounds()
      track = id
      if (id === 'rain') startRain(audio, master, keep, timers)
      else if (id === 'wind') startWind(audio, master, keep)
      else startNight(audio, master, keep)
      applyGain()
    },
    setVolume(nextVolume) {
      volume = clampVolume(nextVolume)
      if (track === 'silence') return
      applyGain()
    },
    dispose() {
      generation += 1
      track = 'silence'
      clearSounds()
      const closing = ctx
      ctx = null
      master = null
      closing?.close?.()
    },
  }
}
