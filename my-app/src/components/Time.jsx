import '../App.css'

export default function Time({ time }) {
  
  return (
  <div>
    {/* <div className='show-time'>
      <h1 className='hours-o'>{Math.floor(time/3600)}</h1>
      <h1 className='minutes-o'>:{('0' + Math.floor((time % 3600) / 60)).slice(-2)}:</h1>
      <h1 className='seconds-o'> {('0' + time % 60).slice(-2)}</h1>
    </div> */}

      <form action = "submit-time" className = 'time-form'>
        <div className='time'>
          <input className='hours'
            placeholder='0'
            id = "time"
            name = "time"
            maxLength={2}/>:
          <input className='minutes'
            id = "time"
            name = "time"
            placeholder='00'
            maxLength={2}/>:
          <input className='seconds'
            id = "time"
            name = "time"
            placeholder='00'
            maxLength={2}/>
        </div>
        <div className='button-container'>
          <button className='time-button'>Begin</button>
        </div>
      </form>

    
  </div>
  )
}