"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { letterGrade, marksToPoint } from "@/lib/grade";

type Row = { name: string; credit: string; marks: string };

export default function GpaClient() {
  const [rows, setRows] = useState<Row[]>([
    { name: "Subject 1", credit: "3", marks: "" },
    { name: "Subject 2", credit: "3", marks: "" },
    { name: "Subject 3", credit: "2", marks: "" },
  ]);

  const { gpa, credits, failed } = useMemo(() => {
    let pts = 0;
    let cr = 0;
    let failed = 0;
    for (const r of rows) {
      const c = Number(r.credit);
      const m = Number(r.marks);
      if (!c || r.marks === "") continue;
      const { point } = marksToPoint(m);
      if (point === 0) failed++;
      pts += point * c;
      cr += c;
    }
    return { gpa: cr ? Math.round((pts / cr) * 100) / 100 : null, credits: cr, failed };
  }, [rows]);

  const update = (i: number, patch: Partial<Row>) => setRows(rows.map((r, j) => (j === i ? { ...r, ...patch } : r)));

  return (
    <div className="mx-auto grid max-w-4xl gap-6 lg:grid-cols-5">
      <div className="card p-6 lg:col-span-3">
        <div className="space-y-3">
          {rows.map((r, i) => {
            const g = r.marks === "" ? null : marksToPoint(Number(r.marks));
            return (
              <div key={i} className="grid grid-cols-12 items-end gap-2">
                <div className="col-span-5">
                  {i === 0 && <label className="label">Subject</label>}
                  <input className="input" value={r.name} onChange={(e) => update(i, { name: e.target.value })} />
                </div>
                <div className="col-span-2">
                  {i === 0 && <label className="label">Credit</label>}
                  <input className="input" type="number" min={0} max={10} step={0.5} value={r.credit} onChange={(e) => update(i, { credit: e.target.value })} />
                </div>
                <div className="col-span-3">
                  {i === 0 && <label className="label">Marks %</label>}
                  <input className="input" type="number" min={0} max={100} value={r.marks} onChange={(e) => update(i, { marks: e.target.value })} />
                </div>
                <div className="col-span-2 flex items-center justify-between pb-2.5">
                  <span className={`text-xs font-semibold ${g?.point === 0 ? "text-rose-600" : "text-slate-600"}`}>{g ? g.grade : ""}</span>
                  <button type="button" className="text-slate-400 hover:text-rose-600" onClick={() => setRows(rows.filter((_, j) => j !== i))} aria-label="Remove">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        <button type="button" className="btn-outline mt-4 text-xs" onClick={() => setRows([...rows, { name: `Subject ${rows.length + 1}`, credit: "3", marks: "" }])}>
          <Plus className="h-3.5 w-3.5" /> Add subject
        </button>
      </div>
      <div className="card flex flex-col items-center justify-center p-8 text-center lg:col-span-2">
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Semester GPA</div>
        <div className={`mt-2 text-6xl font-extrabold ${failed ? "text-rose-600" : "text-emerald-700"}`}>{gpa != null ? gpa.toFixed(2) : "—"}</div>
        {gpa != null && !failed && <div className="mt-1 text-lg font-semibold text-slate-600">Grade {letterGrade(gpa)}</div>}
        {failed > 0 && <div className="mt-2 text-sm font-medium text-rose-600">{failed} subject(s) below 40%: you would be referred.</div>}
        <p className="mt-4 text-xs text-slate-500">{credits} credit(s) counted</p>
      </div>
    </div>
  );
}
