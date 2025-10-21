// server/src/index.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import { initDb } from './db.js';
import { modelRoutes } from './routes/model.routes.js';
import { assessmentsRoutes } from './routes/assessments.routes.js';
import { projectsRoutes } from './routes/projects.routes.js';

dotenv.config();

/** ──────────────────────────────────────────────────────────────
 *  Resolución de rutas independiente del CWD
 *  __dirname -> .../server/src
 *  SERVER_ROOT -> .../server
 *  PROJECT_ROOT -> raíz del repo
 *  ───────────────────────────────────────────────────────────── */
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SERVER_ROOT = path.resolve(__dirname, '..');
const PROJECT_ROOT = path.resolve(SERVER_ROOT, '..');

// Helper para resolver rutas relativas a una base conocida
const resolveFrom = (base, p, fallback) => {
  if (!p) return fallback;
  return path.isAbsolute(p) ? p : path.resolve(base, p);
};

/** ──────────────────────────────────────────────────────────────
 *  Configuración
 *  ───────────────────────────────────────────────────────────── */
const PORT = parseInt(process.env.PORT || '4000', 10);

// Si DB_PATH no viene, usa server/cmmi.db; si viene relativo, se toma respecto a SERVER_ROOT
const DB_PATH = resolveFrom(
  SERVER_ROOT,
  process.env.DB_PATH,
  path.join(SERVER_ROOT, 'cmmi.db')
);

// Si DATA_DIR no viene, usa <root>/data/cmmi_v1.3; si viene relativo, se toma respecto a PROJECT_ROOT
const DATA_DIR = resolveFrom(
  PROJECT_ROOT,
  process.env.DATA_DIR,
  path.join(PROJECT_ROOT, 'data', 'cmmi_v1.3')
);

// Crea la carpeta destino de la BD si no existe
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

// CORS
const CORS_ORIGIN = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map(s => s.trim());

const THRESHOLD_KPA = parseFloat(process.env.THRESHOLD_KPA || process.env.LEVEL2_THRESHOLD || '0.8');
const THRESHOLD_GLOBAL = parseFloat(process.env.THRESHOLD_GLOBAL || '0.8');

/** ──────────────────────────────────────────────────────────────
 *  App & Middlewares
 *  ───────────────────────────────────────────────────────────── */
const app = express();
app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(express.json());

/** ──────────────────────────────────────────────────────────────
 *  Base de datos
 *  ───────────────────────────────────────────────────────────── */
const db = await initDb(DB_PATH);

/** ──────────────────────────────────────────────────────────────
 *  Rutas
 *  ───────────────────────────────────────────────────────────── */
app.use('/api/model', modelRoutes(DATA_DIR));
app.use('/api/projects', projectsRoutes(db));
app.use('/api/assessments', assessmentsRoutes(db, DATA_DIR, {
  kpa: THRESHOLD_KPA,
  global: THRESHOLD_GLOBAL
}));

app.get('/health', (_req, res) => res.json({ ok: true }));

/** ──────────────────────────────────────────────────────────────
 *  Arranque
 *  ───────────────────────────────────────────────────────────── */
app.listen(PORT, () => {
  console.log(`✅ API escuchando en http://localhost:${PORT}`);
  console.log(`DB_PATH   → ${DB_PATH}`);
  console.log(`DATA_DIR  → ${DATA_DIR}`);
  console.log(`CORS_ORIGIN → ${CORS_ORIGIN.join(', ')}`);
  console.log(`THRESHOLDS  → KPA=${THRESHOLD_KPA}, GLOBAL=${THRESHOLD_GLOBAL}`);
});