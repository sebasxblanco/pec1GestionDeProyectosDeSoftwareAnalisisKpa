import React, { useState, useEffect } from 'react';
import { getAllAssessments } from '../api';
import CircularProgress from './CircularProgress';

export default function SavedReports({ onSelectReport }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const data = await getAllAssessments();
      setReports(data.filter(r => r.status === 'diagnosed').sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      ));
    } catch (err) {
      setError('Error al cargar los informes: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="subtle">Cargando informes...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!reports.length) return <div className="subtle">No hay informes guardados</div>;

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('es', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="saved-reports">
      <div className="reports-grid">
        {reports.map(report => {
          const overall = JSON.parse(report.overall_json || '{}');
          const percent = overall.overallPercent || 0;
          
          return (
            <div 
              key={report.id} 
              className="report-card"
              onClick={() => onSelectReport({
                ...report,
                created_at: formatDate(report.created_at)
              })}
            >
              <div className="report-header">
                <div className="report-title">{report.project_name}</div>
                <CircularProgress 
                  value={percent} 
                  size={50}
                  style={{ margin: '8px 0' }}
                  color="var(--primary)"
                />
              </div>
              <div className="report-date subtle">
                {formatDate(report.created_at)}
              </div>
              <div className="report-verification">
                {percent >= 70 ? (
                  <span className="badge success">Nivel 2 ✓</span>
                ) : percent >= 40 ? (
                  <span className="badge warning">Nivel 2 ⚠</span>
                ) : (
                  <span className="badge danger">Nivel 2 ✗</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}