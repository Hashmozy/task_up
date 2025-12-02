import { createClient } from "@/lib/supabase/client"

export interface CreateTaskData {
  title: string
  description?: string
  project_id: string
  status?: string
  priority?: string
  due_date?: string
  assigned_to?: string
}

export interface UpdateTaskData {
  title?: string
  description?: string
  status?: string
  priority?: string
  due_date?: string
  assigned_to?: string
}

/**
 * Create a new task
 */
export async function createTask(data: CreateTaskData) {
  const supabase = createClient()

  const { data: task, error } = await supabase
    .from("tasks")
    .insert({
      title: data.title.trim(),
      description: data.description?.trim() || null,
      project_id: data.project_id,
      status: data.status || "todo",
      priority: data.priority || "medium",
      due_date: data.due_date || null,
      assigned_to: data.assigned_to || null,
    })
    .select()
    .single()

  if (error) throw error

  return task
}

/**
 * Get all tasks in a project
 */
export async function getTasksByProject(projectId: string) {
  const supabase = createClient()

  const { data: tasks, error } = await supabase
    .from("tasks")
    .select("*, assigned_user:profiles!tasks_assigned_to_fkey(id, full_name, email)")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })

  if (error) throw error

  return tasks
}

/**
 * Update a task
 */
export async function updateTask(taskId: string, data: UpdateTaskData) {
  const supabase = createClient()

  const { data: task, error } = await supabase
    .from("tasks")
    .update({
      title: data.title?.trim(),
      description: data.description?.trim(),
      status: data.status,
      priority: data.priority,
      due_date: data.due_date,
      assigned_to: data.assigned_to,
    })
    .eq("id", taskId)
    .select()
    .single()

  if (error) throw error

  return task
}

/**
 * Delete a task
 */
export async function deleteTask(taskId: string) {
  const supabase = createClient()

  const { error } = await supabase.from("tasks").delete().eq("id", taskId)

  if (error) throw error
}
