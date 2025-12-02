"use client"

import { useSearchParams } from "next/navigation"
import { useWorkspace, useWorkspaceMembers } from "@/lib/hooks/use-queries"
import { WorkspaceSettingsView } from "@/components/workspace/workspace-settings-view"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"

export default function SettingsPage() {
  const searchParams = useSearchParams()
  const workspaceId = searchParams.get("workspace")
  const [user, setUser] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })
  }, [supabase])

  const { data: members = [], isLoading: isLoadingMembers } = useWorkspaceMembers(workspaceId || "")
  const { data: workspace, isLoading: isLoadingWorkspace } = useWorkspace(workspaceId || "")

  if (!workspaceId) {
    return <div className="p-8">Please select a workspace to manage settings.</div>
  }

  if (isLoadingMembers || isLoadingWorkspace || !user) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!workspace) {
    return <div className="p-8">Workspace not found</div>
  }

  // Determine if user is owner
  const isOwner = members.find(m => m.user_id === user.id)?.role === "owner"

  return (
    <WorkspaceSettingsView 
      workspace={workspace}
      initialMembers={members} 
      isOwner={isOwner || false}
    />
  )
}
