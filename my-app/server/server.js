import express from 'express'
import cors from 'cors'
import session from "express-session"
import MySQLStoreFactory from "express-mysql-session"

import { getUsers, getUser, createUser, getProjectsByUserId, createProjectByUserId, deleteProjectById, getSessionDataById, createSession } from './demo_db_connection.js'


const app = express()
app.use(express.json())

const isProd = process.env.NODE_ENV === "production"

const allowedOrigins = (process.env.CORS_ORIGIN || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)

const isAllowedOrigin = (origin) => {
    if (!origin) return true
    if (allowedOrigins.includes(origin)) return true
    // Allow Vercel preview/prod domains for the frontend project.
    return /^https:\/\/pomodoro-fronte.*\.vercel\.app$/.test(origin)
}

const corsOptions = {
    origin: isProd
        ? (origin, callback) => {
            if (isAllowedOrigin(origin)) {
                return callback(null, true)
            }
            return callback(new Error("Not allowed by CORS"))
        }
        : ["http://localhost:5173"],
    credentials: true
}
app.use(cors(corsOptions))
const PORT = 5000



function toBuffer16(value) {
  if (Buffer.isBuffer(value)) return value;

  // If it was JSON-serialized Buffer
  if (value && value.type === "Buffer" && Array.isArray(value.data)) {
    return Buffer.from(value.data);
  }

  throw new Error("Invalid userId in session");
}



app.set("trust proxy", 1)

const MySQLStore = MySQLStoreFactory(session)
const sessionStore = new MySQLStore({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    port: Number(process.env.MYSQL_PORT || 3306),
    clearExpired: true,
    createDatabaseTable: true,
    tableName: "user_sessions"
})

app.use(session({
    secret: process.env.SESSION_SECRET || "dev_secret",
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
        httpOnly: true,
        sameSite: isProd ? "none" : "lax",
        secure: isProd
    }
}))

app.get("/auth/me", (req, res) => {
  if (!req.session?.userId) {
    return res.status(401).json({ error: "Not logged in" });
  }
  res.json({ ok: true });
});


app.get("/users", async (req, res) => {
    
    const username = req.query.username
    const result = await getUser(username)
    console.log(result)
    res.json(result)
})


app.post("/auth/login", async (req, res) => {
    const {username, password} = req.body

    const user = await getUser(username)
    // need password authentication handling here

    req.session.userId = user.id // stores the UUID string
    res.json({ id: user.id, username: user.username})
})

app.post("/auth/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: "Logout failed" })
        }
        res.clearCookie('connect.sid');
        res.status(200).json({ success: "logout success" })
    })
})

app.post("/auth/register", async (req, res) => {
    try {
        const { username, password } = req.body

        const result = await createUser(username, password)
        return res.status(201).json(result)
            
        

    } catch (err) {
        console.error(err)
        if (err.code === "ER_DUP_ENTRY" || err.errno === 1062) {
            return res.status(409).json({error: "username already exists"})
        }
        console.error(err)
        return res.status(500).json({error: "Server error"})
    }
})


// GET a project
app.get("/projects", async (req, res) => {

    if (!req.session.userId) {
        return res.status(401).json({error: "Not logged in"})
    }

    const userId = req.session.userId
    const userIdBin = toBuffer16(userId)
    const projects = await getProjectsByUserId(userIdBin)
    res.json(projects) // sends projects in JSON for frontend to iterate through and display
})

// Create a project
app.post("/projects", async (req, res) => {

    if (!req.session.userId) {
        return res.status(401).json({error: "Not logged in"})
    }
    // userId comes from them being already logged in (session data)
    const userId = req.session.userId
    const userIdBin = toBuffer16(userId)
    // get project name from req body
    const {name} = req.body

    const projects = await createProjectByUserId(userIdBin, name)

    res.json(projects)
})

// DELETE a project
app.delete("/projects", async (req, res) => {
  try {
    if (!req.session.userId) {
        return res.status(401).json({error:"Not logged in"})
    }

    // logic
    
    const userIdBin = toBuffer16(req.session.userId)
    const {projectId} = req.body

    const result = await deleteProjectById(userIdBin, projectId)
    if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Project was not found" })
    }
    res.status(200).json({ ok: true})

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/projects/:projectId/sessions", async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({error:"Not logged in"})
        }

        const { projectId } = req.params
        const resultingSessions = await getSessionDataById(projectId)
        
        res.status(200).json(resultingSessions)
    } catch (err) {
        console.error(err)
        res.status(500).json({error: "Server error"})
    }
})

app.post("/projects/:projectId/sessions", async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({error:"Not logged in"})
        }

        const { projectId } = req.params
        const { durationSeconds, totalBreak } = req.body
        
        if (!durationSeconds) {
            return res.status(400).json({error: "durationSeconds is required"})
        }

        const result = await createSession(projectId, durationSeconds, totalBreak || 0)
        res.status(201).json({ ok: true, sessionId: result.insertId })
    } catch (err) {
        console.error(err)
        res.status(500).json({error: "Server error"})
    }
})

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`)
})





