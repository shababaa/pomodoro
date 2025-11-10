import { useEffect, useState } from 'react'
import './App.css'

import Time from "./components/Time"
import Header from './components/Header'

function App() {
  const [time, setTime] = useState(0);  // Set state variable, time
  const [isRunning, setIsRunning] = useState(false) // State isRunning variable to check if timer is >= 0


  
  const phrases = [
    "Keep Going!",
    "Great Job!",
    "You Got This!",
    "Almost There!"
  ];


  // when form input is being changed, onChange = {handleChange}, take the event's target.value
  // and check if it's a Number, setTime(val) if it is a Number
  const handleChange = (event) => {
    const val = Number(event.target.value)
    setTime(Number.isNaN(val) ? 0 : val);
  }
  
  // when form is submitted, onSubmit = {handleSubmit}, stop the event's default behaviour from navigating,
  // e.g.(reload the page when submitting to server) and override it with setIsRunning(true) if time > 0
  const handleSubmit = (e) => {
    e.preventDefault()  //stop the form from navigating (reloading)
    if (time > 0) setIsRunning(true)
  }

  // parameters(effect: imperative function that returns a cleanup function, dependencies)

  useEffect(() => {
    // imperative function
    // if isRunning is False (timer is not running), return
    if (!isRunning) return
    const id = setInterval(() => {
      setTime((t) => {
        if (t<=1) { 
          setIsRunning(false)
          return 0
        }
        return t-1
      })
    }, 1000)

    //return cleanup callback function that React can refer back to when the dependency changes (which is when timer stops)
    return () => clearInterval(id)
  }, [isRunning])


  return (
    <>
      <Header />

      <main className='app-layout'>
        

        <section className='panel-right'>
          

          {/* <form action = "submit-time" onSubmit={handleSubmit}>
            <label className = "custom-field">
              <input 
              type = "text"
              required
              id = "time"
              name = "time"
              onChange={handleChange}
              />
              <span className = "placeholder">Enter time</span>
            </label>
          <button type="submit">Start!</button>
        </form> */}
        
        <Time 
          time = {time}
          />
        

        
    
        </section>
      </main>
    </>
  )
}

export default App
