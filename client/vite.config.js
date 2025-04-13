import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '^/login': {
        target: 'http://127.0.0.1:5030',
        changeOrigin: true,
        rewrite: (path) => `/api${path}`, // /login -> /api/login
      },
      '^/users': {
        target: 'http://127.0.0.1:5030',
        changeOrigin: true,
        rewrite: (path) => `/api${path}`, // /users -> /api/users
      },
      '^/refresh': {
        target: 'http://127.0.0.1:5030',
        changeOrigin: true,
        rewrite: (path) => `/api${path}`, // /refresh -> /api/refresh
      },
    },
  },
})
