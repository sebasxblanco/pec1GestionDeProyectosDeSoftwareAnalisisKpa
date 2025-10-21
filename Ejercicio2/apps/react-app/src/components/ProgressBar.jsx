import React from "react";

export default function ProgressBar({ value = 0 }) {
  const v = Math.max(0, Math.min(100, value));
  const color = v >= 80 ? "var(--ok)" : v >= 60 ? "var(--mid)" : "var(--low)";
  return (
    <div className="progress" role="progressbar" aria-valuenow={v} aria-valuemin={0} aria-valuemax={100}>
      <div className="progress-fill" style={{ width: `${v}%`, background: color }} />
    </div>
  );
}