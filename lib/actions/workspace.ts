import { createClient } from "@/lib/supabase/client"
import { getCurrentUser } from "./auth"

export interface CreateWorkspaceData {
  name: string
  description?: string
}

export interface UpdateWorkspaceData {
  name?: string
  description?: string
}

/**
 * Create a new workspace
 */
export async function createWorkspace(data: CreateWorkspaceData) {
  const supabase = createClient()
  const user = await getCurrentUser()

  if (!user) {
    throw new Error("You must be logged in to create a workspace")
  }

  const { data: workspace, error } = await supabase
    .from("workspaces")
    .insert({
      name: data.name.trim(),
      description: data.description?.trim() || null,
      owner_id: user.id,
    })
    .select()
    .single()

  if (error) throw error

  return workspace
}

/**
 * Get all workspaces for the current user
 */
export async function getUserWorkspaces() {
  const supabase = createClient()
  const user = await getCurrentUser()

  if (!user) {
    throw new Error("You must be logged in to view workspaces")
  }

  const { data: workspaces, error } = await supabase
    .from("workspaces")
    .select("*")
    .or(`owner_id.eq.${user.id},id.in.(select workspace_id from workspace_members where user_id.eq.${user.id})`)
    .order("created_at", { ascending: false })

  if (error) throw error

  return workspaces
}

/**
 * Update a workspace
 */
export async function updateWorkspace(workspaceId: string, data: UpdateWorkspaceData) {
  const supabase = createClient()

  const { data: workspace, error } = await supabase
    .from("workspaces")
    .update({
      name: data.name?.trim(),
      description: data.description?.trim(),
    })
    .eq("id", workspaceId)
    .select()
    .single()

  if (error) throw error

  return workspace
}

/**
 * Delete a workspace
 */
export async function deleteWorkspace(workspaceId: string) {
  const supabase = createClient()

  const { error } = await supabase.from("workspaces").delete().eq("id", workspaceId)

  if (error) throw error
}

/**
 * Invite a user to a workspace by email
 */
export async function inviteUserToWorkspace(email: string, workspaceId: string) {
  const supabase = createClient()

  const { data, error } = await supabase.rpc("invite_user_to_workspace", {
    email_to_invite: email,
    workspace_id_to_join: workspaceId,
  })

  if (error) throw error
  if (!data.success) throw new Error(data.message)

  return data
}
