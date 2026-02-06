import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Check for environment variables during build
  if (mode === 'production') {
    if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_ANON_KEY) {
      console.warn('\n--- WARNING: Missing Supabase environment variables! ---');
      console.warn('VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY should be set in Vercel settings.');
      console.warn('-------------------------------------------------------\n');
    }
  }

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 3000,
    }
  };
});
