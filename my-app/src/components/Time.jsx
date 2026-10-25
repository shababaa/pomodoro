import { useEffect, useState, useRef, useCallback } from 'react'
import '../App.css'
import sound from "../assets/sounds/simplenoise.mp3"
import Pause from './Pause';
import { remainingWholeSeconds } from '../utils/timerClock'

export default function Time({ isRunning, setIsRunning, isPause, isSoundOn, isReset, setIsReset, selectedProjectId, apiBase, onSessionStart, onSessionFinish, onAddTimeReady, onFocusProgress}) {

  const [time, setTime] = useState(0); 
  const [prevTime, setPrevTime] = useState(0)
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

  const handleInput = (e) => {
    if (e.target.value.length >2) {
      e.target.value = e.target.value.slice(0,2)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    const hours = parseInt(e.target.hours.value) || 0;
    const minutes = parseInt(e.target.minutes.value) || 0;
    const seconds = parseInt(e.target.seconds.value) || 0;
    const totalSeconds = hours*3600 + minutes*60 + seconds
    
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
  }

  const handleFinishSession = async () => {
    setShowBreakOptions(false)
    setIsBreakMode(false)
    isBreakModeRef.current = false
    const studySeconds = sessionStudyTime
    const breakSeconds = sessionBreakTime
    sessionStudyMsRef.current = 0
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
  }

  const disableWheel = (e) => e.preventDefault();

  function playSound() {
    const played = new Audio(sound).play()
    if (played && typeof played.catch === 'function') {
      played.catch(() => {})
    }
  }

  const handleAddTime = useCallback((minutes) => {
    const addedMs = minutes * 60 * 1000
    // Also update initialDurationRef if it's a study timer (not break)
    if (!isBreakModeRef.current) {
      initialDurationRef.current += minutes * 60
    }
    if (endTimeRef.current != null) {
      endTimeRef.current += addedMs
      setTime(remainingWholeSeconds(endTimeRef.current, Date.now()))
    } else {
      remainingMsRef.current += addedMs
      setTime(Math.ceil(remainingMsRef.current / 1000))
    }
  }, [])

  // Expose handleAddTime to parent (Header) so buttons can adjust time
  useEffect(() => {
    if (onAddTimeReady) {
      onAddTimeReady(handleAddTime)
    }
  }, [onAddTimeReady, handleAddTime])

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
      if (!isBreakModeRef.current && isRunningRef.current) {
        const plannedMs = initialDurationRef.current * 1000
        const remainingMs = endTimeRef.current != null
          ? Math.max(0, endTimeRef.current - Date.now())
          : remainingMsRef.current
        segmentMs = Math.max(0, plannedMs - remainingMs)
      }
      const elapsedMs = Math.round((sessionStudyMsRef.current + segmentMs) / 1000) * 1000
      let phase = 'idle'
      if (isBreakModeRef.current) phase = 'break'
      else if (isRunningRef.current || sessionStudyMsRef.current > 0 || segmentMs > 0) phase = 'focus'
      onFocusProgress({ elapsedMs, phase })
    }

    report()
    const id = setInterval(report, 1000)
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
        <div className='time'>
          <input className='hours'
            defaultValue = { isReset ? String(Math.floor(prevTime/3600)).padStart(2,0): ''}
            type='number'
            placeholder='00'
            id = "time"
            name = "hours"
            maxLength={2}
            inputMode='numeric'
            onInput={handleInput}
            onWheel={disableWheel}/>:
          <input className='minutes'
            defaultValue = { isReset ? String(Math.floor((prevTime %3600) / 60)).padStart(2,0): ''}
            type='number'
            id = "time"
            name = "minutes"
            placeholder='00'
            maxLength={2}
            onInput={handleInput}
            inputMode='numeric'
            onWheel={disableWheel}/>:
          <input className='seconds'
            defaultValue = { isReset ? String(Math.floor(prevTime % 60)).padStart(2,0): ''}
            type='number'
            id = "time"
            name = "seconds"
            placeholder='00'
            maxLength={2}
            inputMode='numeric'
            onWheel={disableWheel}
            onInput={handleInput}/>
        </div>
        <div className='button-container'>
          <button type= "submit" className='time-button'>Begin</button>
        </div>
      </form>
  </div>
    )
  )
}
