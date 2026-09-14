"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useUsers } from "@/hooks/useUsers";
import { UserPlus } from "lucide-react";

function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

interface TaskAssigneePickerProps {
  memberIds: string[];
  selected: string[];
  onChange: (next: string[]) => void;
}

export function TaskAssigneePicker({ memberIds, selected, onChange }: TaskAssigneePickerProps) {
  const { data: users } = useUsers();
  const members = (users ?? []).filter((u) => memberIds.includes(u.id));
  const selectedUsers = members.filter((u) => selected.includes(u.id));

  function toggle(userId: string, checked: boolean) {
    onChange(checked ? [...selected, userId] : selected.filter((id) => id !== userId));
  }

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button variant="outline" size="sm" className="gap-1.5">
            <div className="flex -space-x-1.5">
              {selectedUsers.slice(0, 3).map((u) => (
                <Avatar key={u.id} className="size-5 border border-background">
                  <AvatarFallback className="bg-cyan-500/20 text-[9px] text-cyan-700">
                    {initials(u.name)}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
            <UserPlus className="size-3.5" />
            {selectedUsers.length === 0 && "Assign"}
          </Button>
        }
      />
      <PopoverContent className="w-56 p-2" align="start">
        <div className="grid gap-1.5">
          {members.length === 0 && <p className="p-2 text-xs text-muted-foreground">No project members yet.</p>}
          {members.map((u) => (
            <label key={u.id} className="flex items-center gap-2 rounded-md p-1.5 text-sm hover:bg-muted">
              <Checkbox checked={selected.includes(u.id)} onCheckedChange={(c) => toggle(u.id, c === true)} />
              <Avatar className="size-5">
                <AvatarFallback className="bg-cyan-500/20 text-[9px] text-cyan-700">{initials(u.name)}</AvatarFallback>
              </Avatar>
              <Label className="cursor-pointer font-normal">{u.name}</Label>
            </label>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
