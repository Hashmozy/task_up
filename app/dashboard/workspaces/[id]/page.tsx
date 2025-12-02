"use client"

import { WorkspaceOverview } from "@/components/workspace/workspace-overview"
import { useWorkspace, useWorkspaceAnalytics } from "@/lib/hooks/use-queries"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"

export default function WorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const [id, setId] = useState<string>("")

  const [user, setUser] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    params.then((p) => setId(p.id))
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })
  }, [params, supabase])

  const { data: workspace, isLoading: isLoadingWorkspace } = useWorkspace(id)
  const { data: analytics } = useWorkspaceAnalytics(id)

  if (isLoadingWorkspace || !user || !id) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!workspace) {
    return <div>Workspace not found</div>
  }

  const defaultAnalytics = {
    totalTasks: 0,
    completedTasks: 0,
    overdueTasks: 0,
    membersCount: 0,
    tasks: { 
      total: 0, 
      completed: 0, 
      overdue: 0, 
      assigned: 0,
      inProgress: 0,
      onHold: 0,
      paused: 0,
      byStatus: []
    },
    projects: { 
      total: 0, 
      active: 0, 
      completed: 0,
      withTasks: 0
    },
    members: { 
      total: 0, 
      active: 0, 
      admins: 0,
      regular: 0
    },
    trends: []
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="border-b border-border px-8 py-6 bg-background">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold">{workspace.name}</h1>
          <p className="text-muted-foreground mt-1">
            {workspace.description || "Manage your workspace settings, members, and projects"}
          </p>
        </div>
      </div>

      {/* Overview Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <WorkspaceOverview analytics={analytics || defaultAnalytics} />
        </div>
      </div>
    </div>
  )
}
