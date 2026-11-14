import { CURRICULA } from "@/lib/curricula";

export default function CurriculumSelect({
  value,
  onChange,
  allowAny = true,
  id = "curriculum",
}: {
  value: string;
  onChange: (v: string) => void;
  allowAny?: boolean;
  id?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="label">
        Curriculum / Exam
      </label>
      <select id={id} className="input" value={value} onChange={(e) => onChange(e.target.value)}>
        {allowAny && <option value="any">Any</option>}
        {CURRICULA.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
    </div>
  );
}
