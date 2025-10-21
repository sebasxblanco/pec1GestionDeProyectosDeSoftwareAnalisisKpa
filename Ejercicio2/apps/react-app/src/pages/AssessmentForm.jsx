import React, { useEffect, useState } from 'react';
import { getKPAs, getQuestions, createAssessment, saveAnswers, diagnose } from '../api.js';

const OPTIONS = [
  { value: 'si', label: 'Sí' },
  { value: 'parcial', label: 'Parcial' },
  { value: 'no', label: 'No' }
];

export default function AssessmentForm({ onDone, onNotification, loadedReport = null }) {
  const [kpas, setKpas] = useState([]);
  const [activeKpa, setActiveKpa] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [assessment, setAssessment] = useState(loadedReport ? { id: loadedReport.id } : null);
  const [answers, setAnswers] = useState(loadedReport?.answers || {});
  const [projectName, setProjectName] = useState(loadedReport?.project_name || 'Proyecto Demo');
  const [loading, setLoading] = useState(false);
  const [readOnly, setReadOnly] = useState(loadedReport?.status === 'diagnosed');

  useEffect(() => {
    (async () => {
      setKpas(await getKPAs());
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (!assessment && !loadedReport) {
        const a = await createAssessment(projectName || 'Proyecto sin nombre');
        setAssessment(a);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!activeKpa) return;
    (async () => setQuestions(await getQuestions(activeKpa)))();
  }, [activeKpa]);

  const handleChange = (qid, val) => setAnswers(prev => ({ ...prev, [qid]: val }));

  
  const saveNow = async () => {
    if (!assessment) return;
    setLoading(true);
    try {
      const resp = await saveAnswers(assessment.id, answers);
      console.log("[SAVE ANSWERS] OK:", resp);
      onNotification?.('Respuestas guardadas correctamente', 'success');
    } catch (e) {
      console.error("[SAVE ANSWERS] ERROR:", e);
      onNotification?.('Error guardando respuestas: ' + e.message, 'error');
    } finally {
      setLoading(false);
    }
  };


  
  const finish = async () => {
    if (!assessment) return;
    setLoading(true);
    try {
      const saved = await saveAnswers(assessment.id, answers);
      console.log("[SAVE BEFORE DIAG] OK:", saved);

      const result = await diagnose(assessment.id);
      console.log("[DIAGNOSE] OK:", result);

      // Pase el resultado tal y como venga; ResultsView hará el fallback.
      onDone?.(result);
    } catch (e) {
      console.error("[DIAGNOSE] ERROR:", e);
      alert(`Error durante el diagnóstico:\n${e.message}`);
    } finally {
      setLoading(false);
    }
  };


  return (
    <>
      <div className="row" style={{ marginBottom: 10 }}>
        <label className="subtle">Proyecto</label>
        <input
          type="text"
          value={projectName}
          onChange={e => setProjectName(e.target.value)}
          placeholder="Nombre del proyecto"
          aria-label="Nombre del proyecto"
        />
        {assessment && <span className="badge">ID eval: {assessment.id}</span>}
      </div>

      <div className="tabs">
        {kpas.map(k => (
          <button
            key={k.code}
              className={`tab ${activeKpa === k.code ? 'active' : ''} ${
                answers[`${k.code}_completed`] ? 'completed' : ''
              }`}
            onClick={() => setActiveKpa(k.code)}
            title={k.name}
          >
            {k.code}
          </button>
        ))}
      </div>

      {activeKpa && (
        <div>
          <h2 style={{ marginBottom: 8 }}>
            {activeKpa} <span className="badge">{(kpas.find(k => k.code === activeKpa) || {}).name}</span>
          </h2>
          <div className="divider" />

          {questions.map((q, idx) => (
            <div key={q.id} className="question">
              <div>
                <div style={{ fontWeight: 600 }}>{q.text}</div>
                <div className="subtle">({q.sp || 'SP'})</div>
              </div>

              {/* Control segmentado accesible */}
              <div className={`segment ${readOnly ? 'readonly' : ''}`} role="group" aria-label={`Respuesta ${q.id}`}>
                <input
                  id={`${q.id}-si`}
                  type="radio"
                  name={q.id}
                  value="si"
                  checked={(answers[q.id] || '') === 'si'}
                  onChange={(e) => !readOnly && handleChange(q.id, e.target.value)}
                  disabled={readOnly}
                />
                <label htmlFor={`${q.id}-si`}>Sí</label>

                <input
                  id={`${q.id}-parcial`}
                  type="radio"
                  name={q.id}
                  value="parcial"
                  checked={(answers[q.id] || '') === 'parcial'}
                  onChange={(e) => !readOnly && handleChange(q.id, e.target.value)}
                  disabled={readOnly}
                />
                <label htmlFor={`${q.id}-parcial`}>Parcial</label>

                <input
                  id={`${q.id}-no`}
                  type="radio"
                  name={q.id}
                  value="no"
                  checked={(answers[q.id] || '') === 'no'}
                  onChange={(e) => !readOnly && handleChange(q.id, e.target.value)}
                  disabled={readOnly}
                />
                <label htmlFor={`${q.id}-no`}>No</label>
              </div>

              {idx < questions.length - 1 && <div className="divider" style={{ gridColumn: "1 / -1" }} />}
            </div>
          ))}

          <div className="row" style={{ marginTop: 12 }}>
            <button className="btn" onClick={saveNow} disabled={!assessment || loading}>
              {loading ? 'Guardando…' : 'Guardar'}
            </button>
            <button className="btn primary" onClick={finish} disabled={!assessment || loading}>
              {loading ? 'Procesando…' : 'Finalizar y Diagnosticar'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}