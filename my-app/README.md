Pomodoro Timer with Projects
============================

Modern Pomodoro web app with project tracking, study/break flows, and session logging.

Features
--------
- Project list with collapsible sessions and “In progress” indicator.
- Study/break timer flow; background changes in break mode.
- Add +5 / +10 minutes while running (study or break).
- Real-time session creation per project (backend API).
- Responsive layout with fixed projects sidebar and centered timer UI.

Project Structure
-----------------
- `server/` – Express API + MySQL access.
- `src/` – React (Vite) frontend.

Prerequisites
-------------
- Node.js 18+
- MySQL
- npm

Backend Setup
-------------
1) Create `server/.env` (not committed):
```
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=your_user
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=your_db
SESSION_SECRET=your_session_secret
```
2) Install and start the API:
```
cd server
npm install
npm run dev   # or: npm start
```

Frontend Setup
--------------
```
cd my-app
npm install
npm run dev    # Vite dev server
```
The app expects the API at `http://localhost:5000` (default in code). Adjust `apiBase` in components if needed.

Login & Auth
------------
Sessions are handled by the backend (`express-session`). Ensure cookies are allowed in the browser when hitting the Vite dev server.

Key Flows
---------
- Select a project, set a study timer, and start. The session is marked “In progress” under that project.
- When the study timer ends, choose to take a break or finish the session. Break keeps the session open.
- Add time on the fly with the +5 / +10 buttons while running.
- Finish Session posts duration and break totals to the backend.

Notes
-----
- `server/.env` is ignored; keep secrets out of Git.
- If pushing to a different API URL, update `apiBase` (see `src/pages/Home.jsx` and related components).

Scripts Reference
-----------------
Backend:
- `npm run dev` – start API (nodemon)
- `npm start` – start API

Frontend:
- `npm run dev` – Vite dev server
- `npm run build` – production build
- `npm run preview` – preview build
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
