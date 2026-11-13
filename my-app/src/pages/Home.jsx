import React, { useCallback, useEffect, useState } from "react"
import Projects from "../components/Projects"
import Time from "../components/Time"
import Header from "../components/Header"
import Sky from "../components/Sky"
import SceneControl from "../components/SceneControl"
import AmbientPanel from "../components/AmbientPanel"
import DevSceneScrubber from "../components/DevSceneScrubber"
import { displaySkyProgress, resolveScene, sanitizeSceneChoice } from "../utils/skyStage"
import { clearTimerDraft, loadTimerDraft } from "../utils/timerDraft"

const SCENE_KEY = "pomodoro-scene"

function readSceneChoice() {
    try {
        return sanitizeSceneChoice(localStorage.getItem(SCENE_KEY))
    } catch {
        return "auto"
    }
}

function useLocalHour() {
    const [hour, setHour] = useState(() => new Date().getHours())
    useEffect(() => {
        const tick = () => setHour(new Date().getHours())
        const id = setInterval(tick, 30 * 1000)
        document.addEventListener("visibilitychange", tick)
        return () => {
            clearInterval(id)
            document.removeEventListener("visibilitychange", tick)
        }
    }, [])
    return hour
}


export default function Home({ apiBase }) {
    
    const [boot] = useState(() => {
        try { return loadTimerDraft(localStorage, Date.now()) } catch { return null }
    })
    const [isRunning, setIsRunning] = useState(() => Boolean(boot?.running))
    const [isPause, setIsPause] = useState(() => Boolean(boot?.paused));
    const [isSoundOn, setIsSoundOn] = useState(true);
    const [isReset, setIsReset] = useState(false)
    const [selectedProjectId, setSelectedProjectId] = useState(() => boot?.projectId ?? null)
    const [activeSessionProjectId, setActiveSessionProjectId] = useState(null)
    const [refreshSessionsTrigger, setRefreshSessionsTrigger] = useState(0)
    const [focusProgress, setFocusProgress] = useState({ elapsedMs: 0, phase: 'idle', progress: 0 })
    const [sceneChoice, setSceneChoice] = useState(readSceneChoice)
    // Display-only. Never passed into Time, so it cannot finish a session or write a record.
    const [previewProgress, setPreviewProgress] = useState(null)
    const hour = useLocalHour()
    const scene = resolveScene(sceneChoice, hour)

    useEffect(() => {
        try { localStorage.setItem(SCENE_KEY, sceneChoice) } catch { /* private mode */ }
    }, [sceneChoice])

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
        clearTimerDraft(localStorage)
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
        <div className={`home-shell${import.meta.env.DEV ? " home-shell--preview" : ""}`}>
            <Sky
                progress={displaySkyProgress(focusProgress.progress, previewProgress)}
                phase={focusProgress.phase}
                scene={scene}
            />
            <Projects 
                apiBase={apiBase} 
                onProjectSelect={setSelectedProjectId} 
                selectedProjectId={selectedProjectId}
                activeSessionProjectId={activeSessionProjectId}
                refreshTrigger={refreshSessionsTrigger}
            />
            <div className="timer-corner">
                <SceneControl choice={sceneChoice} onChange={setSceneChoice} />
                <AmbientPanel />
                <Header isSoundOn={isSoundOn} setIsSoundOn={setIsSoundOn} />
                <button type="button" onClick={handleLogout} className="logout-quiet">
                    Log out
                </button>
            </div>
            {import.meta.env.DEV && (
                <DevSceneScrubber
                    live={focusProgress.progress}
                    preview={previewProgress}
                    onPreview={setPreviewProgress}
                />
            )}
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