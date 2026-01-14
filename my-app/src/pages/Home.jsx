import React, { useEffect, useState } from "react"
import Projects from "../components/Projects"
import Title from "../components/Title"
import Time from "../components/Time"
import Header from "../components/Header"


export default function Home({ apiBase }) {
    
    const [isRunning, setIsRunning] = useState(false)
    const [isPause, setIsPause] = useState(false);
    const [isSoundOn, setIsSoundOn] = useState(true);
    const [isReset, setIsReset] = useState(false)
    const [selectedProjectId, setSelectedProjectId] = useState(null)
    const [activeSessionProjectId, setActiveSessionProjectId] = useState(null)
    const [refreshSessionsTrigger, setRefreshSessionsTrigger] = useState(0)
  const [addTimeHandler, setAddTimeHandler] = useState(null)

    useEffect(() => {
        async function checkAuth() {
            try {
                const res = await fetch(`${apiBase}/auth/me`, {
                    credentials: "include"
                })
                if (!res.ok) {
                    window.location.href = "/login"
                }
            } catch (err) {
                window.location.href = "/login"
            }
        }
        checkAuth()
    }, [apiBase])

    async function handleLogout() {
        await fetch(`${apiBase}/auth/logout`, {
            method: "POST",
            credentials: "include"
        })

        window.location.href = "/login"
    }


    const handleSessionStart = (projectId) => {
        setActiveSessionProjectId(projectId)
        setRefreshSessionsTrigger(prev => prev + 1)
    }

    const handleSessionFinish = (projectId) => {
        setActiveSessionProjectId(null)
        setRefreshSessionsTrigger(prev => prev + 1)
    }

    return (
        <>
            <Projects 
                apiBase={apiBase} 
                onProjectSelect={setSelectedProjectId} 
                selectedProjectId={selectedProjectId}
                activeSessionProjectId={activeSessionProjectId}
                refreshTrigger={refreshSessionsTrigger}
            />
            <Title />
            <main className='app-layout'>
                <section className='panel-right'>   
                    <Time 
                        isRunning={isRunning} 
                        setIsRunning={setIsRunning} 
                        isPause={isPause} 
                        isSoundOn={isSoundOn} 
                        isReset={isReset} 
                        setIsReset={setIsReset}
                        selectedProjectId={selectedProjectId}
                        apiBase={apiBase}
                        onSessionStart={handleSessionStart}
                        onSessionFinish={handleSessionFinish}
                    onAddTimeReady={(fn) => setAddTimeHandler(() => fn)} // store function, not execute
                    />
                <Header 
                    isRunning={isRunning} 
                    isPause = {isPause} 
                    setIsPause = {setIsPause} 
                    isSoundOn={isSoundOn} 
                    setIsSoundOn={setIsSoundOn} 
                    setIsReset = {setIsReset}
                    onAddTime={addTimeHandler}
                />
                </section>
            </main>
            <div style={{ maxWidth: 600, margin: "40px auto", fontFamily: "sans-serif" }}>
                <p>You are logged in</p>
                <button onClick = {handleLogout} className = "logout" style={{ marginTop: 16, padding: "8px 16px"}}>
                    Logout
                </button>
            </div>
        </>
    )
}