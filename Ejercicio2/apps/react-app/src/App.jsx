import React, { useState } from "react";
import "./styles.css";
import AssessmentForm from "./pages/AssessmentForm.jsx";
import ResultsView from "./pages/ResultsView.jsx";
import ThemeToggle from "./components/ThemeToggle.jsx";
import SavedReports from "./components/SavedReports.jsx";
import Notification from "./components/Notification.jsx";

export default function App() {
  const [result, setResult] = useState(null);
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
  };

  return (
    <>
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
      <header className="header">
        <div className="header-inner">
          <div className="brand">
            <span className="brand-dot" />
            <span>CMMI Nivel 2</span>
            <span className="subtle">| Evaluación & Diagnóstico</span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="container">
        {!result ? (
          <div className="grid-3">
            <section className="card saved-reports-section">
              <h2>Informes guardados</h2>
              <SavedReports onSelectReport={(report) => {
                if (report.status === 'diagnosed') {
                  setResult(report);
                } else {
                  showNotification('Cargando evaluación previa...', 'info');
                  setResult({ ...report, isEditing: true });
                }
              }} />
            </section>

            <section className="card">
              <h1>Evaluación CMMI</h1>
              <p className="subtle">Responde por KPA con Sí / Parcial / No y genera tu diagnóstico.</p>
              <div className="divider" />
              <AssessmentForm 
                onDone={setResult}
                onNotification={showNotification}
                loadedReport={result?.isEditing ? result : null}
              />
            </section>

            <aside className="card tips-card">
              <h2>Consejos rápidos</h2>
              <div className="tips-container">
                <div className="tip-item">
                  <div className="tip-icon">📋</div>
                  <div className="tip-content">
                    <strong>Evidencias reales</strong>
                    <p>Utiliza WBS, planes y actas como evidencia</p>
                  </div>
                </div>
                <div className="tip-item">
                  <div className="tip-icon">🔄</div>
                  <div className="tip-content">
                    <strong>Consistencia</strong>
                    <p>Mantén coherencia entre todos los KPAs</p>
                  </div>
                </div>
                <div className="tip-item">
                  <div className="tip-icon">⚡</div>
                  <div className="tip-content">
                    <strong>Priorización</strong>
                    <p>Enfócate en acciones de alto impacto y bajo esfuerzo</p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        ) : (
          <section className="card">
            <ResultsView data={result} />
            <div className="row" style={{ marginTop: 12 }}>
              <button className="btn" onClick={() => setResult(null)}>Nueva evaluación</button>
            </div>
          </section>
        )}
      </main>
    </>
  );
}
