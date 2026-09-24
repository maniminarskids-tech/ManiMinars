import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const distPath = path.resolve(__dirname, 'dist');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint for Cloud Run probes
app.get(['/api/health', '/_healthz', '/healthz'], (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve static assets from dist folder if it exists
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath, {
    maxAge: '1d',
    index: 'index.html',
  }));
}

// Fallback to index.html for client-side routing (SPA)
app.get('*', (_req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(200).send(`
      <!doctype html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <title>Mani Minars</title>
        </head>
        <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #FAF9F6;">
          <div style="text-align: center;">
            <h1>Mani Minars</h1>
            <p>Application is starting. Please build the frontend using <code>npm run build</code>.</p>
          </div>
        </body>
      </html>
    `);
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${PORT} (0.0.0.0:${PORT})`);
});
