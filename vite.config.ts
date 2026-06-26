import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'websdr-live-proxy',
      configureServer(server) {
        server.middlewares.use('/api/websdr-live', async (_request, response) => {
          try {
            const upstream = await fetch('http://websdr.ewi.utwente.nl/~~websdrlistk?v=1&fmt=2&chseq=0', {
              headers: {
                'user-agent': 'Mozilla/5.0',
              },
            });

            if (!upstream.ok) {
              response.statusCode = upstream.status;
              response.end(`Upstream WebSDR request failed with status ${upstream.status}`);
              return;
            }

            const body = await upstream.text();
            response.setHeader('content-type', 'application/json; charset=utf-8');
            response.end(body.slice(body.indexOf('[')));
          } catch (error) {
            response.statusCode = 502;
            response.setHeader('content-type', 'application/json; charset=utf-8');
            response.end(JSON.stringify({ error: error instanceof Error ? error.message : 'Proxy failure' }));
          }
        });
      },
    },
  ],
});