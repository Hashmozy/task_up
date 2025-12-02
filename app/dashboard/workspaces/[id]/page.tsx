import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { TabsContent } from "@/components/ui/tabs"
import { WorkspaceTabs } from "@/components/workspace/workspace-tabs"
import { WorkspaceOverview } from "@/components/workspace/workspace-overview"
import { WorkspaceMembers } from "@/components/workspace/workspace-members"
import { WorkspaceProjects } from "@/components/workspace/workspace-projects"
import { WorkspaceSettings } from "@/components/workspace/workspace-settings"
import { TasksView } from "@/components/tasks/tasks-view"
import { getWorkspaceAnalytics, getWorkspaceProjectStats } from "@/lib/workspace-analytics"

export default async function WorkspacePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ tab?: string }>
}) {
  const { id } = await params
  const { tab } = await searchParams
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Parallelize initial checks
  const [
    { data: workspace, error: workspaceError },
    { data: membership }
  ] = await Promise.all([
    supabase.from("workspaces").select("*").eq("id", id).single(),
    supabase.from("workspace_members").select("role").eq("workspace_id", id).eq("user_id", user.id).single()
  ])

  if (workspaceError || !workspace || !membership) {
    redirect("/dashboard")
  }

  const isAdmin = membership.role === "owner" || membership.role === "admin"
  const isOwner = membership.role === "owner"

  // Parallelize remaining data fetching
  const [
    analytics,
    projectStats,
    { data: membersData },
    { data: projects }
  ] = await Promise.all([
    getWorkspaceAnalytics(id),
    getWorkspaceProjectStats(id),
    supabase.from("workspace_members").select(`
      id,
      role,
      user_id,
      profiles:user_id (
        full_name,
        email,
        avatar_url
      )
    `).eq("workspace_id", id),
    supabase.from("projects").select("id").eq("workspace_id", id)
  ])

  // Transform the data to match the expected type
  const members = membersData?.map((m: any) => ({
    id: m.id,
    role: m.role,
    user_id: m.user_id,
    profiles: Array.isArray(m.profiles) ? m.profiles[0] : m.profiles,
  })) || []

  // Fetch tasks separately as it depends on projects
  const projectIds = projects?.map((p) => p.id) || []
  const { data: tasks } = await supabase
    .from("tasks")
    .select("*, project:projects(id, name), status:task_statuses(id, name, color)")
    .in("project_id", projectIds)
    .order("due_date", { ascending: true })

  const activeTab = tab || "overview"

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

      {/* Tabs */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <WorkspaceTabs workspaceId={id} activeTab={activeTab}>
            <TabsContent value="overview" className="space-y-6">
              <WorkspaceOverview analytics={analytics} />
            </TabsContent>

            <TabsContent value="projects" className="space-y-6">
              <WorkspaceProjects projects={projectStats} workspaceId={id} isAdmin={isAdmin} />
            </TabsContent>

            <TabsContent value="tasks" className="space-y-6">
              <div className="bg-card rounded-lg border shadow-sm">
                <div className="p-4 border-b">
                  <h3 className="text-lg font-semibold">Workspace Tasks</h3>
                  <p className="text-sm text-muted-foreground">Manage all tasks across projects in this workspace</p>
                </div>
                <div className="h-[600px]">
                  <TasksView tasks={tasks || []} viewType="kanban" />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="members" className="space-y-6">
              <WorkspaceMembers
                workspaceId={id}
                initialMembers={members || []}
                currentUserId={user.id}
                isAdmin={isAdmin}
              />
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <WorkspaceSettings workspace={workspace} isOwner={isOwner} />
            </TabsContent>
          </WorkspaceTabs>
        </div>
      </div>
    </div>
  )
}
