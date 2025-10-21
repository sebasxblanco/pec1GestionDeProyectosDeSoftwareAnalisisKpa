import React from 'react';
import ProgressBar from '../components/ProgressBar.jsx';
import CircularProgress from '../components/CircularProgress.jsx';

function normalizeResult(data) {
  // Si viene como objeto JSON guardado, parseamos los campos
  if (data?.kpa_scores_json || data?.recommendations_json || data?.overall_json) {
    return {
      kpaScores: JSON.parse(data.kpa_scores_json || '{}'),
      recommendations: JSON.parse(data.recommendations_json || '{}'),
      overall: JSON.parse(data.overall_json || '{}')
    };
  }
  
  // Si ya viene con top-level (variante A), úsalo tal cual
  if (data?.kpaScores && data?.overall) {
    return {
      kpaScores: data.kpaScores || {},
      recommendations: data.recommendations || {},
      overall: data.overall || { overallPercent: 0, level2Verified: false, conclusion: '' }
    };
  }

  // Si viene en data.report (variante B), normaliza
  const rpt = data?.report || {};
  const kpaScores = rpt.summaryAllKpas || {};
  // Recomposiciones desde perKpa -> { KPA: [recs...] }
  const recs = {};
  if (Array.isArray(rpt.perKpa)) {
    for (const k of rpt.perKpa) {
      recs[k.kpa] = k.recommendations || [];
    }
  }
  const overall = {
    overallPercent: Number(rpt.generalDiagnosis || 0),
    level2Verified: !!rpt.level2Verification,
    conclusion: rpt.conclusion || ''
  };
  return { kpaScores, recommendations: recs, overall };
}

export default function ResultsView({ data }) {
  if (!data) return null;

  const { kpaScores, recommendations, overall } = normalizeResult(data);

  return (
    <div className="results-view">
      <div className="diagnostics-section">
        <div className="diagnostics-card">
          <h2>Diagnóstico general</h2>
          <div className="diagnostics-content">
            <CircularProgress 
              value={overall.overallPercent || 0} 
              size={180}
              thickness={12}
            />
            <div className="verification-status">
              Verificación Nivel 2:{' '}
              <span className={`status-text ${(overall.overallPercent || 0) >= 70 ? 'success' : (overall.overallPercent || 0) >= 40 ? 'warning' : 'danger'}`}>
                {(overall.overallPercent || 0) >= 70 ? 'Cumplido' : 
                 (overall.overallPercent || 0) >= 40 ? 'Cumple parcialmente' : 
                 'No cumplido'}
              </span>
            </div>
          </div>
        </div>

        <div className="conclusion-card">
          <div className="conclusion-header">Conclusión</div>
          <div className="conclusion-content">
            <span className={`conclusion-icon ${(overall.overallPercent || 0) >= 70 ? 'success' : (overall.overallPercent || 0) >= 40 ? 'warning' : 'danger'}`}>
              {(overall.overallPercent || 0) >= 70 ? '✓' : (overall.overallPercent || 0) >= 40 ? '⚠' : '✗'}
            </span>
            <div>
              <p>
                {`${(overall.overallPercent || 0) >= 70 ? 'Se cumple' : 
                   (overall.overallPercent || 0) >= 40 ? 'Cumple parcialmente' : 
                   'Aún no se cumple'} el Nivel 2.`}
              </p>
              {(overall.overallPercent || 0) < 70 && (
                <p className="conclusion-areas">
                  Áreas a reforzar: {
                    Object.entries(kpaScores)
                      .filter(([, v]) => (v.percent || 0) < 70)
                      .map(([kpa]) => kpa)
                      .join(', ')
                  }
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="kpa-grid">
        {Object.entries(kpaScores).map(([kpa, v]) => {
          const percent = v.percent ?? v?.percentage ?? 0;
          const status = percent >= 70 ? 'success' :
                        percent >= 40 ? 'warning' :
                        'danger';

          return (
            <div key={kpa} className={`card kpa-card status-${status}`}>
              <div className="kpa-header">
                <div className="kpa-title">
                  <h3>{kpa}</h3>
                    {percent >= 70 ? (
                    <span className="status-badge success">✓ Cumple</span>
                  ) : percent >= 40 ? (
                    <span className="status-badge warning">Cumple parcialmente</span>
                  ) : (
                    <span className="status-badge danger">No cumple</span>
                  )}
                </div>
                <CircularProgress 
                  value={percent || 0}
                  size={90}
                  thickness={10}
                />
              </div>
              <div className="kpa-content">
                <div className="kpa-recommendations">
                  <b>Recomendaciones</b>
                  <ul>
                    {(recommendations[kpa] || []).map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                    {(!recommendations[kpa] || recommendations[kpa].length === 0) && (
                      percent === 0 ? (
                        <li className="error">No se han contestado las preguntas de esta área. Complete la evaluación para obtener recomendaciones específicas.</li>
                      ) : percent === 100 ? (
                        <li className="success">¡Excelente! Se cumplen todas las prácticas requeridas en esta área.</li>
                      ) : percent >= 70 ? (
                        <li className="info">El área cumple con los requisitos mínimos. Considere implementar mejoras adicionales para optimizar el proceso.</li>
                      ) : percent >= 40 ? (
                        <li className="warning">Se requiere fortalecer algunas prácticas clave. Revise las preguntas con respuesta parcial o negativa.</li>
                      ) : (
                        <li className="error">Se necesita atención prioritaria en esta área. Implemente las prácticas básicas sugeridas en el cuestionario.</li>
                      )
                    )}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}