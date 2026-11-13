import React, { useCallback, useEffect, useState } from "react"
import Projects from "../components/Projects"
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
    const [focusProgress, setFocusProgress] = useState({ elapsedMs: 0, phase: 'idle', progress: 0 })

    const handleFocusProgress = useCallback((next) => {
        setFocusProgress((prev) => {
            if (prev.phase === next.phase && prev.elapsedMs === next.elapsedMs && prev.progress === next.progress) return prev
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
            <Sky progress={focusProgress.progress} phase={focusProgress.phase} />
            <Projects 
                apiBase={apiBase} 
                onProjectSelect={setSelectedProjectId} 
                selectedProjectId={selectedProjectId}
                activeSessionProjectId={activeSessionProjectId}
                refreshTrigger={refreshSessionsTrigger}
            />
            <div className="timer-corner">
                <Header isSoundOn={isSoundOn} setIsSoundOn={setIsSoundOn} />
                <button type="button" onClick={handleLogout} className="logout-quiet">
                    Log out
                </button>
            </div>
            <main className="timer-stage">
                <h1 className="timer-page-name">Pomodoro</h1>
                <Time 
                    isRunning={isRunning} 
                    setIsRunning={setIsRunning} 
                    isPause={isPause}
                    setIsPause={setIsPause}
                    isSoundOn={isSoundOn} 
                    isReset={isReset} 
                    setIsReset={setIsReset}
                    selectedProjectId={selectedProjectId}
                    apiBase={apiBase}
                    onSessionStart={handleSessionStart}
                    onSessionFinish={handleSessionFinish}
                    onFocusProgress={handleFocusProgress}
                />
            </main>
        </div>
    )
}