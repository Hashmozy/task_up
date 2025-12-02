import { createClient } from "@/lib/supabase/server"
import { TaskDetail } from "@/components/tasks/task-detail"
import { redirect } from "next/navigation"

export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ id: string; taskId: string }>
}) {
  const { id, taskId } = await params
  const supabase = await createClient()

  const { data: task, error: taskError } = await supabase.from("tasks").select("*").eq("id", taskId).single()

  if (taskError || !task) {
    redirect(`/dashboard/projects/${id}`)
  }

  const { data: comments } = await supabase
    .from("task_comments")
    .select("*, user:profiles(id, full_name, email)")
    .eq("task_id", taskId)
    .order("created_at", { ascending: true })

  const { data: statuses } = await supabase
    .from("task_statuses")
    .select("*")
    .eq(
      "workspace_id",
      (await supabase.from("projects").select("workspace_id").eq("id", id).single()).data.workspace_id,
    )

  const { data: assignees } = await supabase.from("profiles").select("*")

  return (
    <TaskDetail
      task={task}
      projectId={id}
      comments={comments || []}
      statuses={statuses || []}
      assignees={assignees || []}
    />
  )
}
