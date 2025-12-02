"use client"

import { TaskListView } from "./task-list-view"
import { TaskCalendarView } from "./task-calendar-view"
import { TaskKanbanView } from "./task-kanban-view"

interface Task {
  id: string
  title: string
  description?: string
  priority: string
  assigned_to?: string
  due_date?: string
  project?: { id: string; name: string }
  status?: { id: string; name: string; color: string }
}

export function TasksView({
  tasks,
  viewType,
}: {
  tasks: Task[]
  viewType: "list" | "kanban" | "calendar"
}) {
  switch (viewType) {
    case "list":
      return <TaskListView tasks={tasks} />
    case "kanban":
      return <TaskKanbanView tasks={tasks} />
    case "calendar":
      return <TaskCalendarView tasks={tasks} />
    default:
      return null
  }
}
