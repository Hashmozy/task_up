import { createClient } from "@/lib/supabase/client"

export interface CreateProjectData {
  name: string
  description?: string
  workspace_id: string
  start_date?: string
  end_date?: string
}

export interface UpdateProjectData {
  name?: string
  description?: string
  start_date?: string
  end_date?: string
  status?: string
}

/**
 * Create a new project
 */
export async function createProject(data: CreateProjectData) {
  const supabase = createClient()

  const { data: project, error } = await supabase
    .from("projects")
    .insert({
      name: data.name.trim(),
      description: data.description?.trim() || null,
      workspace_id: data.workspace_id,
      start_date: data.start_date || null,
      end_date: data.end_date || null,
    })
    .select()
    .single()

  if (error) throw error

  return project
}

/**
 * Get all projects in a workspace
 */
export async function getProjectsByWorkspace(workspaceId: string) {
  const supabase = createClient()

  const { data: projects, error } = await supabase
    .from("projects")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })

  if (error) throw error

  return projects
}

/**
 * Update a project
 */
export async function updateProject(projectId: string, data: UpdateProjectData) {
  const supabase = createClient()

  const { data: project, error } = await supabase
    .from("projects")
    .update({
      name: data.name?.trim(),
      description: data.description?.trim(),
      start_date: data.start_date,
      end_date: data.end_date,
      status: data.status,
    })
    .eq("id", projectId)
    .select()
    .single()

  if (error) throw error

  return project
}

/**
 * Delete a project
 */
export async function deleteProject(projectId: string) {
  const supabase = createClient()

  const { error } = await supabase.from("projects").delete().eq("id", projectId)

  if (error) throw error
}
