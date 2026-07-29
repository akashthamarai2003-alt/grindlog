import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          motion: ['motion/react'],
          gsap: ['gsap', 'gsap/ScrollTrigger'],
          lenis: ['@studio-freight/lenis'],
          icons: ['lucide-react'],
        },
      },
    },
  },
})
