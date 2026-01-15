import mysql from 'mysql2'
import dotenv from 'dotenv' 
dotenv.config()

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    port: Number(process.env.MYSQL_PORT || 3306)
}).promise()

export async function getUsers() {
    const [rows] = await pool.query("SELECT * FROM users")
    return rows
}

export async function getUser(username) {
    const [rows] = await pool.query(`
        SELECT * FROM users
        WHERE username = ?
        `, [username])
    return rows[0]
}

export async function createUser(username, password) {
    const [result] = await pool.query(`
        INSERT INTO users (username, password)
        VALUES (?, ?)
        `, [username, password])
    return result
}

export async function getProjectsByUserId(userId) {
    const [rows] = await pool.query(`
      SELECT HEX(projectid) as projectId, name FROM projects
      WHERE user_id = ?
    `, [userId])
    return rows
}

export async function createProjectByUserId(userId, name) {
    const [rows] = await pool.query(`
        INSERT INTO projects (name, user_id)
        VALUES (?, ?)
        `, [name, userId])
    return rows
}

export async function deleteProjectById(userId, projectId) {
    const [rows] = await pool.query(`
        DELETE FROM projects
        WHERE
            user_id = ? AND
            projectid = UNHEX(?)          
        `, [userId, projectId])
    return rows
}

export async function getSessionDataById(projectId) {
    const [rows] = await pool.query(`
        SELECT 
            HEX(sessionid) AS sessionId,
            duration_seconds,
            total_break,
            started_at,
            ended_at,
            COALESCE(ended_at, started_at) AS session_date
        FROM sessions 
        WHERE
            project_id = UNHEX(?)
        ORDER BY session_date DESC;   
        `, [projectId])
    return rows
}

export async function createSession(projectId, durationSeconds, totalBreak = 0) {
    const [result] = await pool.query(`
        INSERT INTO sessions (project_id, duration_seconds, total_break, started_at, ended_at)
        VALUES (UNHEX(?), ?, ?, NOW(), NOW())
        `, [projectId, durationSeconds, totalBreak])
    return result
}