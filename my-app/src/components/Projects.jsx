import { useState, useRef, useEffect } from 'react'
import { FaTrashCan, FaChevronDown, FaChevronUp } from 'react-icons/fa6'
import { formatDistanceToNow } from 'date-fns'

const PIXEL_ICONS = {
    book: [[2,3,10,11],[3,4,8,2],[3,7,8,2],[3,10,8,2]],
    leaf: [[7,2,2,4],[5,5,6,3],[4,8,3,3],[8,8,3,2],[7,11,2,3]],
    moon: [[6,2,4,2],[5,4,3,8],[6,12,4,2]],
    mug: [[3,4,8,7],[4,5,6,4],[11,5,2,3],[4,12,6,2]],
    star: [[7,2,2,3],[5,5,6,2],[4,7,8,2],[6,9,4,3],[5,12,2,2],[9,12,2,2]],
}

function iconKind(name) {
    const kinds = Object.keys(PIXEL_ICONS)
    let hash = 0
    const label = name || ''
    for (let i = 0; i < label.length; i += 1) hash = (hash + label.charCodeAt(i)) % kinds.length
    return kinds[hash]
}

function PixelIcon({ name }) {
    const rects = PIXEL_ICONS[iconKind(name)]
    return (
        <svg className="pixel-icon" viewBox="0 0 16 16" aria-hidden="true">
            {rects.map(([x, y, w, h]) => (
                <rect key={`${x}-${y}`} x={x} y={y} width={w} height={h} />
            ))}
        </svg>
    )
}

export default function Projects({ apiBase, onProjectSelect, selectedProjectId, activeSessionProjectId, refreshTrigger }) {
    const [showInput, setShowInput] = useState(false)
    const [projectName, setProjectName] = useState('')
    const [projects, setProjects] = useState([])
    const [updateProjects, setUpdateProjects] = useState(0)
    const [sessions, setSessions] = useState([])
    const [openProjectId, setOpenProjectId] = useState(null)
    const [sessionsByProject, setSessionsByProject] = useState({})
    const [isExpanded, setIsExpanded] = useState(true)
    const [open, setOpen] = useState(false)
    const inputRef = useRef(null)
    const prevProjectsRef = useRef([])
    const newProjectIdsRef = useRef(new Set())
    const isInitialLoadRef = useRef(true)

    async function getProjects(){
        const res = await fetch(`${apiBase}/projects`, {
            method: "GET",
            headers: {"Content-Type":"application/json"},
            credentials: "include"
        })
        const data = await res.json()
        return data
    }

    async function getSessions(projectId){
        const res = await fetch(`${apiBase}/projects/${projectId}/sessions`, {
            method: 'GET',
            credentials: "include"
        })

        const data = await res.json()
        return data
    }


    useEffect(() => {
        if (!openProjectId) return

        // Always refresh sessions when a project dropdown is opened
        (async () => {
            const data = await getSessions(openProjectId)
            setSessionsByProject(prev => ({...prev, [openProjectId]: data}))
        })()
       
    }, [openProjectId, refreshTrigger])

    // Refresh sessions for the active project when refreshTrigger changes
    useEffect(() => {
        if (activeSessionProjectId && apiBase) {
            (async () => {
                const data = await getSessions(activeSessionProjectId)
                setSessionsByProject(prev => ({...prev, [activeSessionProjectId]: data}))
                // Auto-open the project if it's not already open
                if (openProjectId !== activeSessionProjectId) {
                    setOpenProjectId(activeSessionProjectId)
                }
            })()
        }
    }, [refreshTrigger, activeSessionProjectId, apiBase])

    useEffect(() => {
        let cancelled = false
        getProjects().then(async (data) => {
            const list = Array.isArray(data) ? data : []
            if (isInitialLoadRef.current) {
                newProjectIdsRef.current = new Set(list.map(p => p.projectId))
                isInitialLoadRef.current = false
            } else {
                const prevIds = new Set(prevProjectsRef.current.map(p => p.projectId))
                newProjectIdsRef.current = new Set(
                    list.filter(p => !prevIds.has(p.projectId)).map(p => p.projectId)
                )
            }
            prevProjectsRef.current = list
            setProjects(list)
            const pairs = await Promise.all(list.map(async (project) => {
                try {
                    const sessions = await getSessions(project.projectId)
                    return [project.projectId, Array.isArray(sessions) ? sessions : []]
                } catch {
                    return [project.projectId, []]
                }
            }))
            if (!cancelled) setSessionsByProject(Object.fromEntries(pairs))
        })
        return () => { cancelled = true }
    }, [updateProjects])

    useEffect(() => {
        if (showInput && inputRef.current) {
            inputRef.current.focus()
        }
    }, [showInput])

    useEffect(() => {
        if (!open) return
        const onKey = (e) => {
            if (e.key === 'Escape') setOpen(false)
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [open])

    async function handleSubmit(e) {
        e.preventDefault()
        if (projectName.trim()) {
            console.log("Creating project:", projectName)
            // TODO: API call to create project

            try {
            const res = await fetch(`${apiBase}/projects`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                credentials: "include",
                body: JSON.stringify({name: projectName})
            })
            
            const data = await res.json()
            if (!res.ok) {
                console.error("Error with adding project")
            }
            setUpdateProjects((prev) => prev + 1)
        } catch(err) {
            console.error(err)
            
        }

            setProjectName('')
            setShowInput(false)
        }
    }

    async function handleDelete(e, projectId) {
        e.preventDefault()
        try {
            const res = await fetch(`${apiBase}/projects`, {
                method: "DELETE",
                headers: {"Content-Type":"application/json"},
                credentials: "include",
                body: JSON.stringify({projectId})
            }) 
            if (res.ok) {
                setUpdateProjects((prev) => prev - 1)
            }

        } catch(err) {
            console.error(err)
        }
    }

    function handleAddClick() {
        setShowInput(true)
    }

    function handleBlur() {
        if (!projectName.trim()) {
            setShowInput(false)
        }
    }

    function formatDuration(seconds) {
        if (seconds >= 3600) {
            // Round to nearest hour
            const hours = Math.round(seconds / 3600)
            return `${hours} ${hours === 1 ? 'hour' : 'hours'}`
        } else if (seconds >= 60) {
            // Round to nearest minute
            const minutes = Math.round(seconds / 60)
            return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`
        } else {
            // Show seconds
            return `${seconds} ${seconds === 1 ? 'second' : 'seconds'}`
        }
    }

    function projectSummary(projectId) {
        const list = sessionsByProject[projectId] || []
        if (!list.length) return 'No sessions yet'
        const total = list.reduce((sum, session) => sum + (Number(session.duration_seconds) || 0), 0)
        const count = `${list.length} ${list.length === 1 ? 'session' : 'sessions'}`
        return `${formatDuration(total)} · ${count}`
    }

    function formatBreakDuration(seconds) {
        if (seconds >= 3600) {
            const hours = Math.round(seconds / 3600)
            return `${hours} ${hours === 1 ? 'hour' : 'hours'}`
        } else if (seconds >= 60) {
            const minutes = Math.round(seconds / 60)
            return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`
        } else {
            return `${seconds} ${seconds === 1 ? 'second' : 'seconds'}`
        }
    }

    
    return (
        <>
        {open && (
            <button
                type="button"
                className="projects-backdrop"
                aria-label="Close projects"
                onClick={() => setOpen(false)}
            />
        )}
        <div className={`projects-drawer${open ? ' is-open' : ''}`}>
            <button
                type="button"
                className="projects-tab"
                aria-expanded={open}
                onClick={() => setOpen((prev) => !prev)}
            >
                Projects
            </button>
        <div className='projects-panel'>
            <button type="button" className="journal-close" onClick={() => setOpen(false)}>
              Close
            </button>
            <div className='projects-sidebar__header'>
              <button
                type='button'
                className='projects-sidebar__dropdown-toggle'
                onClick={() => setIsExpanded(!isExpanded)}
                aria-label={isExpanded ? 'Collapse projects' : 'Expand projects'}
              >
                {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
              </button>
              <div className="journal-heading">
                <h3 className='projects-sidebar__title'>Projects</h3>
                <p className="journal-kicker">A small record of what you finish</p>
              </div>
              {!showInput ? (
                <button
                  type='button'
                  className='projects-sidebar__add'
                  aria-label='Add project'
                  onClick={handleAddClick}
                >
                  +
                </button>
              ) : (
                <form onSubmit={handleSubmit} className='projects-sidebar__input-form'>
                  <input
                    ref={inputRef}
                    type='text'
                    className='projects-sidebar__input'
                    placeholder='Project name'
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    onBlur={handleBlur}
                    maxLength={30}
                  />
                </form>
              )}
            </div>
            {isExpanded && (
            <div className="projects-sidebar__list">
            {projects.length === 0 ? (
                <p className="projects-sidebar__empty">No projects yet</p>
            ) : (
                <ul className='projects-list journal-list'>
                {projects.map((obj) => (
                    <li
                        className={`journal-card ${selectedProjectId === obj.projectId ? 'is-selected' : ''} ${newProjectIdsRef.current.has(obj.projectId) ? 'project-line--new' : ''}`}
                        key={obj.projectId}
                        onAnimationEnd={() => {
                            newProjectIdsRef.current.delete(obj.projectId)
                        }}
                    >
                        <button
                            type="button"
                            className="journal-card__main"
                            onClick={() => {
                                setOpenProjectId(prev => prev === obj.projectId ? null : obj.projectId)
                                if (onProjectSelect) onProjectSelect(obj.projectId)
                            }}
                        >
                            <PixelIcon name={obj.name} />
                            <span className="journal-card__copy">
                                <span className="journal-card__name">{obj.name}</span>
                                <span className="journal-card__meta">{projectSummary(obj.projectId)}</span>
                            </span>
                        </button>
                        <button
                            type="button"
                            className="journal-card__delete"
                            aria-label={`Delete ${obj.name}`}
                            onClick={(e) => handleDelete(e, obj.projectId)}
                        >
                            <FaTrashCan />
                        </button>
                        {openProjectId === obj.projectId && (
                            <ul className='sessions-list'>
                                {activeSessionProjectId === obj.projectId && (
                                    <li className='session-in-progress'>
                                        <span className='in-progress-indicator'>●</span> In progress
                                    </li>
                                )}
                                {(sessionsByProject[obj.projectId] || []).map(s => (
                                    <li key={s.sessionId}>
                                       {formatDuration(s.duration_seconds)} · {formatDistanceToNow(new Date(s.session_date), { addSuffix: true })} · {formatBreakDuration(s.total_break || 0)} break
                                    </li>
                                ))}
                            </ul>
                        )}
                    </li>
                ))}
                </ul>
            )}
            
            </div>
            )}
           
        </div>
        </div>
        </>
    )
}