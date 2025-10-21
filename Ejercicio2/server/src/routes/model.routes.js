import { Router } from 'express';
import fs from 'fs/promises';
import path from 'path';

export function modelRoutes(dataDir) {
  const router = Router();

  const readJson = async (file) => {
    const full = path.resolve(dataDir, file);
    const raw = await fs.readFile(full, 'utf-8');
    return JSON.parse(raw);
  };

  router.get('/kpas', async (_req, res, next) => {
    try {
      const kpas = await readJson('kpas.json');
      res.json(kpas);
    } catch (err) { next(err); }
  });

  router.get('/questions', async (req, res, next) => {
    try {
      const { kpa } = req.query;
      const all = await readJson('questions.json');
      const out = kpa ? all.filter(q => q.kpa === kpa) : all;
      res.json(out);
    } catch (err) { next(err); }
  });

  // (Opcional) Ver reglas
  router.get('/rules', async (_req, res, next) => {
    try {
      const rules = await readJson('rules.json');
      res.json(rules);
    } catch (err) { next(err); }
  });

  // Manejo de errores simple
  router.use((err, _req, res, _next) => {
    console.error('[model.routes] Error:', err);
    res.status(500).json({ error: 'Error leyendo catálogos JSON', detail: String(err?.message || err) });
  });

  return router;
}