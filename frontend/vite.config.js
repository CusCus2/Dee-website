import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';

export default defineConfig({
  plugins: [tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        home: resolve(__dirname, 'index.html'),
        account: resolve(__dirname, 'account.html'),
        reviews: resolve(__dirname, 'reviews.html'),
        english: resolve(__dirname, 'english.html'),
        spanish: resolve(__dirname, 'spanish.html'),
        french: resolve(__dirname, 'french.html'),
        ielts: resolve(__dirname, 'ielts.html'),
      }
    }
  }
});
