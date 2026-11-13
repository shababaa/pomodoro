/**
 * Development-only sky scrubber.
 * It changes the painted focus amount and nothing else:
 * the countdown, session records, and the completion moment stay untouched.
 */
export default function DevSceneScrubber({ live = 0, preview = null, onPreview }) {
  const shown = Math.round((preview ?? live) * 100)
  const previewing = preview != null

  return (
    <div className="dev-scrubber">
      <label className="dev-scrubber__label">
        <span>Dev preview {shown}%</span>
        <input
          type="range"
          min="0"
          max="100"
          step="1"
          value={shown}
          aria-label="Preview focus progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={shown}
          aria-valuetext={`${shown} percent, does not change the timer`}
          onChange={(event) => onPreview(Number(event.target.value) / 100)}
        />
      </label>
      <button
        type="button"
        className="dev-scrubber__live"
        onClick={() => onPreview(null)}
        disabled={!previewing}
      >
        {previewing ? 'Follow timer' : 'Following timer'}
      </button>
    </div>
  )
}
