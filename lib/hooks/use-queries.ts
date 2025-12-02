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
      // 1. Fetch workspace members
      const { data: members, error: membersError } = await supabase
        .from("workspace_members")
        .select("id, role, user_id")
        .eq("workspace_id", workspaceId)

      if (membersError) throw membersError
      if (!members || members.length === 0) return []

      // 2. Fetch profiles for these members
      const userIds = members.map(m => m.user_id)
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, email, avatar_url")
        .in("id", userIds)

      if (profilesError) throw profilesError

      // 3. Merge data
      const profilesMap = new Map(profiles?.map(p => [p.id, p]))
      
      return members.map(m => ({
        ...m,
        profiles: profilesMap.get(m.user_id) || {
          full_name: "Unknown",
          email: "",
          avatar_url: ""
        }
      }))
    },
    enabled: !!workspaceId,
  })
}

export function useWorkspaceAnalytics(workspaceId: string) {
  const supabase = createClient()
  
  return useQuery({
    queryKey: ["workspace-analytics", workspaceId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      // Fetch all required data in parallel
      const [
        { count: totalTasks },
        { count: completedTasks },
        { count: overdueTasks },
        { count: membersCount },
        { data: tasks },
        { data: projects },
        { data: members }
      ] = await Promise.all([
        // Total tasks
        supabase.from("tasks")
          .select("*", { count: "exact", head: true })
          .eq("workspace_id", workspaceId),
        
        // Completed tasks
        supabase.from("tasks")
          .select("*", { count: "exact", head: true })
          .eq("workspace_id", workspaceId)
          .eq("status", "done"), // Assuming 'done' is the status for completed tasks
          
        // Overdue tasks (simplified check for now)
        supabase.from("tasks")
          .select("*", { count: "exact", head: true })
          .eq("workspace_id", workspaceId)
          .lt("due_date", new Date().toISOString())
          .neq("status", "done"),

        // Members count
        supabase.from("workspace_members")
          .select("*", { count: "exact", head: true })
          .eq("workspace_id", workspaceId),

        // Tasks for detailed stats
        supabase.from("tasks")
          .select("status, assignee_id")
          .eq("workspace_id", workspaceId),

        // Projects for detailed stats
        supabase.from("projects")
          .select("status")
          .eq("workspace_id", workspaceId),

        // Members for detailed stats
        supabase.from("workspace_members")
          .select("role")
          .eq("workspace_id", workspaceId)
      ])

      // Calculate derived stats
      const tasksByStatus = tasks?.reduce((acc: any, task) => {
        acc[task.status] = (acc[task.status] || 0) + 1
        return acc
      }, {}) || {}

      const projectsByStatus = projects?.reduce((acc: any, project) => {
        acc[project.status] = (acc[project.status] || 0) + 1
        return acc
      }, {}) || {}

      const membersByRole = members?.reduce((acc: any, member) => {
        acc[member.role] = (acc[member.role] || 0) + 1
        return acc
      }, {}) || {}

      return {
        totalTasks: totalTasks || 0,
        completedTasks: completedTasks || 0,
        overdueTasks: overdueTasks || 0,
        membersCount: membersCount || 0,
        tasks: {
          total: totalTasks || 0,
          completed: completedTasks || 0,
          overdue: overdueTasks || 0,
          assigned: tasks?.filter(t => t.assignee_id).length || 0,
          inProgress: 0, // Placeholder
          onHold: 0, // Placeholder
          paused: 0, // Placeholder
          byStatus: [] // Placeholder
        },
        projects: {
          total: projects?.length || 0,
          active: (projects?.length || 0) - (projectsByStatus["completed"] || 0),
          completed: projectsByStatus["completed"] || 0,
          withTasks: 0 // Placeholder
        },
        members: {
          total: membersCount || 0,
          active: membersCount || 0,
          admins: (membersByRole["admin"] || 0) + (membersByRole["owner"] || 0),
          regular: (membersCount || 0) - ((membersByRole["admin"] || 0) + (membersByRole["owner"] || 0))
        },
        trends: []
      }
    },
    enabled: !!workspaceId,
  })
}
