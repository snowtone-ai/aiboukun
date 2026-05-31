import { ClipboardList } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { TaskCard } from "@/components/tasks/TaskCard";
import { TaskFilterBar } from "@/components/tasks/TaskFilterBar";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma/client";

type TasksPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function TasksPage({ searchParams }: TasksPageProps) {
  const [session, params] = await Promise.all([auth(), searchParams]);
  const status = valueOf(params?.status);
  const tasks = session?.organizationId
    ? await prisma.task.findMany({
        where: {
          store: { organizationId: session.organizationId },
          ...(status ? { status: status as never } : {}),
        },
        include: { store: { select: { name: true } } },
        orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
        take: 80,
      })
    : [];

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-normal">タスク</h1>
        <p className="text-sm text-muted-foreground">AIが見つけた改善アクションを期限順に進めます。</p>
      </div>
      <TaskFilterBar status={status} />
      {tasks.length ? (
        <div className="space-y-3">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      ) : (
        <EmptyState icon={ClipboardList} title="タスクはありません" description="低評価や未返信が見つかると、ここに改善タスクが表示されます。" />
      )}
    </div>
  );
}

function valueOf(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
