"use client"

import { useMemo } from "react"
import { KanbanColumn } from "../kanban/kanban-column"

interface Task {
  id: string
  title: string
  description?: string
  priority: string
  assigned_to?: string
  status?: { id: string; name: string; color: string }
}

export function TaskKanbanView({ tasks }: { tasks: Task[] }) {
  const groupedByStatus = useMemo(() => {
    const statuses = new Map<string, any>()
    tasks.forEach((task) => {
      if (!task.status) return
      if (!statuses.has(task.status.id)) {
        statuses.set(task.status.id, { ...task.status, tasks: [] })
      }
      statuses.get(task.status.id).tasks.push(task)
    })
    return Array.from(statuses.values())
  }, [tasks])

  return (
    <div className="px-8 py-6 overflow-x-auto">
      <div className="flex gap-6 min-w-max">
        {groupedByStatus.map((statusGroup) => (
          <KanbanColumn key={statusGroup.id} status={statusGroup} tasks={statusGroup.tasks} projectId="" />
        ))}
      </div>
    </div>
  )
}
