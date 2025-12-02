"use client"

import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"

export function useWorkspaces() {
  const supabase = createClient()
  
  return useQuery({
    queryKey: ["workspaces"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const { data, error } = await supabase
        .from("workspaces")
        .select("*")
        .or(`owner_id.eq.${user.id},id.in.(select workspace_id from workspace_members where user_id.eq.${user.id})`)
        .order("created_at", { ascending: false })

      if (error) throw error
      return data || []
    },
  })
}

export function useWorkspace(id: string) {
  const supabase = createClient()
  
  return useQuery({
    queryKey: ["workspace", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workspaces")
        .select("*")
        .eq("id", id)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!id,
  })
}

export function useProjects(workspaceId: string) {
  const supabase = createClient()
  
  return useQuery({
    queryKey: ["projects", workspaceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false })

      if (error) throw error
      return data || []
    },
    enabled: !!workspaceId,
  })
}

export function useTasks(workspaceId?: string) {
  const supabase = createClient()
  
  return useQuery({
    queryKey: ["tasks", workspaceId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      let query = supabase
        .from("tasks")
        .select("*, project:projects(id, name), status:task_statuses(id, name, color)")

      if (workspaceId) {
        const { data: projects } = await supabase
          .from("projects")
          .select("id")
          .eq("workspace_id", workspaceId)
        
        const projectIds = projects?.map(p => p.id) || []
        query = query.in("project_id", projectIds)
      } else {
        query = query.eq("assigned_to", user.id)
      }

      const { data, error } = await query.order("due_date", { ascending: true })

      if (error) throw error
      return data || []
    },
  })
}

export function useWorkspaceMembers(workspaceId: string) {
  const supabase = createClient()
  
  return useQuery({
    queryKey: ["workspace-members", workspaceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workspace_members")
        .select(`
          id,
          role,
          user_id,
          profiles:user_id (
            full_name,
            email,
            avatar_url
          )
        `)
        .eq("workspace_id", workspaceId)

      if (error) throw error
      
      return data?.map((m: any) => ({
        ...m,
        profiles: Array.isArray(m.profiles) ? m.profiles[0] : m.profiles,
      })) || []
    },
    enabled: !!workspaceId,
  })
}
