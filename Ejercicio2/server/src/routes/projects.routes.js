// server/src/routes/projects.routes.js
import { Router } from 'express';

export function projectsRoutes(db) {
  const router = Router();

  // Crear proyecto
  router.post('/', async (req, res, next) => {
    try {
      const { name } = req.body || {};
      if (!name || !name.trim()) {
        return res.status(400).json({ error: 'El nombre del proyecto es requerido' });
      }
      const existing = await db.get(`SELECT id FROM projects WHERE name = ?`, name.trim());
      if (existing) {
        return res.status(409).json({ error: 'Ya existe un proyecto con ese nombre', id: existing.id });
      }
      const r = await db.run(`INSERT INTO projects (name) VALUES (?)`, name.trim());
      const row = await db.get(`SELECT * FROM projects WHERE id = ?`, r.lastID);
      res.status(201).json(row);
    } catch (err) { next(err); }
  });

  // Listar proyectos (con conteo de evaluaciones)
  router.get('/', async (_req, res, next) => {
    try {
      const rows = await db.all(`
        SELECT p.*,
               (SELECT COUNT(*) FROM assessments a WHERE a.project_id = p.id) AS assessments_count
        FROM projects p
        ORDER BY p.created_at DESC, p.id DESC
      `);
      res.json(rows);
    } catch (err) { next(err); }
  });

  // Obtener un proyecto
  router.get('/:id', async (req, res, next) => {
    try {
      const { id } = req.params;
      const row = await db.get(`SELECT * FROM projects WHERE id = ?`, id);
      if (!row) return res.status(404).json({ error: 'Proyecto no encontrado' });
      const count = await db.get(`SELECT COUNT(*) AS cnt FROM assessments WHERE project_id = ?`, id);
      res.json({ ...row, assessments_count: count?.cnt ?? 0 });
    } catch (err) { next(err); }
  });

  // Actualizar proyecto
  router.patch('/:id', async (req, res, next) => {
    try {
      const { id } = req.params;
      const { name } = req.body || {};
      if (!name || !name.trim()) {
        return res.status(400).json({ error: 'El nombre del proyecto es requerido' });
      }
      const exists = await db.get(`SELECT id FROM projects WHERE id = ?`, id);
      if (!exists) return res.status(404).json({ error: 'Proyecto no encontrado' });
      const dup = await db.get(`SELECT id FROM projects WHERE name = ? AND id != ?`, name.trim(), id);
      if (dup) return res.status(409).json({ error: 'Ya existe otro proyecto con ese nombre', id: dup.id });

      await db.run(`UPDATE projects SET name = ? WHERE id = ?`, name.trim(), id);
      const row = await db.get(`SELECT * FROM projects WHERE id = ?`, id);
      res.json(row);
    } catch (err) { next(err); }
  });

  // Eliminar proyecto (desasocia evaluaciones)
  router.delete('/:id', async (req, res, next) => {
    try {
      const { id } = req.params;
      const row = await db.get(`SELECT * FROM projects WHERE id = ?`, id);
      if (!row) return res.status(404).json({ error: 'Proyecto no encontrado' });

      await db.run(`UPDATE assessments SET project_id = NULL WHERE project_id = ?`, id);
      await db.run(`DELETE FROM projects WHERE id = ?`, id);
      res.json({ message: 'Proyecto eliminado. Las evaluaciones quedaron desasociadas.' });
    } catch (err) { next(err); }
  });

  // Listar evaluaciones del proyecto
  router.get('/:id/assessments', async (req, res, next) => {
    try {
      const { id } = req.params;
      const project = await db.get(`SELECT * FROM projects WHERE id = ?`, id);
      if (!project) return res.status(404).json({ error: 'Proyecto no encontrado' });

      const list = await db.all(`
        SELECT id, project_id, project_name, created_at, status, overall_json
        FROM assessments
        WHERE project_id = ?
        ORDER BY created_at DESC, id DESC
      `, id);

      const parsed = list.map(r => ({
        ...r,
        overall: (() => { try { return JSON.parse(r.overall_json || '{}'); } catch { return {}; } })()
      }));

      res.json({ project, assessments: parsed });
    } catch (err) { next(err); }
  });

  // Crear evaluación bajo un proyecto
  router.post('/:id/assessments', async (req, res, next) => {
    try {
      const { id } = req.params;
      const project = await db.get(`SELECT * FROM projects WHERE id = ?`, id);
      if (!project) return res.status(404).json({ error: 'Proyecto no encontrado' });

      const r = await db.run(
        `INSERT INTO assessments (project_id, project_name, answers_json, kpa_scores_json, recommendations_json, overall_json, status)
         VALUES (?, ?, '{}', '{}', '{}', '{}', 'draft')`,
        project.id,
        project.name
      );
      const row = await db.get(`SELECT * FROM assessments WHERE id = ?`, r.lastID);
      res.status(201).json(row);
    } catch (err) { next(err); }
  });

  // Manejo de errores
  router.use((err, _req, res, _next) => {
    console.error('[projects.routes] Error:', err);
    res.status(500).json({ error: 'Error en operaciones de proyectos', detail: String(err?.message || err) });
  });

  return router;
}