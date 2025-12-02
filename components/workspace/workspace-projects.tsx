"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ProjectStats } from "@/lib/workspace-analytics"
import { FolderKanban, Plus, Trash2, ExternalLink, Calendar } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

interface WorkspaceProjectsProps {
  projects: ProjectStats[]
  workspaceId: string
  isAdmin: boolean
}

export function WorkspaceProjects({ projects: initialProjects, workspaceId, isAdmin }: WorkspaceProjectsProps) {
  const [projects, setProjects] = useState<ProjectStats[]>(initialProjects)
  const router = useRouter()
  const supabase = createClient()

  const handleDeleteProject = async (projectId: string, projectName: string) => {
    if (!confirm(`Delete project "${projectName}"? This will also delete all tasks in this project.`)) return

    try {
      const { error } = await supabase.from("projects").delete().eq("id", projectId)

      if (error) throw error

      toast.success("Project deleted successfully")
      setProjects(projects.filter((p) => p.id !== projectId))
    } catch (err) {
      toast.error("Failed to delete project")
    }
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "bg-green-600"
    if (progress >= 50) return "bg-blue-600"
    if (progress >= 25) return "bg-amber-600"
    return "bg-gray-400"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Projects ({projects.length})</h3>
          <p className="text-sm text-muted-foreground">Manage all projects in this workspace</p>
        </div>
        {isAdmin && (
          <Button onClick={() => router.push(`/dashboard/projects/new?workspace=${workspaceId}`)}>
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        )}
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FolderKanban className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              No projects yet. Create your first project to get started.
            </p>
            {isAdmin && (
              <Button
                className="mt-4"
                onClick={() => router.push(`/dashboard/projects/new?workspace=${workspaceId}`)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Project
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card key={project.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-1">{project.name}</CardTitle>
                    {project.description && (
                      <CardDescription className="line-clamp-2 mt-1">{project.description}</CardDescription>
                    )}
                  </div>
                  <FolderKanban className="w-5 h-5 text-muted-foreground flex-shrink-0 ml-2" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                </div>

                {/* Task Stats */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <p className="text-xs text-muted-foreground">Total</p>
                    <p className="text-lg font-bold text-blue-600">{project.totalTasks}</p>
                  </div>
                  <div className="p-2 bg-green-50 rounded-lg">
                    <p className="text-xs text-muted-foreground">Done</p>
                    <p className="text-lg font-bold text-green-600">{project.completedTasks}</p>
                  </div>
                  <div className="p-2 bg-amber-50 rounded-lg">
                    <p className="text-xs text-muted-foreground">Active</p>
                    <p className="text-lg font-bold text-amber-600">{project.inProgressTasks}</p>
                  </div>
                </div>

                {/* Last Updated */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
                  <Calendar className="w-3 h-3" />
                  <span>Updated {formatDistanceToNow(new Date(project.lastUpdated), { addSuffix: true })}</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => router.push(`/dashboard/projects/${project.id}`)}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open
                  </Button>
                  {isAdmin && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteProject(project.id, project.name)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
