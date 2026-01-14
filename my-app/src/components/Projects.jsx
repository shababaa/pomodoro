import { useState, useRef, useEffect } from 'react'
import { FaTrashCan, FaChevronDown, FaChevronUp } from 'react-icons/fa6'
import { formatDistanceToNow } from 'date-fns'

export default function Projects({ apiBase, onProjectSelect, selectedProjectId, activeSessionProjectId, refreshTrigger }) {
    const [showInput, setShowInput] = useState(false)
    const [projectName, setProjectName] = useState('')
    const [projects, setProjects] = useState([])
    const [updateProjects, setUpdateProjects] = useState(0)
    const [sessions, setSessions] = useState([])
    const [openProjectId, setOpenProjectId] = useState(null)
    const [sessionsByProject, setSessionsByProject] = useState({})
    const [isExpanded, setIsExpanded] = useState(true)
    const inputRef = useRef(null)
    const prevProjectsRef = useRef([])
    const newProjectIdsRef = useRef(new Set())
    const isInitialLoadRef = useRef(true)
    const [hoveredProjectId, setHoveredProjectId] = useState(null)

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
        getProjects().then(data => {
            if (isInitialLoadRef.current) {
                // On initial load, animate all projects
                newProjectIdsRef.current = new Set(data.map(p => p.projectId))
                isInitialLoadRef.current = false
            } else {
                // On subsequent loads, find the new project by comparing with previous
                const prevIds = new Set(prevProjectsRef.current.map(p => p.projectId))
                newProjectIdsRef.current = new Set(
                    data.filter(p => !prevIds.has(p.projectId)).map(p => p.projectId)
                )
            }
            prevProjectsRef.current = data
            setProjects(data)
        })

    }, [updateProjects])

    useEffect(() => {
        if (showInput && inputRef.current) {
            inputRef.current.focus()
        }
    }, [showInput])

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
        <div className='projects-sidebar'>
            <div className='projects-sidebar__header'>
              <button
                type='button'
                className='projects-sidebar__dropdown-toggle'
                onClick={() => setIsExpanded(!isExpanded)}
                aria-label={isExpanded ? 'Collapse projects' : 'Expand projects'}
              >
                {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
              </button>
              <h3 className='projects-sidebar__title'>Projects</h3>
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
                <ul className='projects-list'>
                {projects.map((obj) => (
                    <div 
                        className={`project-line ${newProjectIdsRef.current.has(obj.projectId) ? 'project-line--new' : ''}`}
                        key={obj.projectId}
                        onAnimationEnd={() => {
                            newProjectIdsRef.current.delete(obj.projectId)
                        }}
                    >
                        {console.log(obj.id)}

                        <div
                            className='project-line__header'
                            onMouseEnter={() => setHoveredProjectId(obj.projectId)}
                            onMouseLeave={() => setHoveredProjectId(null)}
                        >
                            <li 
                                onClick={(e) => {
                                    e.stopPropagation()
                                    // Toggle dropdown
                                    setOpenProjectId(prev => prev === obj.projectId ? null : obj.projectId)
                                    // Select project for timer
                                    if (onProjectSelect) {
                                        onProjectSelect(obj.projectId)
                                    }
                                }}
                                style={{ cursor: 'pointer' }}
                                className={selectedProjectId === obj.projectId ? 'project-name--selected' : ''}
                            >
                                {obj.name}
                            </li>
                            {hoveredProjectId === obj.projectId && (
                                <FaTrashCan className='trash-icon' onClick={(e) => handleDelete(e, obj.projectId)}/>
                            )}
                            
                        </div>
                        
                        {openProjectId === obj.projectId && (
                            <ul className='sessions-list'>
                                {activeSessionProjectId === obj.projectId && (
                                    <li className='session-in-progress'>
                                        <span className='in-progress-indicator'>●</span> In progress
                                    </li>
                                )}
                                {(sessionsByProject[obj.projectId] || []).map(s => (
                                    <li key={s.sessionId}>
                                       {formatDuration(s.duration_seconds)} • {formatDistanceToNow(new Date(s.session_date), { addSuffix: true})} • {formatBreakDuration(s.total_break || 0)} break
                                    </li>
                                ))}
                            </ul>
                        )}
                        
                    </div>
                ))}
                </ul>
            )}
            
            </div>
            )}
           
        </div>
    )
}