"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Trash2, UserPlus, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface Member {
  id: string
  role: string
  user_id: string
  profiles: {
    full_name: string
    email: string
    avatar_url: string
  }
}

export default function SettingsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const workspaceId = searchParams.get("workspace")
  const [members, setMembers] = useState<Member[]>([])
  const [inviteEmail, setInviteEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    if (workspaceId) {
      fetchMembers()
    }
  }, [workspaceId])

  const fetchMembers = async () => {
    const { data, error } = await supabase
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

    if (data) {
      // @ts-ignore - Supabase types are tricky with joins
      setMembers(data)
    }
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail.trim()) return

    setIsLoading(true)
    try {
      const { data, error } = await supabase.rpc("invite_user_to_workspace", {
        email_to_invite: inviteEmail,
        workspace_id_to_join: workspaceId,
      })

      if (error) throw error
      if (!data.success) throw new Error(data.message)

      toast.success("User added to workspace")
      setInviteEmail("")
      fetchMembers()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to invite user")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteWorkspace = async () => {
    if (!confirm("Are you sure? This action cannot be undone.")) return

    setIsDeleting(true)
    try {
      const { error } = await supabase
        .from("workspaces")
        .delete()
        .eq("id", workspaceId)

      if (error) throw error

      toast.success("Workspace deleted")
      router.push("/dashboard")
      router.refresh()
    } catch (err) {
      toast.error("Failed to delete workspace")
      setIsDeleting(false)
    }
  }

  if (!workspaceId) {
    return <div className="p-8">Please select a workspace to manage settings.</div>
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Workspace Settings</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Members</CardTitle>
          <CardDescription>Manage who has access to this workspace</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleInvite} className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="email" className="sr-only">
                Email address
              </Label>
              <Input
                id="email"
                placeholder="colleague@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                type="email"
              />
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4 mr-2" />}
              Invite
            </Button>
          </form>

          <div className="space-y-4">
            {members.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={member.profiles?.avatar_url} />
                    <AvatarFallback>{member.profiles?.full_name?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{member.profiles?.full_name || "Unknown User"}</p>
                    <p className="text-sm text-muted-foreground">{member.profiles?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground capitalize">{member.role}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>Irreversible actions</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={handleDeleteWorkspace} disabled={isDeleting}>
            {isDeleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Workspace
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
