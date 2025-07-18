import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@components' : '/src/components',
      '@messages' : '/src/messages',
      '@services' : '/src/services',
      '@store' : '/src/store',
      '@' : '/src',
    },
},
})
