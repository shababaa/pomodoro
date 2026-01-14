import { useEffect, useState, useRef, useCallback } from 'react'
import '../App.css'
import sound from "../assets/sounds/simplenoise.mp3"
import Pause from './Pause';

export default function Time({ isRunning, setIsRunning, isPause, isSoundOn, isReset, setIsReset, selectedProjectId, apiBase, onSessionStart, onSessionFinish, onAddTimeReady}) {

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
    // Create session with accumulated study and break times
    if (!sessionCreatedRef.current && selectedProjectIdRef.current && sessionStudyTime > 0) {
      sessionCreatedRef.current = true
      await createSession(selectedProjectIdRef.current, sessionStudyTime, sessionBreakTime)
      // Notify that session is finished
      if (onSessionFinish && selectedProjectIdRef.current) {
        onSessionFinish(selectedProjectIdRef.current)
      }
      // Reset session tracking
      setSessionStudyTime(0)
      setSessionBreakTime(0)
    }
    // Return to normal timer input
    setTime(0)
    setPrevTime(0)
  }

  const disableWheel = (e) => e.preventDefault();

  function playSound() {
    new Audio(sound).play();
  }

  const handleAddTime = useCallback((minutes) => {
    setTime(prevTime => prevTime + (minutes * 60))
    // Also update initialDurationRef if it's a study timer (not break)
    if (!isBreakModeRef.current) {
      initialDurationRef.current += (minutes * 60)
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
  }, [isPause, isReset, prevTime, isSoundOn, selectedProjectId])

  useEffect(() => {
    if (isReset) {
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
  }}, [isReset, prevTime, setPrevTime, isRunning, onSessionFinish])

  useEffect(() => {
    // imperative function
    // if isRunning is False (timer is not running), return
    if (!isRunning) {
      // when reset is true,  set it back to false after stopping timer
      setIsReset(false)
      return
    }
    const id = setInterval(() => {
      setTime((t) => {
        if (isResetRef.current) {
          // if reset is true, stop timer, clear interval
          clearInterval(id)
          return 0
        }
        if (isPauseRef.current) {
          return t
        }
        if (t<=1) { 
          if (isSoundRef.current){
            playSound()
          }
          setIsRunning(false)
          
          if (isBreakModeRef.current) {
            // Break timer completed
            const breakDuration = breakStartTimeRef.current
            setSessionBreakTime(prev => prev + breakDuration)
            setIsBreakMode(false)
            isBreakModeRef.current = false
            setOptionsType('after-break')
            setShowBreakOptions(true)
          } else {
            // Study timer completed
            const studyDuration = initialDurationRef.current
            setSessionStudyTime(prev => prev + studyDuration)
            // If we already have session time (from previous study or break), we're continuing a session
            // Otherwise, it's a new session
            setOptionsType('after-study')
            setShowBreakOptions(true)
          }
          return 0
        }
        return t-1
      })
    }, 1000)

    //return cleanup callback function that React can refer back to when the dependency changes (which is when timer stops)
    return () => clearInterval(id)
  }, [isRunning, setIsRunning])
  
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
