"use client"

import { useSearchParams } from "next/navigation"
import { useProjects } from "@/lib/hooks/use-queries"
import { WorkspaceProjects } from "@/components/workspace/workspace-projects"

export default function ProjectsPage() {
  const searchParams = useSearchParams()
  const workspaceId = searchParams.get("workspace") || ""
  
  const { data: projects = [], isLoading, error } = useProjects(workspaceId)

  if (!workspaceId) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Please select a workspace</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-destructive">Error loading projects</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-border px-8 py-6 bg-background">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground mt-1">
            Manage all your projects
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <WorkspaceProjects 
            projects={projects.map((p: any) => ({
              ...p,
              totalTasks: 0,
              completedTasks: 0,
              inProgressTasks: 0,
              progress: 0,
              lastUpdated: p.updated_at || p.created_at
            }))} 
            workspaceId={workspaceId} 
            isAdmin={true} 
          />
        </div>
      </div>
    </div>
  )
}
