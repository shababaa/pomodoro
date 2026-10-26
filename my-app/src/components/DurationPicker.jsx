import { useEffect, useRef, useState } from 'react'

const LENGTHS = [
  { seconds: 15 * 60, label: '15 min' },
  { seconds: 20 * 60, label: '20 min' },
  { seconds: 25 * 60, label: '25 min' },
  { seconds: 30 * 60, label: '30 min' },
  { seconds: 45 * 60, label: '45 min' },
  { seconds: 60 * 60, label: '1 hour' },
]

function lengthValue(totalSeconds) {
  const match = LENGTHS.find((item) => item.seconds === totalSeconds)
  if (match) return match.label
  if (!totalSeconds) return 'Set'
  return 'Custom'
}

function Chevron() {
  return (
    <svg className="length-picker__chevron" viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="M3.5 6 L8 10.5 L12.5 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function DurationPicker({ seconds, onPick }) {
  const [open, setOpen] = useState(false)
  const [edges, setEdges] = useState({ prev: false, next: true })
  const rootRef = useRef(null)
  const scrollerRef = useRef(null)
  const dragRef = useRef(null)
  const suppressClickRef = useRef(false)

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

  useEffect(() => {
    if (!open) return undefined
    const el = scrollerRef.current
    if (!el) return undefined

    const updateEdges = () => {
      const max = el.scrollWidth - el.clientWidth
      setEdges({
        prev: el.scrollLeft > 4,
        next: el.scrollLeft < max - 4,
      })
    }

    const frame = requestAnimationFrame(() => {
      const selected = el.querySelector('[aria-selected="true"]')
      if (selected) {
        const left = selected.offsetLeft
        const right = left + selected.offsetWidth
        if (right > el.scrollLeft + el.clientWidth) {
          el.scrollLeft = right - el.clientWidth
        } else if (left < el.scrollLeft) {
          el.scrollLeft = left
        }
      }
      updateEdges()
    })

    const onWheel = (event) => {
      if (el.scrollWidth <= el.clientWidth + 1) return
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return
      el.scrollLeft += event.deltaY
      event.preventDefault()
    }

    el.addEventListener('scroll', updateEdges, { passive: true })
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => {
      cancelAnimationFrame(frame)
      el.removeEventListener('scroll', updateEdges)
      el.removeEventListener('wheel', onWheel)
    }
  }, [open])

  const onPointerDown = (event) => {
    if (event.button !== 0) return
    dragRef.current = {
      id: event.pointerId,
      x: event.clientX,
      scroll: event.currentTarget.scrollLeft,
      moved: false,
    }
  }

  const onPointerMove = (event) => {
    const drag = dragRef.current
    if (!drag || drag.id !== event.pointerId) return
    const dx = event.clientX - drag.x
    if (!drag.moved && Math.abs(dx) <= 6) return
    drag.moved = true
    const el = event.currentTarget
    if (!el.hasPointerCapture?.(event.pointerId)) {
      el.setPointerCapture(event.pointerId)
    }
    el.scrollLeft = drag.scroll - dx
  }

  const onPointerUp = (event) => {
    const drag = dragRef.current
    dragRef.current = null
    if (drag?.moved) suppressClickRef.current = true
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  const onClickCapture = (event) => {
    if (!suppressClickRef.current) return
    suppressClickRef.current = false
    event.preventDefault()
    event.stopPropagation()
  }

  const slide = (direction) => {
    const el = scrollerRef.current
    if (!el) return
    const option = el.querySelector('.length-picker__option')
    const width = option?.getBoundingClientRect().width || el.clientWidth / 4
    el.scrollBy({ left: direction * width, behavior: 'smooth' })
  }

  return (
    <div className={`length-picker${open ? ' is-open' : ''}`} ref={rootRef}>
      <button
        type="button"
        className="length-picker__toggle"
        aria-expanded={open}
        aria-controls="length-options"
        onClick={() => setOpen((value) => !value)}
      >
        <span className="length-picker__name">Length</span>
        <span className="length-picker__value">
          {lengthValue(seconds)}
          <Chevron />
        </span>
      </button>
      {open && (
        <div className={`length-picker__frame${edges.prev ? ' has-prev' : ''}${edges.next ? ' has-next' : ''}`}>
          <div
            className="length-picker__viewport"
            ref={scrollerRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onClickCapture={onClickCapture}
          >
            <div className="length-picker__track" id="length-options" role="listbox" aria-label="Timer length">
              {LENGTHS.map((length) => {
                const selected = seconds === length.seconds
                return (
                  <button
                    key={length.seconds}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    className={`length-picker__option${selected ? ' is-selected' : ''}`}
                    onClick={() => {
                      onPick(length.seconds)
                      setOpen(false)
                    }}
                  >
                    {length.label}
                  </button>
                )
              })}
            </div>
          </div>
          {edges.prev && (
            <button
              type="button"
              className="length-picker__nudge length-picker__nudge--prev"
              aria-label="Show shorter lengths"
              onClick={() => slide(-1)}
            >
              ‹
            </button>
          )}
          {edges.next && (
            <button
              type="button"
              className="length-picker__nudge length-picker__nudge--next"
              aria-label="Show longer lengths"
              onClick={() => slide(1)}
            >
              ›
            </button>
          )}
        </div>
      )}
    </div>
  )
}
