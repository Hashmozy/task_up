import { createClient } from "@/lib/supabase/server"
import { subDays, format } from "date-fns"

export interface WorkspaceAnalytics {
  tasks: {
    total: number
    completed: number
    inProgress: number
    onHold: number
    paused: number
    byStatus: { name: string; count: number; color: string }[]
  }
  projects: {
    total: number
    active: number
    withTasks: number
  }
  members: {
    total: number
    admins: number
    regular: number
  }
  trends: {
    date: string
    completed: number
    created: number
  }[]
}

export interface GlobalAnalytics {
  totalWorkspaces: number
  totalProjects: number
  totalTasks: number
  totalMembers: number
  workspaces: {
    id: string
    name: string
    description: string | null
    projectCount: number
    taskCount: number
    memberCount: number
  }[]
}

export interface ProjectStats {
  id: string
  name: string
  description: string | null
  totalTasks: number
  completedTasks: number
  inProgressTasks: number
  progress: number
  lastUpdated: string
}

export async function getWorkspaceAnalytics(
  workspaceId: string,
  days: number = 30
): Promise<WorkspaceAnalytics> {
  const supabase = await createClient()

  // Get all task statuses for this workspace
  const { data: statuses } = await supabase
    .from("task_statuses")
    .select("*")
    .eq("workspace_id", workspaceId)

  // Get all tasks in this workspace (through projects)
  const { data: projects } = await supabase
    .from("projects")
    .select("id")
    .eq("workspace_id", workspaceId)

  const projectIds = projects?.map((p) => p.id) || []

  const { data: tasks } = await supabase
    .from("tasks")
    .select("*, status:task_statuses(name, color)")
    .in("project_id", projectIds)

  // Get workspace members
  const { data: members } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", workspaceId)

  // Calculate task statistics
  const tasksByStatus: Record<string, number> = {}
  let completed = 0
  let inProgress = 0
  let onHold = 0
  let paused = 0

  tasks?.forEach((task) => {
    const statusName = task.status?.name?.toLowerCase() || "unknown"
    tasksByStatus[statusName] = (tasksByStatus[statusName] || 0) + 1

    if (statusName.includes("complete") || statusName.includes("done")) {
      completed++
    } else if (statusName.includes("progress") || statusName.includes("doing")) {
      inProgress++
    } else if (statusName.includes("hold")) {
      onHold++
    } else if (statusName.includes("pause")) {
      paused++
    }
  })

  // Build status breakdown
  const byStatus = statuses?.map((status) => ({
    name: status.name,
    count: tasksByStatus[status.name.toLowerCase()] || 0,
    color: status.color || "#888888",
  })) || []

  // Calculate trends (tasks created/completed over time)
  const trends: { date: string; completed: number; created: number }[] = []
  const startDate = subDays(new Date(), days)

  for (let i = 0; i < days; i++) {
    const date = subDays(new Date(), days - i - 1)
    const dateStr = format(date, "yyyy-MM-dd")

    const createdCount = tasks?.filter((t) => {
      const createdDate = format(new Date(t.created_at), "yyyy-MM-dd")
      return createdDate === dateStr
    }).length || 0

    const completedCount = tasks?.filter((t) => {
      const statusName = t.status?.name?.toLowerCase() || ""
      const updatedDate = t.updated_at ? format(new Date(t.updated_at), "yyyy-MM-dd") : null
      return (
        (statusName.includes("complete") || statusName.includes("done")) &&
        updatedDate === dateStr
      )
    }).length || 0

    trends.push({
      date: format(date, "MMM dd"),
      completed: completedCount,
      created: createdCount,
    })
  }

  // Calculate member statistics
  const adminCount = members?.filter((m) => m.role === "owner" || m.role === "admin").length || 0

  return {
    tasks: {
      total: tasks?.length || 0,
      completed,
      inProgress,
      onHold,
      paused,
      byStatus,
    },
    projects: {
      total: projects?.length || 0,
      active: projects?.length || 0,
      withTasks: projectIds.length,
    },
    members: {
      total: members?.length || 0,
      admins: adminCount,
      regular: (members?.length || 0) - adminCount,
    },
    trends,
  }
}

export async function getGlobalAnalytics(): Promise<GlobalAnalytics> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      totalWorkspaces: 0,
      totalProjects: 0,
      totalTasks: 0,
      totalMembers: 0,
      workspaces: [],
    }
  }

  // Get all workspaces user is a member of
  const { data: members } = await supabase
    .from("workspace_members")
    .select("workspace_id")
    .eq("user_id", user.id)

  const workspaceIds = members?.map((m) => m.workspace_id) || []

  if (workspaceIds.length === 0) {
    return {
      totalWorkspaces: 0,
      totalProjects: 0,
      totalTasks: 0,
      totalMembers: 0,
      workspaces: [],
    }
  }

  const { data: workspaces } = await supabase
    .from("workspaces")
    .select("*")
    .in("id", workspaceIds)

  const { data: projects } = await supabase
    .from("projects")
    .select("id, workspace_id")
    .in("workspace_id", workspaceIds)

  const { data: tasks } = await supabase
    .from("tasks")
    .select("id, project_id")
    .in("project_id", projects?.map((p) => p.id) || [])

  const { data: allMembers } = await supabase
    .from("workspace_members")
    .select("workspace_id")
    .in("workspace_id", workspaceIds)

  const workspaceStats = workspaces?.map((ws) => {
    const wsProjects = projects?.filter((p) => p.workspace_id === ws.id) || []
    const wsProjectIds = wsProjects.map((p) => p.id)
    const wsTasks = tasks?.filter((t) => wsProjectIds.includes(t.project_id)) || []
    const wsMembers = allMembers?.filter((m) => m.workspace_id === ws.id) || []

    return {
      id: ws.id,
      name: ws.name,
      description: ws.description,
      projectCount: wsProjects.length,
      taskCount: wsTasks.length,
      memberCount: wsMembers.length,
    }
  }) || []

  return {
    totalWorkspaces: workspaces?.length || 0,
    totalProjects: projects?.length || 0,
    totalTasks: tasks?.length || 0,
    totalMembers: allMembers?.length || 0, // This is a sum of members in all workspaces, so duplicates are possible if a user is in multiple workspaces. This is acceptable for "total seats" view.
    workspaces: workspaceStats,
  }
}

export async function getWorkspaceProjectStats(workspaceId: string): Promise<ProjectStats[]> {
  const supabase = await createClient()

  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })

  if (!projects) return []

  const projectStats: ProjectStats[] = []

  for (const project of projects) {
    const { data: tasks } = await supabase
      .from("tasks")
      .select("*, status:task_statuses(name)")
      .eq("project_id", project.id)

    const totalTasks = tasks?.length || 0
    const completedTasks = tasks?.filter((t) => {
      const statusName = t.status?.name?.toLowerCase() || ""
      return statusName.includes("complete") || statusName.includes("done")
    }).length || 0

    const inProgressTasks = tasks?.filter((t) => {
      const statusName = t.status?.name?.toLowerCase() || ""
      return statusName.includes("progress") || statusName.includes("doing")
    }).length || 0

    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    projectStats.push({
      id: project.id,
      name: project.name,
      description: project.description,
      totalTasks,
      completedTasks,
      inProgressTasks,
      progress,
      lastUpdated: project.updated_at || project.created_at,
    })
  }

  return projectStats
}
