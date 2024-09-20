import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export const PUBLISHER = "template.os";
export const PUBLISHER_DASH = PUBLISHER.replace(".","-");
export const APP_SLUG = "%APPSLUG%";
export const PACKAGE_SUBDOMAIN = `${APP_SLUG}-${PUBLISHER_DASH}`;
export const PROCESS_NAME = `${APP_SLUG}:${APP_SLUG}:${PUBLISHER}`;
export const BASE_URL = `/${PROCESS_NAME}`;

// This is the proxy URL, it must match the node you are developing against
const PROXY_URL = (process.env.VITE_NODE_URL || `http://${PACKAGE_SUBDOMAIN}.localhost:8080`)
console.log('process.env.VITE_NODE_URL', process.env.VITE_NODE_URL, PROXY_URL);

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'redirect-localhost',
      transformIndexHtml(html) {
        return html.replace(
          /<head>/,
          `<head>
            <script>
              if (window.location.hostname === 'localhost') {
                window.location.hostname = '${PACKAGE_SUBDOMAIN}.localhost';
              }
            </script>`
        );
      },
    },
  ],
  base: BASE_URL,
  build: {
    manifest: true,
    rollupOptions: {
      // external: ['/our.js', 'react-router-dom']
      external: ['/our.js']
    }
  },
  server: {
    open: true,
    hmr: {
      host: `${PACKAGE_SUBDOMAIN}.localhost`, // Explicit HMR host
      port: 3000, // Ensure the port is correctly specified for WebSocket connections
    },
    proxy: {
      '/our': {
        target: PROXY_URL,
        changeOrigin: true,
      },
      [`${BASE_URL}/our.js`]: {
        target: PROXY_URL,
        changeOrigin: true,
        rewrite: (path) => path.replace(BASE_URL, ''),
      },
      // This route will match all other HTTP requests to the backend
      // [`^${BASE_URL}/(?!(@vite/client|src/.*|node_modules/.*|@react-refresh|.*\.ts$))`]: {
      //   target: PROXY_URL,
      //   changeOrigin: true,
      // },
      // '/example': {
      //   target: PROXY_URL,
      //   changeOrigin: true,
      //   rewrite: (path) => path.replace(BASE_URL, ''),
      // // This is only for debugging purposes
      //   configure: (proxy, _options) => {
      //     proxy.on('error', (err, _req, _res) => {
      //       console.log('proxy error', err);
      //     });
      //     proxy.on('proxyReq', (proxyReq, req, _res) => {
      //       console.log('Sending Request to the Target:', req.method, req.url);
      //     });
      //     proxy.on('proxyRes', (proxyRes, req, _res) => {
      //       console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
      //     });
      //   },
      // },
    }
  },
  // optimizeDeps: {
  //   exclude: ['react', 'react-dom', 'react/jsx-dev-runtime'],
  // },
});
