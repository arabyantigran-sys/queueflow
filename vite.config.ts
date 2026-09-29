import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // լսում է 0.0.0.0 — հասանելի է ցանցում
    port: 5173,
  },
})
