import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react({
  })],
  build: {
    target: 'esnext',
    minify: 'terser', // Minification plus agressive
    cssMinify: true,
    sourcemap: false, // Désactive les sourcemaps en prod
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            // Crée des chunks séparés pour les grosses dépendances
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            if (id.includes('framer-motion')) {
              return 'vendor-framer';
            }
            return 'vendor'; // Toutes les autres dépendances
          }
        },
      },
    },
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      // Ajoute d'autres dépendances fréquemment utilisées
    ],
    exclude: ['lucide-react'],
  },
});