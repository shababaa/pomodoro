import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // proxy /projects -> http://localhost:5000/projects
      '/projects': {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false
      },
      // add other endpoints if needed (target: "http://localhost:5000", changeOrigin: tru)
    }
  }
})
