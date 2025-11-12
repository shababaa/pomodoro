import { useEffect, useState } from 'react'
import './App.css'

import Header from './components/Header'
import Time from "./components/Time"
import Title from './components/Title'
import AddFive from './components/AddFive'
import AddTen from './components/AddTen'

function App() {
  const [time, setTime] = useState(0)

  const [isRunning, setIsRunning] = useState(false)
  const [isPause, setIsPause] = useState(false);
  const [isSoundOn, setIsSoundOn] = useState(true);
  const [isReset, setIsReset] = useState(false)
  
  return (
    <>
      <Title />

      <main className='app-layout'>
        <section className='panel-right'>   
          <Time isRunning={isRunning} setIsRunning={setIsRunning} isPause = {isPause} isSoundOn = {isSoundOn} isReset = {isReset} setIsReset = {setIsReset} time = {time} setTime = {setTime}/>
          <div className='bottom-bar'>
            <AddFive setTime={setTime}/>
            <Header isRunning={isRunning} isPause = {isPause} setIsPause = {setIsPause} isSoundOn={isSoundOn} setIsSoundOn={setIsSoundOn} setIsReset = {setIsReset}/>
            <AddTen setTime={setTime}/>
          </div>
        </section>
      </main>
    </>
  )
}

export default App


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