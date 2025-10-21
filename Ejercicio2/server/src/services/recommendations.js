import fs from 'fs/promises';
import path from 'path';

/** Carga rules.json desde DATA_DIR */
export async function loadRules(dataDir) {
  const full = path.resolve(dataDir, 'rules.json');
  const raw = await fs.readFile(full, 'utf-8');
  return JSON.parse(raw);
}

/**
 * Genera recomendaciones por KPA en base a las respuestas.
 * - Reglas disparan si answer ∈ rule.whenAnswerIn para el mismo KPA y SP.
 * @returns {Object} { [KPA]: string[] }
 */
export function generateRecommendations(answersByQId, questions, rules) {
  const byKpa = {};
  const idx = {}; // "KPA::SP" → rules[]

  for (const r of rules) {
    const key = `${r.kpa}::${r.sp || 'SP'}`;
    if (!idx[key]) idx[key] = [];
    idx[key].push(r);
  }

  for (const q of questions) {
    const ans = (answersByQId[q.id] || '').toString().trim().toLowerCase();
    const k = `${q.kpa}::${q.sp || 'SP'}`;
    const candidates = idx[k] || [];
    for (const rule of candidates) {
      const triggers = (rule.whenAnswerIn || []).map(x => x.toLowerCase());
      if (triggers.includes(ans)) {
        if (!byKpa[q.kpa]) byKpa[q.kpa] = new Set();
        for (const act of rule.actions || []) byKpa[q.kpa].add(act);
      }
    }
  }

  // convertir Set → array
  const out = {};
  for (const kpa of Object.keys(byKpa)) {
    out[kpa] = Array.from(byKpa[kpa]);
  }
  return out;
}