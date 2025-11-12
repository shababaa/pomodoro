import { useEffect, useState, useRef } from 'react'
import '../App.css'
import sound from "../assets/sounds/simplenoise.mp3"
import Pause from './Pause';

export default function Time({ isRunning, setIsRunning, isPause, isSoundOn, isReset, setIsReset}) {

  const [time, setTime] = useState(0); 
  const [prevTime, setPrevTime] = useState(0)
  
  const isPauseRef = useRef(isPause)
  const isSoundRef = useRef(isSoundOn)

  const isResetRef = useRef(isReset)
  const prevTimeRef = useRef(prevTime)
  

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
    setPrevTime(totalSeconds)
    // use parent's setter
    setIsRunning(true)
    setTime(totalSeconds)
  }

  const disableWheel = (e) => e.preventDefault();

  function playSound() {
    new Audio(sound).play();
  }

  useEffect(() => {
    // update Ref whenever prop changes
    isPauseRef.current = isPause
    isResetRef.current = isReset
    prevTimeRef.current = prevTime
    isSoundRef.current = isSoundOn
  }, [isPause, isReset, prevTime, isSoundOn])

  useEffect(() => {
    if (isReset) {
      setTime(prevTime);
      setPrevTime(prevTime)
      setIsRunning(false)
  }}, [isReset, prevTime, setPrevTime, isRunning] 
)

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
          return 0
        }
        return t-1
      })
    }, 1000)

    //return cleanup callback function that React can refer back to when the dependency changes (which is when timer stops)
    return () => clearInterval(id)
  }, [isRunning, setIsRunning])
  
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
    {/* <div className='show-time'>
      <h1 className='hours-o'>{Math.floor(time/3600)}</h1>
      <h1 className='minutes-o'>:{('0' + Math.floor((time % 3600) / 60)).slice(-2)}:</h1>
      <h1 className='seconds-o'> {('0' + time % 60).slice(-2)}</h1>
    </div> */}

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
            maxLength={2}z
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