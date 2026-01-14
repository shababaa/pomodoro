import { useState, useEffect } from 'react';


export default function ProjectsBar(props) {
    return (

        <nav className='navbar'>
            <ul className='navbar-nav'>
                {props.children}
            </ul>
        </nav>

    //     <div className='projects-bar'>
    //         <button className='projects-button' onClick={handleClick}>
    //             Projects
    //         </button>
    //         {toggleProjects ? (typeof data.projects === 'undefined' ? (
    //         <p>Loading...</p>
    //         ) : (
    //         data.projects.map((project, i) => (
    //             <p key = {i}>{project}</p>
    //         ))
    //         )) : null}
    //   </div>
    )
}