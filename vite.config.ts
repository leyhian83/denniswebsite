import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { projectWritePlugin } from './vite-plugin-project-write.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), projectWritePlugin()],
})
