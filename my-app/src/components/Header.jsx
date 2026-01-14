import { useState } from 'react';
import { FaVolumeHigh } from "react-icons/fa6";
import { FaPause, FaPlay } from "react-icons/fa6";
import { GrPowerReset } from "react-icons/gr";
import { IoVolumeMute } from "react-icons/io5";
import "../App.css"

export default function Header({ isRunning, isPause, setIsPause, isSoundOn, setIsSoundOn, setIsReset, onAddTime }) {

  const handleVolumeClick = () => {
    setIsSoundOn((prev) => !prev)
  }
  const handlePauseClick = () => {
    setIsPause((prev) => !prev)
  }

  const handleResetClick = () => {
    setIsReset((prev) => !prev)
  }

  return (
    <header className="header">
      {isRunning && (
        <button 
          className='add-time-button'
          onClick={() => onAddTime ? onAddTime(5) : undefined}
          aria-label='Add 5 minutes'
        >
          +5
        </button>
      )}
      {isSoundOn ? <FaVolumeHigh className="sound" size={50} color="#ffefcb" onClick={handleVolumeClick}/>: 
        <IoVolumeMute className='sound' size = {50} color='#ffefcb' onClick={handleVolumeClick}/>}
      {isRunning && !isPause && <FaPause className='pause' size={50} color="#ffefcb" onClick={handlePauseClick}/>}
      {isRunning && isPause && <FaPlay className='pause' size={50} color="#ffefcb" onClick={handlePauseClick}/>}
      {isRunning && <GrPowerReset className='reset' size={50} color="#ffefcb" fontWeight={600} onClick={handleResetClick}/>}
      {isRunning && (
        <button 
          className='add-time-button'
          onClick={() => onAddTime ? onAddTime(10) : undefined}
          aria-label='Add 10 minutes'
        >
          +10
        </button>
      )}
    </header>
  )
}