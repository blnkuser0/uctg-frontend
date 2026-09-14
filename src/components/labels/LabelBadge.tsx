import { Label } from "@/types/label";

export function LabelBadge({ label }: { label: Pick<Label, "name" | "color"> }) {
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium"
      style={{ backgroundColor: `${label.color}22`, color: label.color }}
    >
      {label.name}
    </span>
  );
}
