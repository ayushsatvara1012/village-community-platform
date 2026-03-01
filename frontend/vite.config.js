import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // Raise warning threshold slightly (we have legit large vendor libs)
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // Function form is robust — works for firebase/* sub-package imports
        // and any other package that has no top-level export.
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('/firebase/')) return 'vendor-firebase';
            if (id.includes('/recharts/')) return 'vendor-charts';
            if (id.includes('/framer-motion/')) return 'vendor-motion';
            if (id.includes('/i18next') || id.includes('/react-i18next')) return 'vendor-i18n';
            if (id.includes('/lucide-react/') || id.includes('/clsx/') || id.includes('/tailwind-merge/')) return 'vendor-ui';
            if (id.includes('/react-dom/') || id.includes('/react-router') || id.includes('/react/')) return 'vendor-react';
          }
        },
      },
    },
  },
})
