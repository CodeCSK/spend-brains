import path from 'node:path'
import { fileURLToPath } from 'node:url'

import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const webRoot = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(webRoot, '../..')

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    // npm workspaces hoist deps to the repo root — ensure Vite can find them
    modules: [
      path.join(repoRoot, 'node_modules'),
      path.join(webRoot, 'node_modules'),
      'node_modules',
    ],
  },
  server: {
    port: 5173,
    fs: {
      allow: [repoRoot, webRoot],
    },
  },
})
