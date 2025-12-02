import { createClient } from "@/lib/supabase/server"
import { TasksView } from "@/components/tasks/tasks-view"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LayoutGrid, List, Calendar } from "lucide-react"

export default async function TasksPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get all tasks assigned to user
  const { data: tasks } = await supabase
    .from("tasks")
    .select("*, project:projects(id, name), status:task_statuses(id, name, color)")
    .eq("assigned_to", user?.id)
    .order("due_date", { ascending: true })

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
            <TasksView tasks={tasks || []} viewType="list" />
          </TabsContent>

          <TabsContent value="kanban" className="flex-1 overflow-auto">
            <TasksView tasks={tasks || []} viewType="kanban" />
          </TabsContent>

          <TabsContent value="calendar" className="flex-1 overflow-auto">
            <TasksView tasks={tasks || []} viewType="calendar" />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
