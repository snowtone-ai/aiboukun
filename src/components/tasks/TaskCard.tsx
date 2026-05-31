"use client";

import { useRouter } from "next/navigation";
import { CalendarDays } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate, priorityLabel, taskStatusLabel } from "@/lib/formatters";
import { cn } from "@/lib/utils";

type TaskCardProps = {
  task: {
    id: string;
    title: string;
    detail: string | null;
    priority: string;
    status: string;
    type: string;
    dueDate: Date | null;
    store: { name: string };
  };
};

export function TaskCard({ task }: TaskCardProps) {
  const router = useRouter();

  async function updateStatus(status: string) {
    await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    router.refresh();
  }

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-medium">{task.title}</p>
            <p className="text-xs text-muted-foreground">
              {task.store.name}・{task.type}
            </p>
          </div>
          <Badge
            variant="secondary"
            className={cn(
              "rounded-full",
              task.priority === "URGENT" && "bg-danger text-white",
              task.priority === "HIGH" && "bg-warning/10 text-warning",
            )}
          >
            {priorityLabel[task.priority]}
          </Badge>
        </div>
        {task.detail ? <p className="text-sm leading-6 text-muted-foreground">{task.detail}</p> : null}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <CalendarDays className="size-4" />
            {formatDate(task.dueDate)}
            <Badge variant="outline" className="rounded-full">
              {taskStatusLabel[task.status]}
            </Badge>
          </div>
          <div className="flex gap-2">
            {task.status !== "DOING" ? (
              <Button size="sm" variant="outline" onClick={() => updateStatus("DOING")}>
                着手
              </Button>
            ) : null}
            {task.status !== "DONE" ? (
              <Button size="sm" onClick={() => updateStatus("DONE")}>
                完了
              </Button>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
