// apps/react-app/src/api.js
const fallback = (() => {
  try {
    // Si estás en 5173, cambia a 4000
    const u = new URL(window.location.href);
    const port = u.port === '5173' ? '4000' : (u.port || '4000');
    return `${u.protocol}//${u.hostname}:${port}/api`;
  } catch {
    return 'http://localhost:4000/api';
  }
})();

const API = import.meta.env.VITE_API_URL || fallback;

async function http(url, options) {
  const res = await fetch(url, options);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} ${res.statusText} en ${url}\n${text}`);
  }
  return res.json();
}

export async function getKPAs() {
  return http(`${API}/model/kpas`);
}
export async function getQuestions(kpa) {
  const url = kpa ? `${API}/model/questions?kpa=${encodeURIComponent(kpa)}` : `${API}/model/questions`;
  return http(url);
}
export async function createAssessment(projectName) {
  return http(`${API}/assessments`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectName })
  });
}
export async function saveAnswers(assessmentId, answers) {
  return http(`${API}/assessments/${assessmentId}/answers`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answers })
  });
}
export async function diagnose(assessmentId) {
  return http(`${API}/assessments/${assessmentId}/diagnose`, { method: 'POST' });
}
export async function getReport(assessmentId) {
  return http(`${API}/assessments/${assessmentId}/report`);
}

export async function getAllAssessments() {
  return http(`${API}/assessments`);
}