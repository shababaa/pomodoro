import { useEffect, useId, useRef, useState } from 'react'
import { AMBIENT_TRACKS, createAmbientEngine } from '../utils/ambient'

const VOLUME_KEY = 'pomodoro-ambient-volume'

function readVolume() {
  try {
    const saved = Number(localStorage.getItem(VOLUME_KEY))
    if (Number.isFinite(saved)) return Math.min(1, Math.max(0, saved))
  } catch {
    /* private mode */
  }
  return 0.6
}

export default function AmbientPanel() {
  const [open, setOpen] = useState(false)
  const [track, setTrack] = useState('silence')
  const [volume, setVolume] = useState(readVolume)
  const rootRef = useRef(null)
  const engineRef = useRef(null)
  const menuId = useId()
  const current = AMBIENT_TRACKS.find((item) => item.id === track) ?? AMBIENT_TRACKS[0]

  useEffect(() => {
    engineRef.current = createAmbientEngine()
    return () => engineRef.current?.dispose()
  }, [])

  useEffect(() => {
    if (!open) return undefined
    const onKey = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }
    const onPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointerDown)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointerDown)
    }
  }, [open])

  const choose = (id) => {
    setTrack(id)
    engineRef.current?.play(id, volume)
  }

  const onVolume = (event) => {
    const next = Number(event.target.value)
    setVolume(next)
    try { localStorage.setItem(VOLUME_KEY, String(next)) } catch { /* ignore */ }
    if (track !== 'silence') engineRef.current?.setVolume(next)
  }

  return (
    <div className={`ambient-panel${open ? ' is-open' : ''}`} ref={rootRef}>
      <button
        type="button"
        className="ambient-panel__toggle"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={`Ambient sound, ${current.label}. Sounds stay off until you choose one.`}
        onClick={() => setOpen((value) => !value)}
      >
        {track === 'silence' ? 'Sounds' : current.label}
      </button>
      {open && (
        <div className="ambient-panel__menu" id={menuId}>
          <p className="ambient-panel__note">Off until you choose a sound. This is separate from the timer chime.</p>
          <div className="ambient-panel__choices" role="radiogroup" aria-label="Ambient sound">
            {AMBIENT_TRACKS.map((item) => (
              <button
                key={item.id}
                type="button"
                role="radio"
                aria-checked={track === item.id}
                className={`ambient-panel__option${track === item.id ? ' is-selected' : ''}`}
                onClick={() => choose(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <label className="ambient-panel__volume">
            <span>Volume</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              aria-valuetext={`${Math.round(volume * 100)} percent`}
              onChange={onVolume}
            />
          </label>
        </div>
      )}
    </div>
  )
}
