import { useEffect, useState, useRef } from 'react'
import '../App.css'
import sound from "../assets/sounds/simplenoise.mp3"
import Pause from './Pause';
import DurationPicker from './DurationPicker'
import { remainingWholeSeconds } from '../utils/timerClock'
import { skyStage } from '../utils/skyStage'

function clockFromSeconds(totalSeconds) {
  const total = Math.max(0, Math.floor(totalSeconds))
  return {
    hours: String(Math.floor(total / 3600)).padStart(2, '0'),
    minutes: String(Math.floor((total % 3600) / 60)).padStart(2, '0'),
    seconds: String(total % 60).padStart(2, '0'),
  }
}

function secondsFromClock(clock) {
  return (parseInt(clock.hours, 10) || 0) * 3600
    + (parseInt(clock.minutes, 10) || 0) * 60
    + (parseInt(clock.seconds, 10) || 0)
}

export default function Time({ isRunning, setIsRunning, isPause, isSoundOn, isReset, setIsReset, selectedProjectId, apiBase, onSessionStart, onSessionFinish, onFocusProgress}) {

  const [time, setTime] = useState(0); 
  const [prevTime, setPrevTime] = useState(0)
  const [clock, setClock] = useState({ hours: '', minutes: '', seconds: '' })
  const [showBreakOptions, setShowBreakOptions] = useState(false)
  const [isBreakMode, setIsBreakMode] = useState(false)
  const [optionsType, setOptionsType] = useState('after-study') // 'after-study' or 'after-break'
  const [sessionStudyTime, setSessionStudyTime] = useState(0)
  const [sessionBreakTime, setSessionBreakTime] = useState(0)
  const sessionCreatedRef = useRef(false)
  
  const isPauseRef = useRef(isPause)
  const isSoundRef = useRef(isSoundOn)
  const isResetRef = useRef(isReset)
  const prevTimeRef = useRef(prevTime)
  const selectedProjectIdRef = useRef(selectedProjectId)
  const initialDurationRef = useRef(0)
  const isBreakModeRef = useRef(false)
  const breakStartTimeRef = useRef(0)
  // Absolute time the countdown hits zero. Background tabs throttle
  // setInterval, so remaining time is always derived from this deadline.
  const endTimeRef = useRef(null)
  const remainingMsRef = useRef(0)
  const hasFinishedRef = useRef(false)
  const isRunningRef = useRef(isRunning)
  // Completed study time for this session, in ms. The sky keeps this
  // through a break and drops it when the session is reset or finished.
  const sessionStudyMsRef = useRef(0)
  // Fullest sky reached in this session. A finished block stays grown-in
  // through a break or another study block, until reset or finish.
  const earnedStageRef = useRef(0)

  const armDeadline = (totalSeconds) => {
    hasFinishedRef.current = false
    remainingMsRef.current = totalSeconds * 1000
    endTimeRef.current = Date.now() + remainingMsRef.current
  }

  // Change body background color based on break mode
  useEffect(() => {
    if (isBreakMode) {
      document.body.classList.add('break-mode')
    } else {
      document.body.classList.remove('break-mode')
    }
    return () => {
      document.body.classList.remove('break-mode')
    }
  }, [isBreakMode])

  const setClockPart = (key) => (event) => {
    const next = event.target.value.replace(/\D/g, '').slice(0, 2)
    setClock((prev) => ({ ...prev, [key]: next }))
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    const totalSeconds = secondsFromClock(clock)
    
    if (isBreakModeRef.current) {
      // Starting a break timer
      breakStartTimeRef.current = totalSeconds
      armDeadline(totalSeconds)
      setPrevTime(totalSeconds)
      setIsRunning(true)
      setTime(totalSeconds)
      // Keep break mode active
    } else {
      // Starting a study timer
      setPrevTime(totalSeconds)
      initialDurationRef.current = totalSeconds
      sessionCreatedRef.current = false
      setShowBreakOptions(false)
      setIsBreakMode(false)
      isBreakModeRef.current = false
      armDeadline(totalSeconds)
      setIsRunning(true)
      setTime(totalSeconds)
      // Notify that a session has started
      if (onSessionStart && selectedProjectIdRef.current) {
        onSessionStart(selectedProjectIdRef.current)
      }
    }
  }

  async function createSession(projectId, durationSeconds, totalBreak = 0) {
    if (!projectId || !apiBase) return
    
    try {
      const res = await fetch(`${apiBase}/projects/${projectId}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ durationSeconds, totalBreak })
      })
      
      if (!res.ok) {
        console.error('Failed to create session')
      }
    } catch (err) {
      console.error('Error creating session:', err)
    }
  }

  const handleStartBreak = () => {
    setShowBreakOptions(false)
    setIsBreakMode(true)
    isBreakModeRef.current = true
    // Show timer input form so user can set break duration
    setTime(0)
    setPrevTime(0)
    initialDurationRef.current = 0
    setClock({ hours: '', minutes: '', seconds: '' })
  }

  const handleContinueStudying = () => {
    setShowBreakOptions(false)
    setIsBreakMode(false)
    isBreakModeRef.current = false
    setOptionsType('after-study') // Reset to after-study so next completion shows correct options
    // Return to normal timer input to start another study session
    setTime(0)
    setPrevTime(0)
    initialDurationRef.current = 0 // Reset the initial duration
    setClock({ hours: '', minutes: '', seconds: '' })
  }

  const handleFinishSession = async () => {
    setShowBreakOptions(false)
    setIsBreakMode(false)
    isBreakModeRef.current = false
    const studySeconds = sessionStudyTime
    const breakSeconds = sessionBreakTime
    sessionStudyMsRef.current = 0
    earnedStageRef.current = 0
    setSessionStudyTime(0)
    setSessionBreakTime(0)
    // Create session with accumulated study and break times
    if (!sessionCreatedRef.current && selectedProjectIdRef.current && studySeconds > 0) {
      sessionCreatedRef.current = true
      await createSession(selectedProjectIdRef.current, studySeconds, breakSeconds)
      // Notify that session is finished
      if (onSessionFinish && selectedProjectIdRef.current) {
        onSessionFinish(selectedProjectIdRef.current)
      }
    }
    // Return to normal timer input
    setTime(0)
    setPrevTime(0)
    setClock({ hours: '', minutes: '', seconds: '' })
  }

  const disableWheel = (e) => e.preventDefault();

  function playSound() {
    const played = new Audio(sound).play()
    if (played && typeof played.catch === 'function') {
      played.catch(() => {})
    }
  }

  useEffect(() => {
    // update Ref whenever prop changes
    isPauseRef.current = isPause
    isResetRef.current = isReset
    prevTimeRef.current = prevTime
    isSoundRef.current = isSoundOn
    selectedProjectIdRef.current = selectedProjectId
    isRunningRef.current = isRunning
  }, [isPause, isReset, prevTime, isSoundOn, selectedProjectId, isRunning])

  useEffect(() => {
    if (isReset) {
      endTimeRef.current = null
      remainingMsRef.current = 0
      hasFinishedRef.current = false
      sessionStudyMsRef.current = 0
      earnedStageRef.current = 0
      setClock(clockFromSeconds(prevTime))
      setTime(prevTime);
      setPrevTime(prevTime)
      setIsRunning(false)
      setShowBreakOptions(false)
      setIsBreakMode(false)
      isBreakModeRef.current = false
      // Notify that session is finished if reset during active session
      if (onSessionFinish && selectedProjectIdRef.current) {
        onSessionFinish(selectedProjectIdRef.current)
      }
      // Reset session tracking
      setSessionStudyTime(0)
      setSessionBreakTime(0)
  }}, [isReset, prevTime, setPrevTime, isRunning, setIsRunning, onSessionFinish])

  useEffect(() => {
    if (!isRunning) {
      // when reset is true, set it back to false after stopping timer
      setIsReset(false)
      return
    }

    // Reset wins over a pause toggle that lands in the same render.
    if (isResetRef.current) {
      return
    }

    if (isPause) {
      if (endTimeRef.current != null) {
        remainingMsRef.current = Math.max(0, endTimeRef.current - Date.now())
        endTimeRef.current = null
        setTime(Math.ceil(remainingMsRef.current / 1000))
      }
      return
    }

    if (endTimeRef.current == null) {
      endTimeRef.current = Date.now() + remainingMsRef.current
    }

    let intervalId
    let completeId

    const finishTimer = () => {
      if (hasFinishedRef.current) return
      hasFinishedRef.current = true
      clearInterval(intervalId)
      clearTimeout(completeId)
      endTimeRef.current = null
      remainingMsRef.current = 0

      if (isSoundRef.current) {
        playSound()
      }

      setTime(0)
      setIsRunning(false)

      if (isBreakModeRef.current) {
        const breakDuration = breakStartTimeRef.current
        setSessionBreakTime(prev => prev + breakDuration)
        setIsBreakMode(false)
        isBreakModeRef.current = false
        setOptionsType('after-break')
        setShowBreakOptions(true)
      } else {
        const studyDuration = initialDurationRef.current
        sessionStudyMsRef.current += studyDuration * 1000
        earnedStageRef.current = 3
        setSessionStudyTime(prev => prev + studyDuration)
        setOptionsType('after-study')
        setShowBreakOptions(true)
      }
    }

    const sync = () => {
      if (hasFinishedRef.current || isResetRef.current || isPauseRef.current) return
      if (endTimeRef.current == null) return

      const now = Date.now()
      const remainingMs = endTimeRef.current - now
      if (remainingMs <= 0) {
        finishTimer()
        return
      }

      setTime(remainingWholeSeconds(endTimeRef.current, now))

      // Land the final tick on the deadline instead of waiting for the next interval.
      if (remainingMs < 1000) {
        clearTimeout(completeId)
        completeId = setTimeout(sync, remainingMs + 20)
      }
    }

    const onForeground = () => {
      if (document.visibilityState === 'hidden') return
      sync()
    }

    intervalId = setInterval(sync, 200)
    document.addEventListener('visibilitychange', onForeground)
    window.addEventListener('focus', onForeground)
    window.addEventListener('pageshow', onForeground)
    sync()

    return () => {
      clearInterval(intervalId)
      clearTimeout(completeId)
      document.removeEventListener('visibilitychange', onForeground)
      window.removeEventListener('focus', onForeground)
      window.removeEventListener('pageshow', onForeground)
    }
  }, [isRunning, isPause, setIsRunning, setIsReset])

  useEffect(() => {
    if (!onFocusProgress) return

    const report = () => {
      let segmentMs = 0
      const plannedMs = initialDurationRef.current * 1000
      const studyRunning = !isBreakModeRef.current && isRunningRef.current
      if (studyRunning) {
        const remainingMs = endTimeRef.current != null
          ? Math.max(0, endTimeRef.current - Date.now())
          : remainingMsRef.current
        segmentMs = Math.max(0, plannedMs - remainingMs)
      }
      const elapsedMs = Math.round((sessionStudyMsRef.current + segmentMs) / 1000) * 1000
      const liveStage = studyRunning ? skyStage(segmentMs, plannedMs) : 0
      const stage = Math.max(liveStage, earnedStageRef.current)
      let phase = 'idle'
      if (isBreakModeRef.current) phase = 'break'
      else if (isRunningRef.current || sessionStudyMsRef.current > 0 || segmentMs > 0) phase = 'focus'
      onFocusProgress({ elapsedMs, phase, stage })
    }

    report()
    const id = setInterval(report, 250)
    const onForeground = () => {
      if (document.visibilityState === 'hidden') return
      report()
    }
    document.addEventListener('visibilitychange', onForeground)
    window.addEventListener('focus', onForeground)
    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', onForeground)
      window.removeEventListener('focus', onForeground)
    }
  }, [onFocusProgress, isRunning, isPause, isBreakMode, showBreakOptions])
  
  // Show break options after timer completes
  if (showBreakOptions) {
    // If we're continuing a session (have accumulated time), show Continue Studying option after study
    const isContinuingSession = sessionStudyTime > 0 || sessionBreakTime > 0
    
    return (
      <div className='break-options-container'>
        <div className='break-options-buttons'>
          {optionsType === 'after-study' && (
            <>
              <button 
                className='time-button break-button'
                onClick={handleStartBreak}
              >
                Start<br />Break
              </button>
              {isContinuingSession && (
                <button 
                  className='time-button continue-button'
                  onClick={handleContinueStudying}
                >
                  Continue<br />Studying
                </button>
              )}
            </>
          )}
          {optionsType === 'after-break' && (
            <button 
              className='time-button continue-button'
              onClick={handleContinueStudying}
            >
              Continue<br />Studying
            </button>
          )}
          <button 
            className='time-button finish-button'
            onClick={handleFinishSession}
          >
            Finish<br />Session
          </button>
        </div>
      </div>
    )
  }

  return (
    isRunning ? (
      <>
        <div className= 'show-time'>
          <h1>{String(Math.floor(time / 3600)).padStart(2,0)}:</h1>
          <h1>{String(Math.floor((time % 3600) /60)).padStart(2,0)}:</h1>
          <h1>{String(time % 60).padStart(2,0)}</h1>
        </div>
      </>
    ) :
    (
  <div>
      <form action = "submit-time" className = 'time-form' onSubmit={handleSubmit}>
        <DurationPicker seconds={secondsFromClock(clock)} onPick={(total) => setClock(clockFromSeconds(total))} />
        <div className='time'>
          <input className='hours'
            value={clock.hours}
            type='text'
            placeholder='00'
            id = "time"
            name = "hours"
            inputMode='numeric'
            autoComplete='off'
            aria-label='Hours'
            onChange={setClockPart('hours')}
            onWheel={disableWheel}/>:
          <input className='minutes'
            value={clock.minutes}
            type='text'
            id = "time"
            name = "minutes"
            placeholder='00'
            aria-label='Minutes'
            onChange={setClockPart('minutes')}
            inputMode='numeric'
            autoComplete='off'
            onWheel={disableWheel}/>:
          <input className='seconds'
            value={clock.seconds}
            type='text'
            id = "time"
            name = "seconds"
            placeholder='00'
            aria-label='Seconds'
            inputMode='numeric'
            autoComplete='off'
            onWheel={disableWheel}
            onChange={setClockPart('seconds')}/>
        </div>
        <div className='button-container'>
          <button type= "submit" className='time-button'>Begin</button>
        </div>
      </form>
  </div>
    )
  )
}
