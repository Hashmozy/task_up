"use client"

import { useSearchParams } from "next/navigation"
import { useTasks } from "@/lib/hooks/use-queries"
import { TasksView } from "@/components/tasks/tasks-view"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LayoutGrid, List, Calendar } from "lucide-react"

export default function TasksPage() {
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
        <p className="text-destructive">Error loading tasks</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-border px-8 py-4">
        <h1 className="text-2xl font-bold">My Tasks</h1>
        <p className="text-muted-foreground mt-1">Manage all your tasks in one place</p>
      </div>

      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="list" className="h-full flex flex-col">
          <TabsList className="w-fit mx-8 my-4">
            <TabsTrigger value="list" className="gap-2">
              <List className="w-4 h-4" />
              List
            </TabsTrigger>
            <TabsTrigger value="kanban" className="gap-2">
              <LayoutGrid className="w-4 h-4" />
              Board
            </TabsTrigger>
            <TabsTrigger value="calendar" className="gap-2">
              <Calendar className="w-4 h-4" />
              Calendar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="flex-1 overflow-auto">
            <TasksView tasks={tasks} viewType="list" />
          </TabsContent>

          <TabsContent value="kanban" className="flex-1 overflow-auto">
            <TasksView tasks={tasks} viewType="kanban" />
          </TabsContent>

          <TabsContent value="calendar" className="flex-1 overflow-auto">
            <TasksView tasks={tasks} viewType="calendar" />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
