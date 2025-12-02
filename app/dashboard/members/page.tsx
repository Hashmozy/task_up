"use client"

import { useSearchParams } from "next/navigation"
import { useWorkspaceMembers } from "@/lib/hooks/use-queries"
import { WorkspaceMembers } from "@/components/workspace/workspace-members"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"

export default function MembersPage() {
  const searchParams = useSearchParams()
  const workspaceId = searchParams.get("workspace")
  const [user, setUser] = useState<any>(null)
  const supabase = createClient()

  const { data: members = [], isLoading } = useWorkspaceMembers(workspaceId || "")

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })
  }, [supabase])

  if (!workspaceId) {
    return <div className="p-8">Please select a workspace to view members.</div>
  }

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-border px-8 py-6 bg-background">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold">Members</h1>
          <p className="text-muted-foreground mt-1">
            Manage workspace members and permissions
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <WorkspaceMembers
            workspaceId={workspaceId}
            initialMembers={members}
            currentUserId={user.id}
            isAdmin={true} // TODO: Check actual role
          />
        </div>
      </div>
    </div>
  )
}
