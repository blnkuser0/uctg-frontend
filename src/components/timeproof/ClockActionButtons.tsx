"use client";

import { Button } from "@/components/ui/button";
import { ClockState, TimeLogType } from "@/types/timeLog";
import { LogIn, LogOut, Coffee, UtensilsCrossed } from "lucide-react";

const VALID_ACTIONS: Record<ClockState, TimeLogType[]> = {
  "clocked-out": ["time-in"],
  working: ["break-in", "lunch-in", "time-out"],
  "on-break": ["break-out"],
  "on-lunch": ["lunch-out"],
};

const ACTION_META: Record<TimeLogType, { label: string; icon: typeof LogIn; primary?: boolean }> = {
  "time-in": { label: "Time In", icon: LogIn, primary: true },
  "time-out": { label: "Time Out", icon: LogOut },
  "break-in": { label: "Start Break", icon: Coffee },
  "break-out": { label: "End Break", icon: Coffee, primary: true },
  "lunch-in": { label: "Start Lunch", icon: UtensilsCrossed },
  "lunch-out": { label: "End Lunch", icon: UtensilsCrossed, primary: true },
};

interface ClockActionButtonsProps {
  state: ClockState;
  onAction: (type: TimeLogType) => void;
  isPending?: boolean;
}

export function ClockActionButtons({ state, onAction, isPending }: ClockActionButtonsProps) {
  const actions = VALID_ACTIONS[state];

  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((type) => {
        const { label, icon: Icon, primary } = ACTION_META[type];
        return (
          <Button
            key={type}
            disabled={isPending}
            onClick={() => onAction(type)}
            className={primary ? "bg-amber-500 text-stone-900 hover:bg-amber-400" : undefined}
            variant={primary ? "default" : "outline"}
          >
            <Icon className="size-4" />
            {label}
          </Button>
        );
      })}
    </div>
  );
}
