"use client";

import { useDraggable } from "@dnd-kit/core";
import { TaskCard } from "./TaskCard";
import { Label } from "@/types/label";
import { Task } from "@/types/task";
import { User } from "@/types/user";

interface DraggableTaskCardProps {
  task: Task;
  projectKey: string;
  labels: Label[];
  assignees: User[];
  onClick: () => void;
}

export function DraggableTaskCard(props: DraggableTaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: props.task._id });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, zIndex: 10 }
    : undefined;

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} className={isDragging ? "opacity-40" : undefined}>
      <TaskCard {...props} />
    </div>
  );
}
