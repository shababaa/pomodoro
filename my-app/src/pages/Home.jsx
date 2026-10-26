import React, { useCallback, useEffect, useState } from "react"
import Projects from "../components/Projects"
import Title from "../components/Title"
import Time from "../components/Time"
import Header from "../components/Header"
import Sky from "../components/Sky"


export default function Home({ apiBase }) {
    
    const [isRunning, setIsRunning] = useState(false)
    const [isPause, setIsPause] = useState(false);
    const [isSoundOn, setIsSoundOn] = useState(true);
    const [isReset, setIsReset] = useState(false)
    const [selectedProjectId, setSelectedProjectId] = useState(null)
    const [activeSessionProjectId, setActiveSessionProjectId] = useState(null)
    const [refreshSessionsTrigger, setRefreshSessionsTrigger] = useState(0)
    const [focusProgress, setFocusProgress] = useState({ elapsedMs: 0, phase: 'idle', stage: 0 })

    const handleFocusProgress = useCallback((next) => {
        setFocusProgress((prev) => {
            if (prev.phase === next.phase && prev.elapsedMs === next.elapsedMs && prev.stage === next.stage) return prev
            return next
        })
    }, [])

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
        <div className="home-shell">
            <Sky stage={focusProgress.stage} phase={focusProgress.phase} />
            <Projects 
                apiBase={apiBase} 
                onProjectSelect={setSelectedProjectId} 
                selectedProjectId={selectedProjectId}
                activeSessionProjectId={activeSessionProjectId}
                refreshTrigger={refreshSessionsTrigger}
            />
            <Title />
            <main className='app-layout'>
                <section className='panel-right cozy-stage'>   
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
                        onFocusProgress={handleFocusProgress}
                    />
                <Header 
                    isRunning={isRunning} 
                    isPause = {isPause} 
                    setIsPause = {setIsPause} 
                    isSoundOn={isSoundOn} 
                    setIsSoundOn={setIsSoundOn} 
                    setIsReset = {setIsReset}
                />
                </section>
            </main>
            <button type="button" onClick={handleLogout} className="logout-quiet">
                Log out
            </button>
        </div>
    )
}