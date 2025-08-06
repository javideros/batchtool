import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { fileURLToPath, URL } from 'node:url'

/**
 * Vite configuration for React + TypeScript + Tailwind CSS project
 * 
 * Plugins:
 * - react(): Enables React support with Fast Refresh
 * - tailwindcss(): Integrates Tailwind CSS processing
 * 
 * Path alias:
 * - '@' maps to './src' directory for cleaner imports
 * 
 * @see https://vite.dev/config/
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
