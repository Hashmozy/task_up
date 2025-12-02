import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { WorkspaceProjects } from "@/components/workspace/workspace-projects"
import { getWorkspaceProjectStats } from "@/lib/workspace-analytics"

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ workspace?: string }>
}) {
  const { workspace: workspaceId } = await searchParams
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // If no workspace specified, get the first workspace
  let selectedWorkspaceId = workspaceId

  if (!selectedWorkspaceId) {
    const { data: workspaces } = await supabase
      .from("workspaces")
      .select("id")
      .or(`owner_id.eq.${user.id},id.in.(select workspace_id from workspace_members where user_id.eq.${user.id})`)
      .order("created_at", { ascending: false })
      .limit(1)

    if (workspaces && workspaces.length > 0) {
      selectedWorkspaceId = workspaces[0].id
    } else {
      redirect("/dashboard")
    }
  }

  // Get workspace and membership in parallel
  const [
    { data: workspace, error: workspaceError },
    { data: membership }
  ] = await Promise.all([
    supabase.from("workspaces").select("*").eq("id", selectedWorkspaceId as string).single(),
    supabase.from("workspace_members").select("role").eq("workspace_id", selectedWorkspaceId as string).eq("user_id", user.id).single()
  ])

  if (!membership) {
    redirect("/dashboard")
  }

  const isAdmin = membership.role === "owner" || membership.role === "admin"

  // Fetch project stats
  const projectStats = await getWorkspaceProjectStats(selectedWorkspaceId as string)

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-border px-8 py-6 bg-background">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground mt-1">
            Manage all projects in {workspace.name}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <WorkspaceProjects 
            projects={projectStats} 
            workspaceId={selectedWorkspaceId as string} 
            isAdmin={isAdmin} 
          />
        </div>
      </div>
    </div>
  )
}
