const STARS = [
  { top: '8%', left: '12%', size: 4, at: 0.06, delay: '0s' },
  { top: '14%', left: '78%', size: 6, at: 0.12, delay: '1.1s' },
  { top: '22%', left: '28%', size: 3, at: 0.18, delay: '0.4s' },
  { top: '6%', left: '48%', size: 4, at: 0.26, delay: '1.8s' },
  { top: '30%', left: '86%', size: 5, at: 0.33, delay: '0.7s' },
  { top: '18%', left: '62%', size: 3, at: 0.4, delay: '2.2s' },
  { top: '36%', left: '16%', size: 4, at: 0.47, delay: '1.4s' },
  { top: '10%', left: '34%', size: 3, at: 0.54, delay: '0.2s' },
  { top: '26%', left: '92%', size: 5, at: 0.61, delay: '2.6s' },
  { top: '40%', left: '42%', size: 3, at: 0.68, delay: '1.6s' },
  { top: '12%', left: '70%', size: 4, at: 0.74, delay: '0.9s' },
  { top: '32%', left: '54%', size: 3, at: 0.8, delay: '2.1s' },
  { top: '7%', left: '22%', size: 3, at: 0.86, delay: '1.3s' },
  { top: '44%', left: '74%', size: 4, at: 0.92, delay: '0.5s' },
]

const DUSK_STARS = [
  { top: '16%', left: '18%', size: 3, at: 0.42, delay: '0.4s' },
  { top: '10%', left: '72%', size: 4, at: 0.58, delay: '1.2s' },
  { top: '28%', left: '46%', size: 3, at: 0.74, delay: '0.2s' },
  { top: '20%', left: '88%', size: 3, at: 0.88, delay: '1.6s' },
]

const CLOUDS = [
  { top: '12%', left: '8%', scale: 1, at: 0.05, delay: '0s', duration: '52s' },
  { top: '22%', left: '62%', scale: 0.8, at: 0.2, delay: '3s', duration: '64s' },
  { top: '8%', left: '38%', scale: 0.65, at: 0.38, delay: '1s', duration: '58s' },
  { top: '30%', left: '24%', scale: 0.9, at: 0.55, delay: '5s', duration: '70s' },
  { top: '16%', left: '80%', scale: 0.7, at: 0.74, delay: '2s', duration: '61s' },
]

function reveal(progress, at) {
  return Math.max(0, Math.min(1, (progress - at) / 0.12))
}

function PixelMoon() {
  return (
    <svg className="scene-pixel scene-pixel--moon" viewBox="0 0 16 16" aria-hidden="true">
      <g fill="#FFF6E9">
        <rect x="6" y="1" width="4" height="2" />
        <rect x="4" y="3" width="4" height="2" />
        <rect x="3" y="5" width="4" height="2" />
        <rect x="2" y="7" width="4" height="2" />
        <rect x="3" y="9" width="4" height="2" />
        <rect x="4" y="11" width="4" height="2" />
        <rect x="6" y="13" width="4" height="2" />
      </g>
    </svg>
  )
}

function PixelSun({ setting = false }) {
  return (
    <svg className={`scene-pixel ${setting ? 'scene-pixel--sun-low' : 'scene-pixel--sun'}`} viewBox="0 0 16 16" aria-hidden="true">
      <g fill={setting ? '#C4786A' : '#ECA994'}>
        <rect x="7" y="1" width="2" height="2" />
        <rect x="7" y="13" width="2" height="2" />
        <rect x="1" y="7" width="2" height="2" />
        <rect x="13" y="7" width="2" height="2" />
        <rect x="3" y="3" width="2" height="2" />
        <rect x="11" y="3" width="2" height="2" />
        <rect x="3" y="11" width="2" height="2" />
        <rect x="11" y="11" width="2" height="2" />
      </g>
      <g fill={setting ? '#ECA994' : '#FFF6E9'}>
        <rect x="5" y="5" width="6" height="6" />
      </g>
    </svg>
  )
}

function PixelSprout({ progress }) {
  return (
    <svg className="scene-pixel scene-pixel--ground" viewBox="0 0 16 16" aria-hidden="true">
      <g fill="#B8D6BE">
        <rect x="7" y="10" width="2" height="4" opacity={reveal(progress, 0.16)} />
        <rect x="4" y="8" width="3" height="2" opacity={reveal(progress, 0.34)} />
        <rect x="9" y="7" width="3" height="2" opacity={reveal(progress, 0.52)} />
        <rect x="6" y="5" width="2" height="2" opacity={reveal(progress, 0.7)} />
      </g>
      <g fill="#ECA994">
        <rect x="5" y="14" width="6" height="2" opacity={reveal(progress, 0.08)} />
      </g>
    </svg>
  )
}

function PixelWindow({ progress }) {
  return (
    <svg className="scene-pixel scene-pixel--ground" viewBox="0 0 16 16" aria-hidden="true">
      <g fill="#3B302C">
        <rect x="3" y="4" width="10" height="9" opacity={reveal(progress, 0.2)} />
      </g>
      <g fill="#FFF6E9">
        <rect x="5" y="6" width="2" height="2" opacity={reveal(progress, 0.4)} />
        <rect x="9" y="6" width="2" height="2" opacity={reveal(progress, 0.58)} />
        <rect x="5" y="9" width="2" height="2" opacity={reveal(progress, 0.74)} />
        <rect x="9" y="9" width="2" height="2" opacity={reveal(progress, 0.88)} />
      </g>
    </svg>
  )
}

function StarField({ stars, progress }) {
  return stars.map((star) => (
    <div
      key={`${star.top}-${star.left}`}
      className="scene-star"
      style={{
        top: star.top,
        left: star.left,
        width: star.size,
        height: star.size,
        '--fade': reveal(progress, star.at),
      }}
    >
      <i className="scene-star__glint" style={{ animationDelay: star.delay }} />
    </div>
  ))
}

function CloudField({ clouds, progress, warm = false }) {
  return clouds.map((cloud) => (
    <div
      key={`${cloud.top}-${cloud.left}`}
      className={`scene-cloud${warm ? ' scene-cloud--warm' : ''}`}
      style={{
        top: cloud.top,
        left: cloud.left,
        '--fade': reveal(progress, cloud.at),
        animationDelay: cloud.delay,
        animationDuration: cloud.duration,
      }}
    >
      <i style={{ transform: `scale(${cloud.scale})` }} />
    </div>
  ))
}

export default function Sky({ progress = 0, phase = 'idle', scene = 'day' }) {
  const grown = Math.max(0, Math.min(1, progress))
  const painted = scene === 'sunset' || scene === 'night' ? scene : 'day'

  return (
    <div
      className={`sky sky--${painted}${phase === 'break' ? ' sky--break' : ''}`}
      style={{ '--sky-progress': grown }}
      aria-hidden="true"
    >
      <div className="scene-wash scene-wash--sunset" />
      <div className="scene-wash scene-wash--night" />

      <div className="scene-layer scene-layer--day">
        <div className="scene-haze" style={{ opacity: 0.15 + grown * 0.45 }} />
        <PixelSun />
        <PixelSprout progress={grown} />
        <CloudField clouds={CLOUDS} progress={grown} />
      </div>

      <div className="scene-layer scene-layer--sunset">
        <div className="scene-horizon" style={{ opacity: 0.35 + grown * 0.4 }} />
        <PixelSun setting />
        <PixelSprout progress={grown} />
        <CloudField clouds={CLOUDS} progress={grown} warm />
        <StarField stars={DUSK_STARS} progress={grown} />
      </div>

      <div className="scene-layer scene-layer--night">
        <div className="scene-haze" style={{ opacity: 0.2 + grown * 0.45 }} />
        <PixelMoon />
        <PixelWindow progress={grown} />
        <div className="scene-band" style={{ opacity: reveal(grown, 0.72) }} />
        <StarField stars={STARS} progress={grown} />
      </div>
    </div>
  )
}
