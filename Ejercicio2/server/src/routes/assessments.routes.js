import { Router } from 'express';
import { loadQuestions, computeScores, buildConclusion } from '../services/scoring.js';
import { loadRules, generateRecommendations } from '../services/recommendations.js';

export function assessmentsRoutes(db, dataDir, thresholds) {
  const router = Router();

  // Carga en memoria (a demanda podrías recargar si cambian los JSON)
  let QUESTIONS = null;
  let RULES = null;

  async function ensureLoaded() {
    if (!QUESTIONS) QUESTIONS = await loadQuestions(dataDir);
    if (!RULES) RULES = await loadRules(dataDir);
  }

  // Listar todas las evaluaciones
  router.get('/', async (_req, res, next) => {
    try {
      const rows = await db.all(`
        SELECT id, project_name, created_at, status, overall_json, 
               kpa_scores_json, recommendations_json, answers_json
        FROM assessments 
        ORDER BY created_at DESC
      `);
      res.json(rows);
    } catch (err) { next(err); }
  });

  // Crear evaluación
  router.post('/', async (req, res, next) => {
    try {
      const { projectName = 'Proyecto sin nombre' } = req.body || {};
      const r = await db.run(
        `INSERT INTO assessments (project_name, answers_json, kpa_scores_json, recommendations_json, overall_json, status)
         VALUES (?, '{}', '{}', '{}', '{}', 'draft')`,
        projectName
      );
      const row = await db.get(`SELECT * FROM assessments WHERE id = ?`, r.lastID);
      res.status(201).json(row);
    } catch (err) { next(err); }
  });

  // Obtener evaluación
  router.get('/:id', async (req, res, next) => {
    try {
      const { id } = req.params;
      const row = await db.get(`SELECT * FROM assessments WHERE id = ?`, id);
      if (!row) return res.status(404).json({ error: 'assessment no encontrado' });
      res.json(row);
    } catch (err) { next(err); }
  });

  // Guardar respuestas (merge incremental)
  router.post('/:id/answers', async (req, res, next) => {
    try {
      const { id } = req.params;
      const { answers } = req.body || {};
      
      // Validación más estricta de las respuestas
      if (!answers || typeof answers !== 'object' || Array.isArray(answers)) {
        return res.status(400).json({ 
          error: 'Formato de respuestas inválido',
          detail: 'Se requiere un objeto con formato { [questionId]: "si|parcial|no" }'
        });
      }

      // Validar valores permitidos
      const invalidAnswers = Object.entries(answers)
        .filter(([, value]) => !['si', 'parcial', 'no'].includes(String(value).toLowerCase()));
      
      if (invalidAnswers.length > 0) {
        return res.status(400).json({
          error: 'Valores de respuesta inválidos',
          detail: 'Los valores permitidos son: si, parcial, no',
          invalid: invalidAnswers
        });
      }

      const row = await db.get(`SELECT * FROM assessments WHERE id = ?`, id);
      if (!row) return res.status(404).json({ error: 'Assessment no encontrado' });

      let current = {};
      try {
        current = JSON.parse(row.answers_json || '{}');
      } catch (e) {
        console.error('Error parsing existing answers:', e);
      }

      const merged = { ...current, ...answers };
      
      await db.run(
        `UPDATE assessments SET answers_json = ?, status = ? WHERE id = ?`,
        JSON.stringify(merged), 'draft', id
      );

      res.json({ 
        message: 'Respuestas guardadas correctamente',
        answersCount: Object.keys(merged).length,
        answers: merged 
      });
    } catch (err) { next(err); }
  });

  // Diagnóstico: % por KPA, recomendaciones, verificación nivel 2, conclusión
  router.post('/:id/diagnose', async (req, res, next) => {
    try {
      await ensureLoaded();
      const { id } = req.params;
      const row = await db.get(`SELECT * FROM assessments WHERE id = ?`, id);
      if (!row) return res.status(404).json({ error: 'assessment no encontrado' });

      const answers = JSON.parse(row.answers_json || '{}');

      const { kpaScores, overallPercent, level2Verified } = computeScores(answers, QUESTIONS, thresholds);
      const recommendations = generateRecommendations(answers, QUESTIONS, RULES);

      const conclusion = buildConclusion({ kpaScores, overallPercent, level2Verified });

      const overall = { overallPercent, level2Verified, conclusion };

      await db.run(
        `UPDATE assessments SET kpa_scores_json = ?, recommendations_json = ?, overall_json = ?, status = ?
         WHERE id = ?`,
        JSON.stringify(kpaScores),
        JSON.stringify(recommendations),
        JSON.stringify(overall),
        'diagnosed',
        id
      );

      // Informe estructurado (1–9)
      const perKpa = Object.entries(kpaScores).map(([kpa, v]) => ({
        kpa,
        percent: v.percent,
        recommendations: recommendations[kpa] || []
      }));

      const missingKPAs = Object.entries(kpaScores)
        .filter(([, v]) => v.percent / 100 < (thresholds?.kpa ?? 0.8))
        .map(([k]) => k);

      const reachLevel2Hints = missingKPAs.map(kpa => ({
        kpa,
        actions: recommendations[kpa] || ["Completar prácticas clave y evidencias faltantes."]
      }));

      res.json({
        id,
        kpaScores,
        recommendations,
        overall,
        report: {
          perKpa,                                   // (4) Informe final por KPA
          summaryAllKpas: kpaScores,                // (5) Resumen de todas las KPA
          generalDiagnosis: overallPercent,         // (6) Diagnóstico general
          level2Verification: level2Verified,       // (7) Verificación
          reachLevel2Hints,                          // (8) Cómo alcanzar Nivel 2
          conclusion                                 // (9) Conclusión
        }
      });
    } catch (err) { next(err); }
  });

  // Obtener informe (si ya se diagnosticó)
  router.get('/:id/report', async (req, res, next) => {
    try {
      await ensureLoaded();
      const { id } = req.params;
      
      const row = await db.get(`SELECT * FROM assessments WHERE id = ?`, id);
      if (!row) {
        return res.status(404).json({ error: 'Assessment no encontrado' });
      }

      // Si no se ha diagnosticado aún, ejecutar diagnóstico automáticamente
      if (row.status !== 'diagnosed') {
        const answers = JSON.parse(row.answers_json || '{}');
        if (Object.keys(answers).length === 0) {
          return res.status(400).json({ 
            error: 'Sin respuestas',
            detail: 'No hay respuestas para generar el informe. Complete la evaluación primero.'
          });
        }

        const { kpaScores, overallPercent, level2Verified, thresholds: calcThresholds } = 
          computeScores(answers, QUESTIONS, thresholds);
        
        const recommendations = generateRecommendations(answers, QUESTIONS, RULES);
        const conclusion = buildConclusion({ 
          kpaScores, 
          overallPercent, 
          level2Verified, 
          thresholds: calcThresholds 
        });

        const overall = { overallPercent, level2Verified, conclusion };

        // Actualizar en DB
        await db.run(
          `UPDATE assessments SET 
            kpa_scores_json = ?, 
            recommendations_json = ?, 
            overall_json = ?, 
            status = ?
           WHERE id = ?`,
          JSON.stringify(kpaScores),
          JSON.stringify(recommendations),
          JSON.stringify(overall),
          'diagnosed',
          id
        );

        row.kpa_scores_json = JSON.stringify(kpaScores);
        row.recommendations_json = JSON.stringify(recommendations);
        row.overall_json = JSON.stringify(overall);
        row.status = 'diagnosed';
      }

      let kpaScores = {};
      let recommendations = {};
      let overall = {};

      try {
        kpaScores = JSON.parse(row.kpa_scores_json || '{}');
        recommendations = JSON.parse(row.recommendations_json || '{}');
        overall = JSON.parse(row.overall_json || '{}');
      } catch (e) {
        console.error('Error parsing assessment data:', e);
        return res.status(500).json({ 
          error: 'Error al procesar los datos del informe',
          detail: 'Los datos guardados están corruptos o en formato incorrecto'
        });
      }

      const perKpa = Object.entries(kpaScores).map(([kpa, v]) => ({
        kpa,
        percent: v.percent,
        recommendations: recommendations[kpa] || []
      }));

      const thresholdKpa = thresholds?.kpa ?? 0.8;
      const missingKPAs = Object.entries(kpaScores)
        .filter(([, v]) => (v.percent / 100) < thresholdKpa)
        .map(([k]) => k);

      const reachLevel2Hints = missingKPAs.map(kpa => ({
        kpa,
        actions: recommendations[kpa] || ["Completar prácticas clave y evidencias faltantes."]
      }));

      res.json({
        id,
        status: row.status,
        kpaScores,
        recommendations,
        overall,
        report: {
          perKpa,
          summaryAllKpas: kpaScores,
          generalDiagnosis: overall.overallPercent ?? null,
          level2Verification: overall.level2Verified ?? false,
          reachLevel2Hints,
          conclusion: overall.conclusion || "Pendiente de diagnóstico"
        }
      });
    } catch (err) { next(err); }
  });

  // Manejo de errores
  router.use((err, _req, res, _next) => {
    console.error('[assessments.routes] Error:', err);
    res.status(500).json({ error: 'Error en evaluación/diagnóstico', detail: String(err?.message || err) });
  });

  return router;
}