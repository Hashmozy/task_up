"use client"

import type React from "react"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/dashboard/sidebar"
import { TopNav } from "@/components/dashboard/top-nav"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { useWorkspaces } from "@/lib/hooks/use-queries"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<any>(null)
  const supabase = createClient()
  const { data: workspaces = [], isLoading } = useWorkspaces()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user }, error }) => {
      if (error || !user) {
        redirect("/auth/login")
      }
      setUser(user)
    })
  }, [supabase])

  if (!user || isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <Sidebar workspaces={workspaces || []} />
      <SidebarInset>
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <TopNav user={user} />
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
