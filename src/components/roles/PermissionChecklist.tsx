"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ALL_PERMISSIONS, PERMISSION_LABELS, Permission } from "@/types/role";

interface PermissionChecklistProps {
  selected: Permission[];
  onChange: (next: Permission[]) => void;
}

export function PermissionChecklist({ selected, onChange }: PermissionChecklistProps) {
  function toggle(permission: Permission, checked: boolean) {
    onChange(checked ? [...selected, permission] : selected.filter((p) => p !== permission));
  }

  return (
    <div className="grid gap-2.5">
      {ALL_PERMISSIONS.map((permission) => (
        <label key={permission} className="flex items-center gap-2.5 text-sm">
          <Checkbox
            checked={selected.includes(permission)}
            onCheckedChange={(checked) => toggle(permission, checked === true)}
          />
          <Label className="cursor-pointer font-normal">{PERMISSION_LABELS[permission]}</Label>
        </label>
      ))}
    </div>
  );
}
