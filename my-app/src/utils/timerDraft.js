export const TIMER_DRAFT_KEY = 'pomodoro-timer'

function nonNegative(value) {
  const number = Number(value)
  if (!Number.isFinite(number)) return 0
  return Math.max(0, number)
}

export function timerDraftFromState(state) {
  return {
    v: 1,
    running: Boolean(state.running),
    paused: Boolean(state.paused),
    endTime: state.endTime == null ? null : nonNegative(state.endTime),
    remainingMs: nonNegative(state.remainingMs),
    breakMode: Boolean(state.breakMode),
    plannedSeconds: nonNegative(state.plannedSeconds),
    breakPlanned: nonNegative(state.breakPlanned),
    studySeconds: nonNegative(state.studySeconds),
    breakSeconds: nonNegative(state.breakSeconds),
    studyMs: nonNegative(state.studyMs),
    earned: Math.min(1, nonNegative(state.earned)),
    showBreakOptions: Boolean(state.showBreakOptions),
    optionsType: state.optionsType === 'after-break' ? 'after-break' : 'after-study',
    projectId: state.projectId == null ? null : state.projectId,
  }
}

export function readTimerDraft(storage) {
  try {
    const raw = JSON.parse(storage.getItem(TIMER_DRAFT_KEY) || 'null')
    if (!raw || raw.v !== 1) return null
    return timerDraftFromState(raw)
  } catch {
    return null
  }
}

/**
 * If a running deadline already passed, count that block once and land on
 * the same screen the timer would have shown. A second settle does not add again.
 */
export function settleTimerDraft(draft, now) {
  if (!draft || !draft.running || draft.paused || draft.showBreakOptions) return draft
  if (draft.endTime == null || draft.endTime > now) return draft
  if (draft.breakMode) {
    return timerDraftFromState({
      ...draft,
      running: false,
      paused: false,
      endTime: null,
      remainingMs: 0,
      breakMode: false,
      breakSeconds: draft.breakSeconds + draft.breakPlanned,
      showBreakOptions: true,
      optionsType: 'after-break',
    })
  }
  return timerDraftFromState({
    ...draft,
    running: false,
    paused: false,
    endTime: null,
    remainingMs: 0,
    studySeconds: draft.studySeconds + draft.plannedSeconds,
    studyMs: draft.studyMs + draft.plannedSeconds * 1000,
    earned: 1,
    showBreakOptions: true,
    optionsType: 'after-study',
  })
}

export function loadTimerDraft(storage, now) {
  const current = readTimerDraft(storage)
  const settled = settleTimerDraft(current, now)
  if (!settled) return null
  if (JSON.stringify(current) !== JSON.stringify(settled)) {
    storage.setItem(TIMER_DRAFT_KEY, JSON.stringify(settled))
  }
  return settled
}

export function writeTimerDraft(storage, state) {
  const draft = timerDraftFromState(state)
  const idle = !draft.running && !draft.showBreakOptions && draft.studySeconds === 0 && draft.studyMs === 0
  if (idle) {
    storage.removeItem(TIMER_DRAFT_KEY)
    return null
  }
  storage.setItem(TIMER_DRAFT_KEY, JSON.stringify(draft))
  return draft
}

export function clearTimerDraft(storage) {
  try { storage.removeItem(TIMER_DRAFT_KEY) } catch { /* private mode */ }
}
