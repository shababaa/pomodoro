import React, { useState } from "react"
import { useNavigate } from "react-router-dom"


export default function Register({ apiBase }) {

    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const navigate = useNavigate();


    async function handleSubmit(e) {
        e.preventDefault()
        setError("")

        try {
            const res = await fetch(`${apiBase}/auth/register`, {
                method: "POST",
                headers: {"Content-Type":"application/json"},
                credentials: "include",
                body: JSON.stringify({username, password})
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || "Register failed")
                return
            }

            console.log("Registered successfully:", data)
        } catch (err) {
            console.error(err)
            setError("Network Error")
        }
    }

    // <form action = "submit-time" onSubmit={handleSubmit}>
    //             <label className = "custom-field">
    //               <input 
    //                 type = "text"
    //                 required
    //                 id = "time"
    //                 name = "time"
    //                 onChange={handleChange}
    //               />
    //               <span className = "placeholder">Enter time</span>
    //             </label>
    //             <button type="submit">Start!</button>
    //           </form>
    return (
        <div>
            <h1>Register</h1>
            <form onSubmit={handleSubmit}>
                <label className="custom-field" style={{ display: "block", marginBottom: 8 }}>
                    <input 
                        style={{ width: "100%", padding: 8, marginTop: 4 }}
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        name="time"
                    />
                    <span className = "placeholder">Username</span>
                </label>
                <label className="custom-field">
                    <input 
                    type="password"
                    style={{ width: "100%", padding: 8, marginTop: 4 }}
                    value = {password}
                    onChange={(e) => setPassword(e.target.value)}
                    />
                    <span className = "placeholder">Password</span>
                </label>
                {error && (
                    <p style={{ color: "red", marginTop: 8 }}>
                        {error}
                    </p>
                )}
                <button type = "submit" style={{ marginTop: 12, padding: "8px 16px" }}>
                    Register
                </button>
            </form>

            <button type = "button" onClick={() => navigate("/login")} style={{ marginTop: 12, padding: "8px 16px" }}>
                Login
            </button>
        </div>
    )
}