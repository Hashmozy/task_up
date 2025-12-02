import { createClient } from "@/lib/supabase/server"
import { KanbanBoard } from "@/components/kanban/kanban-board"
import { redirect } from "next/navigation"

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: project, error: projectError } = await supabase.from("projects").select("*").eq("id", id).single()

  if (projectError || !project) {
    redirect("/dashboard")
  }

  // Get task statuses
  const { data: statuses } = await supabase
    .from("task_statuses")
    .select("*")
    .eq("workspace_id", project.workspace_id)
    .order("order_index", { ascending: true })

  // Get all tasks for this project
  const { data: tasks } = await supabase
    .from("tasks")
    .select("*")
    .eq("project_id", id)
    .order("created_at", { ascending: true })

  return (
    <div className="flex-1 flex flex-col">
      <div className="border-b border-border px-8 py-4">
        <h1 className="text-2xl font-bold">{project.name}</h1>
        {project.description && <p className="text-muted-foreground mt-1">{project.description}</p>}
      </div>
      <KanbanBoard projectId={id} statuses={statuses || []} tasks={tasks || []} />
    </div>
  )
}
