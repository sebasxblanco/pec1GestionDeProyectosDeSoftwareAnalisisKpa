import React, { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState(() =>
    localStorage.getItem("theme") || "auto"
  );

  useEffect(() => {
    const root = document.documentElement;
    // Primero limpiamos todas las clases y atributos
    root.removeAttribute("data-theme");
    root.classList.remove("theme-dark", "theme-light");
    
    // Luego aplicamos el tema seleccionado
    if (theme !== "auto") {
      root.setAttribute("data-theme", theme);
    }
    
    // Guardamos la preferencia
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <div className="row" role="group" aria-label="Selector de tema">
      <button className="btn ghost" onClick={() => setTheme("light")} aria-pressed={theme==="light"}>
        Claro
      </button>
      <button className="btn ghost" onClick={() => setTheme("dark")} aria-pressed={theme==="dark"}>
        Oscuro
      </button>
      <button className="btn ghost" onClick={() => setTheme("auto")} aria-pressed={theme==="auto"}>
        Auto
      </button>
    </div>
  );
}