"use client"

import { KanbanCard } from "./kanban-card"

interface Status {
  id: string
  name: string
  color: string
}

interface Task {
  id: string
  title: string
  description?: string
  priority: string
  assigned_to?: string
}

export function KanbanColumn({
  status,
  tasks,
  projectId,
}: {
  status: Status
  tasks: Task[]
  projectId: string
}) {
  return (
    <div className="flex-shrink-0 w-80 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: status.color }} />
        <h2 className="font-semibold text-sm">{status.name}</h2>
        <span className="text-xs text-muted-foreground ml-auto bg-muted px-2 py-1 rounded">{tasks.length}</span>
      </div>

      <div className="flex-1 flex flex-col gap-3 min-h-96">
        {tasks.map((task) => (
          <KanbanCard key={task.id} task={task} projectId={projectId} />
        ))}
        {tasks.length === 0 && (
          <div className="flex-1 rounded-lg border-2 border-dashed border-muted flex items-center justify-center text-muted-foreground text-sm">
            No tasks yet
          </div>
        )}
      </div>
    </div>
  )
}
