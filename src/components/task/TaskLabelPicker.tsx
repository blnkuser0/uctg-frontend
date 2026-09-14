"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { LabelBadge } from "@/components/labels/LabelBadge";
import { useLabels } from "@/hooks/useLabels";
import { Tag } from "lucide-react";

interface TaskLabelPickerProps {
  projectId: string;
  selected: string[];
  onChange: (next: string[]) => void;
}

export function TaskLabelPicker({ projectId, selected, onChange }: TaskLabelPickerProps) {
  const { data: labels } = useLabels(projectId);
  const selectedLabels = (labels ?? []).filter((l) => selected.includes(l._id));

  function toggle(labelId: string, checked: boolean) {
    onChange(checked ? [...selected, labelId] : selected.filter((id) => id !== labelId));
  }

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button variant="outline" size="sm" className="h-auto min-h-9 flex-wrap justify-start gap-1.5 py-1.5">
            <Tag className="size-3.5 shrink-0" />
            {selectedLabels.length === 0 ? (
              "Labels"
            ) : (
              selectedLabels.map((l) => <LabelBadge key={l._id} label={l} />)
            )}
          </Button>
        }
      />
      <PopoverContent className="w-56 p-2" align="start">
        <div className="grid gap-1.5">
          {(labels ?? []).length === 0 && <p className="p-2 text-xs text-muted-foreground">No labels yet — add some in Settings.</p>}
          {(labels ?? []).map((l) => (
            <label key={l._id} className="flex items-center gap-2 rounded-md p-1.5 text-sm hover:bg-muted">
              <Checkbox checked={selected.includes(l._id)} onCheckedChange={(c) => toggle(l._id, c === true)} />
              <Label className="cursor-pointer font-normal">
                <LabelBadge label={l} />
              </Label>
            </label>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
