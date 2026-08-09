import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // Served from https://smartaleex.github.io/noted-it/ on GitHub Pages.
  base: process.env.GITHUB_ACTIONS ? '/noted-it/' : '/',
  plugins: [react()],
})
