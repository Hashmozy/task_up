import { createClient } from "@/lib/supabase/server"
import { GlobalDashboard } from "@/components/dashboard/global-dashboard"
import { getGlobalAnalytics } from "@/lib/workspace-analytics"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const analytics = await getGlobalAnalytics()

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Overview of all your workspaces and projects
        </p>
      </div>

      <GlobalDashboard analytics={analytics} />
    </div>
  )
}
