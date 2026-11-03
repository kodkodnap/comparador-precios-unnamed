import express from 'express';
import { createServer as createViteServer } from 'vite';
import { apiRouter } from './server/index.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // API router
  app.use(express.json());
  app.use(apiRouter);

  // Vite development middleware
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });

  app.use(vite.middlewares);

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor AhorroPtoMontt activo en http://0.0.0.0:${PORT}`);
  });
}

startServer();
