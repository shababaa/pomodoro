import { useEffect, useId, useRef, useState } from 'react'

const CHOICES = [
  { id: 'auto', label: 'Auto' },
  { id: 'day', label: 'Day' },
  { id: 'sunset', label: 'Sunset' },
  { id: 'night', label: 'Night' },
]

export default function SceneControl({ choice, onChange }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)
  const menuId = useId()
  const current = CHOICES.find((item) => item.id === choice) ?? CHOICES[0]

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

  return (
    <div className={`scene-control${open ? ' is-open' : ''}`} ref={rootRef}>
      <button
        type="button"
        className="scene-control__toggle"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={`Scene, ${current.label}. Preview day, sunset, or night without changing the clock.`}
        onClick={() => setOpen((value) => !value)}
      >
        {current.label}
      </button>
      {open && (
        <div className="scene-control__menu" id={menuId} role="listbox" aria-label="Scene">
          {CHOICES.map((item) => (
            <button
              key={item.id}
              type="button"
              role="option"
              aria-selected={choice === item.id}
              className={`scene-control__option${choice === item.id ? ' is-selected' : ''}`}
              onClick={() => {
                onChange(item.id)
                setOpen(false)
              }}
            >
              {item.label}
            </button>
          ))}
          <p className="scene-control__note">Auto follows this device&apos;s clock. A picked scene stays until you change it.</p>
        </div>
      )}
    </div>
  )
}
