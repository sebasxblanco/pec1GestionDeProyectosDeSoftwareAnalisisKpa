import fs from 'fs/promises';
import path from 'path';

const ANSWER_TO_SCORE = { si: 1.0, parcial: 0.5, no: 0.0 };

/** Carga questions.json desde DATA_DIR */
export async function loadQuestions(dataDir) {
  const full = path.resolve(dataDir, 'questions.json');
  const raw = await fs.readFile(full, 'utf-8');
  return JSON.parse(raw);
}

/**
 * Calcula:
 * - % por KPA (percent)
 * - detalle por SP (percent)
 * - % global (promedio ponderado)
 * - verificación de Nivel 2 (todas las KPA ≥ threshold.kpa y opcionalmente global ≥ threshold.global)
 */
export function computeScores(answersByQId, questions, thresholds) {
  if (!questions || !Array.isArray(questions)) {
    throw new Error('Questions must be a valid array');
  }

  const byKpa = {}; // KPA → { sum, den, bySp: { SP → { sum, den } } }
  
  // Asegurarse que answersByQId es un objeto
  const answers = answersByQId || {};

  for (const q of questions) {
    if (!q || !q.id || !q.kpa) continue; // Skip invalid questions
    
    const ans = String(answers[q.id] || '').trim().toLowerCase();
    const score = ANSWER_TO_SCORE[ans] ?? 0;
    const w = Math.max(0, Number(q.weight ?? 1));
    const kpa = q.kpa;
    const sp = q.sp || 'SP';

    if (!byKpa[kpa]) byKpa[kpa] = { sum: 0, den: 0, bySp: {} };
    if (!byKpa[kpa].bySp[sp]) byKpa[kpa].bySp[sp] = { sum: 0, den: 0 };

    byKpa[kpa].sum += score * w;
    byKpa[kpa].den += w;

    byKpa[kpa].bySp[sp].sum += score * w;
    byKpa[kpa].bySp[sp].den += w;
  }

  const kpaScores = {};
  let globalSum = 0, globalDen = 0;

  for (const kpa of Object.keys(byKpa)) {
    const { sum, den, bySp } = byKpa[kpa];
    const ratio = den > 0 ? (sum / den) : 0;
    const percent = Math.round(ratio * 100);

    const detail = {};
    for (const sp of Object.keys(bySp)) {
      const r = bySp[sp];
      const spRatio = r.den > 0 ? (r.sum / r.den) : 0;
      detail[sp] = { percent: Math.round(spRatio * 100) };
    }

    kpaScores[kpa] = {
      percent,
      detail,
      passed: ratio >= (thresholds?.kpa ?? 0.8)
    };

    globalSum += sum;
    globalDen += den;
  }

  const globalRatio = globalDen > 0 ? (globalSum / globalDen) : 0;
  const overallPercent = Math.round(globalRatio * 100);
  
  // Verificar que todas las KPAs estén por encima del umbral mínimo y el porcentaje global sea suficiente
  const thresholdKpa = thresholds?.kpa ?? 0.8;
  const thresholdGlobal = thresholds?.global ?? 0.7;
  
  const allKpasPassed = Object.values(kpaScores).every(kpa => (kpa.percent / 100) >= thresholdKpa);
  const globalPassed = globalRatio >= thresholdGlobal;
  
  const level2Verified = allKpasPassed && globalPassed;

  return {
    kpaScores,
    overallPercent,
    level2Verified,
    thresholds: {
      kpa: Math.round(thresholdKpa * 100),
      global: Math.round(thresholdGlobal * 100)
    }
  };
}

/** Genera texto de conclusión en base al resultado */
export function buildConclusion({ kpaScores, overallPercent, level2Verified, thresholds }) {
  if (!kpaScores || typeof overallPercent !== 'number') {
    return 'No hay suficientes datos para generar una conclusión.';
  }

  const thresholdKpa = thresholds?.kpa ?? 80;
  const thresholdGlobal = thresholds?.global ?? 70;
  
  const weakKpas = Object.entries(kpaScores)
    .filter(([, v]) => v.percent < thresholdKpa)
    .map(([k]) => k);
  
  if (level2Verified) {
    return `Conclusión: ✅ El proyecto cumple el Nivel 2. Todas las áreas clave superan el ${thresholdKpa}% y el puntaje global es ${overallPercent}%.`;
  }

  const reasons = [];
  if (overallPercent < thresholdGlobal) {
    reasons.push(`el puntaje global (${overallPercent}%) está por debajo del mínimo requerido (${thresholdGlobal}%)`);
  }
  if (weakKpas.length > 0) {
    reasons.push(`las siguientes áreas no alcanzan el ${thresholdKpa}%: ${weakKpas.join(', ')}`);
  }

  return `Conclusión: ❌ Aún no se cumple el Nivel 2 porque ${reasons.join(' y ')}.`;
}
``