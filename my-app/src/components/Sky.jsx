import { useEffect, useState } from 'react'
import { isNightHour } from '../utils/skyStage'

const STARS = [
  { top: '12%', left: '14%', size: 5, stage: 1, delay: '0s' },
  { top: '22%', left: '78%', size: 7, stage: 1, delay: '1.2s' },
  { top: '18%', left: '46%', size: 4, stage: 1, delay: '0.4s' },
  { top: '34%', left: '28%', size: 6, stage: 1, delay: '2s' },
  { top: '8%', left: '62%', size: 4, stage: 1, delay: '1.6s' },
  { top: '40%', left: '84%', size: 5, stage: 2, delay: '0.8s' },
  { top: '28%', left: '10%', size: 4, stage: 2, delay: '2.4s' },
  { top: '48%', left: '58%', size: 6, stage: 2, delay: '0.2s' },
  { top: '16%', left: '90%', size: 4, stage: 2, delay: '1.8s' },
  { top: '56%', left: '22%', size: 5, stage: 2, delay: '3s' },
  { top: '44%', left: '38%', size: 3, stage: 2, delay: '1s' },
  { top: '30%', left: '66%', size: 4, stage: 2, delay: '2.2s' },
  { top: '62%', left: '72%', size: 5, stage: 3, delay: '0.6s' },
  { top: '70%', left: '12%', size: 4, stage: 3, delay: '1.4s' },
  { top: '8%', left: '34%', size: 3, stage: 3, delay: '2.8s' },
  { top: '52%', left: '92%', size: 6, stage: 3, delay: '0.3s' },
  { top: '24%', left: '52%', size: 3, stage: 3, delay: '1.9s' },
  { top: '66%', left: '48%', size: 4, stage: 3, delay: '2.6s' },
  { top: '38%', left: '6%', size: 3, stage: 3, delay: '0.9s' },
  { top: '74%', left: '86%', size: 5, stage: 3, delay: '1.5s' },
  { top: '14%', left: '22%', size: 3, stage: 3, delay: '3.2s' },
  { top: '58%', left: '34%', size: 4, stage: 3, delay: '2.1s' },
]

const CLOUDS = [
  { top: '18%', left: '12%', scale: 1, stage: 1, delay: '0s' },
  { top: '30%', left: '68%', scale: 0.85, stage: 1, delay: '4s' },
  { top: '14%', left: '42%', scale: 0.7, stage: 2, delay: '2s' },
  { top: '42%', left: '24%', scale: 1.05, stage: 2, delay: '6s' },
  { top: '22%', left: '82%', scale: 0.75, stage: 3, delay: '1s' },
  { top: '50%', left: '58%', scale: 0.9, stage: 3, delay: '5s' },
]

function Star({ star }) {
  return (
    <span
      className="sky-star"
      style={{
        top: star.top,
        left: star.left,
        width: star.size,
        height: star.size,
        animationDelay: star.delay,
      }}
    />
  )
}

function Cloud({ cloud }) {
  return (
    <span
      className="sky-cloud"
      style={{
        top: cloud.top,
        left: cloud.left,
        transform: `scale(${cloud.scale})`,
        animationDelay: cloud.delay,
      }}
    />
  )
}

export default function Sky({ stage = 0, phase = 'idle' }) {
  const [night, setNight] = useState(() => isNightHour(new Date().getHours()))

  useEffect(() => {
    const tick = () => setNight(isNightHour(new Date().getHours()))
    const id = setInterval(tick, 60 * 1000)
    return () => clearInterval(id)
  }, [])

  const sceneStage = Math.max(0, Math.min(3, stage))
  const scene = night ? 'night' : 'day'

  return (
    <div
      className={`sky sky--${scene} sky--stage-${sceneStage}${phase === 'break' ? ' sky--break' : ''}`}
      aria-hidden="true"
    >
      {night ? (
        <>
          <span className="sky-moon">
            <svg viewBox="0 0 64 64" aria-hidden="true">
              <mask id="cozy-moon">
                <rect width="64" height="64" fill="black" />
                <circle cx="30" cy="32" r="20" fill="white" />
                <circle cx="42" cy="26" r="16" fill="black" />
              </mask>
              <circle cx="30" cy="32" r="20" fill="#f6e7c1" mask="url(#cozy-moon)" />
            </svg>
          </span>
          {sceneStage >= 3 && <span className="sky-milky" />}
          {STARS.filter((star) => star.stage <= sceneStage).map((star) => (
            <Star key={`${star.top}-${star.left}`} star={star} />
          ))}
        </>
      ) : (
        <>
          <span className="sky-sun" />
          {CLOUDS.filter((cloud) => cloud.stage <= sceneStage).map((cloud) => (
            <Cloud key={`${cloud.top}-${cloud.left}`} cloud={cloud} />
          ))}
        </>
      )}
    </div>
  )
}
