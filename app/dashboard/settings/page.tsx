import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { WorkspaceSettingsView } from "@/components/workspace/workspace-settings-view"

export default async function SettingsPage({
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

  if (!workspaceId) {
    return <div className="p-8">Please select a workspace to manage settings.</div>
  }

  // Fetch members
  const { data: members } = await supabase
    .from("workspace_members")
    .select(`
      id,
      role,
      user_id,
      profiles:user_id (
        full_name,
        email,
        avatar_url
      )
    `)
    .eq("workspace_id", workspaceId)

  // Transform members data to match expected type
  const formattedMembers = members?.map((member: any) => ({
    ...member,
    profiles: Array.isArray(member.profiles) ? member.profiles[0] : member.profiles
  })) || []

  return (
    <WorkspaceSettingsView 
      workspaceId={workspaceId} 
      initialMembers={formattedMembers} 
    />
  )
}
