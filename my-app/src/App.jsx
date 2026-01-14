import Header from './components/Header'
import Time from "./components/Time"
import Title from './components/Title'
import ProjectsBar from './components/ProjectsBar'
import NavItem from './components/NavItem'

import { useEffect, useState, useRef } from 'react'
import { CSSTransition } from 'react-transition-group'
import { Routes, Route, Navigate } from "react-router-dom"
import './App.css'
import Login from './pages/Login'
import Home from './pages/Home'
import Register from './pages/Register'
import axios from 'axios'
import ProtectedRoute from './pages/ProtectedRoute'
import Projects from './components/Projects'

const API_BASE = "http://localhost:5000"



function App() {
  const [data, setData] = useState([{}])
  const [toggleProjects, setToggleProjects] = useState(false)
  const [projects, setProjects] = useState([])
  const [newProject, setNewProject] = useState("")

  const homeElement = (
    <ProtectedRoute apiBase={API_BASE}>
      <Home apiBase={API_BASE}/>
    </ProtectedRoute>
  )
  
  const handleClick = () => {
    setToggleProjects((prev) => !prev)
  }

  const [temp, setTemp] = useState([])
  
    //temporary  
    const fetchAPI = async () => {
      try {
      const response = await axios.get("http://localhost:5000/users")
      console.log(response)
      if (!response.ok) {
          throw new Error(`HTTP error. status: ${response.status}`)
      }
      const result = await response.json()
      
    } catch(err) {
      console.error("Couldn't fetch data:", err)
    }
  }
  
    useEffect(() => {
      fetchAPI()
    }, [])
  return (
    <>
    <Routes>
      <Route path="/" element={homeElement}/>
      <Route path='/login' element={<Login apiBase={API_BASE}/>} />
      <Route path="/register" element={<Register apiBase={API_BASE}/>} />
      <Route path="/home" element={<Navigate to="/" replace />}/>
    </Routes>
  
    </>
  )
}

export default App



{/* 
  <Routes>
      <Route path="/login" element={<Login apiBase={API_BASE}/>}/>
      <Route path="/register" element={<Register apiBase={API_BASE}/>} />
      <Route 
        path="/"
        element={
          
            <>
              <Title />

              <main className='app-layout'>
                <section className='panel-right'>   
                  <Time isRunning={isRunning} setIsRunning={setIsRunning} isPause = {isPause} isSoundOn = {isSoundOn} isReset = {isReset} setIsReset = {setIsReset}/>
                  <Header isRunning={isRunning} isPause = {isPause} setIsPause = {setIsPause} isSoundOn={isSoundOn} setIsSoundOn={setIsSoundOn} setIsReset = {setIsReset}/>
                </section>
              </main>

              <ProjectsBar>
                <NavItem icon="Projects">
                </NavItem>
              </ProjectsBar>
              
            
            
            <Home apiBase = {API_BASE} />
          </>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  */}




