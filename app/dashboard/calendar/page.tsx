"use client"

import { useSearchParams } from "next/navigation"
import { useTasks } from "@/lib/hooks/use-queries"
import { TasksView } from "@/components/tasks/tasks-view"

export default function CalendarPage() {
  const searchParams = useSearchParams()
  const workspaceId = searchParams.get("workspace") || undefined
  
  const { data: tasks = [], isLoading, error } = useTasks(workspaceId)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-destructive">Error loading calendar</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-border px-8 py-4">
        <h1 className="text-2xl font-bold">Calendar</h1>
        <p className="text-muted-foreground mt-1">View your tasks timeline</p>
      </div>

      <div className="flex-1 overflow-hidden p-8">
        <TasksView tasks={tasks} viewType="calendar" />
      </div>
    </div>
  )
}
