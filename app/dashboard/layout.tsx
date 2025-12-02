import type React from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Sidebar } from "@/components/dashboard/sidebar"
import { TopNav } from "@/components/dashboard/top-nav"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()

  if (error || !data?.user) {
    redirect("/auth/login")
  }

  const { data: workspaces } = await supabase.from("workspaces").select("*")

  return (
    <SidebarProvider>
      <Sidebar workspaces={workspaces || []} />
      <SidebarInset>
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <TopNav user={data.user} />
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
