import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import apiRoutes from './backend/routes/apiRoutes';
import { AuthModel } from './database/models/authModel';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Provision/update the single administrator account from secure environment
  // variables. No public admin or authority signup endpoint exists.
  try {
    await AuthModel.ensureAdminFromEnv();
  } catch (error: any) {
    console.error('[Auth] Admin initialization failed:', error?.message || error);
  }

  app.use('/api', apiRoutes);

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[RoadGuard AI] Fullstack server running on http://0.0.0.0:${PORT}`);
    console.log('[RoadGuard AI] MongoDB, authenticated role access, and authority email dispatch active.');
  });
}

startServer();
