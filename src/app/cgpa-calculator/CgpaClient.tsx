"use client";

import { useMemo, useState } from "react";
import { CGPA_WEIGHTS, computeCgpa, letterGrade, ordinal } from "@/lib/grade";

export default function CgpaClient() {
  const [regulation, setRegulation] = useState("2022");
  const [gpas, setGpas] = useState<string[]>(Array(8).fill(""));
  const weights = CGPA_WEIGHTS[regulation];

  const cgpa = useMemo(() => computeCgpa(gpas.map((g) => (g === "" ? null : Number(g))), regulation), [gpas, regulation]);
  const filled = gpas.filter((g) => g !== "").length;

  return (
    <div className="mx-auto grid max-w-4xl gap-6 lg:grid-cols-5">
      <div className="card p-6 lg:col-span-3">
        <div className="mb-4">
          <label className="label" htmlFor="reg">
            Regulation
          </label>
          <select id="reg" className="input" value={regulation} onChange={(e) => setRegulation(e.target.value)}>
            {Object.keys(CGPA_WEIGHTS).map((r) => (
              <option key={r} value={r}>
                {r} Regulation
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {gpas.map((g, i) => (
            <div key={i}>
              <label className="label" htmlFor={`g${i}`}>
                {ordinal(i + 1)} Semester <span className="text-xs text-slate-400">({weights[i]}%)</span>
              </label>
              <input
                id={`g${i}`}
                className="input"
                type="number"
                min={0}
                max={4}
                step={0.01}
                placeholder="e.g. 3.50"
                value={g}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v !== "" && (Number(v) < 0 || Number(v) > 4)) return;
                  setGpas(gpas.map((x, j) => (j === i ? v : x)));
                }}
              />
            </div>
          ))}
        </div>
        <button type="button" className="btn-ghost mt-4 text-xs" onClick={() => setGpas(Array(8).fill(""))}>
          Reset
        </button>
      </div>
      <div className="card flex flex-col items-center justify-center p-8 text-center lg:col-span-2">
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Your CGPA</div>
        <div className="mt-2 text-6xl font-extrabold text-brand-700">{cgpa != null ? cgpa.toFixed(2) : "—"}</div>
        {cgpa != null && <div className="mt-1 text-lg font-semibold text-slate-600">Grade {letterGrade(cgpa)}</div>}
        <p className="mt-4 text-xs text-slate-500">
          Based on {filled} of 8 semesters. {filled < 8 ? "Weights are normalised to the semesters you entered." : "All semesters entered."}
        </p>
      </div>
    </div>
  );
}
