import React, { useState } from "react"
import { useNavigate } from "react-router-dom"



export default function Login({ apiBase }) {

    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault()
        setError("")
        // TODO: setUsername((username) => username.trim())
        try {
            const res = await fetch(`${apiBase}/auth/login`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            credentials: "include",
            body: JSON.stringify({username, password})
        })
        
        const data = await res.json()
        
        if (!res.ok) {
            setError(data.error || "Login failed")
            return
        }

        console.log("Logged in:", data)
        navigate("/home")
        } catch (err) {
            console.error(err)
            setError("Network error")
        }
        
    }



    return (
        
        <div style={{ maxWidth: 400, margin: "40px auto", fontFamily: "sans-serif" }}>

            <h1>Login</h1>
            <form onSubmit={handleSubmit}>
                <label className="custom-field" style={{ display: "block", marginBottom: 8 }}>
                    
                    <input 
                        style={{ width: "100%", padding: 8, marginTop: 4 }}
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <span className="placeholder">Username</span>
                </label>
            
                <label className="custom-field">
                    <input 
                        type="password"
                        style={{ width: "100%", padding: 8, marginTop: 4 }}
                        value = {password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <span className="placeholder">Password</span>
                </label>
            {error && (
                <p style={{ color: "red", marginTop: 8 }}>
                    {error}
                </p>
            )}
            
            <button type="submit" style={{ marginTop: 12, padding: "8px 16px" }}>
                Log In
            </button>
            </form>

            <button 
                type="button"
                onClick={() => navigate("/register")}
                style={{ marginTop: 12, padding: "8px 16px" }}
            >
                Register
            </button>
        </div>
    )
    
}