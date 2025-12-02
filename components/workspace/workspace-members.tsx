"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { UserPlus, Loader2, Trash2, Search, Shield, User, Crown } from "lucide-react"
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

interface WorkspaceMembersProps {
  workspaceId: string
  initialMembers: Member[]
  currentUserId: string
  isAdmin: boolean
}

export function WorkspaceMembers({ workspaceId, initialMembers, currentUserId, isAdmin }: WorkspaceMembersProps) {
  const [members, setMembers] = useState<Member[]>(initialMembers)
  const [inviteEmail, setInviteEmail] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [isInviting, setIsInviting] = useState(false)
  const supabase = createClient()

  const filteredMembers = members.filter((member) => {
    const query = searchQuery.toLowerCase()
    return (
      member.profiles?.full_name?.toLowerCase().includes(query) ||
      member.profiles?.email?.toLowerCase().includes(query) ||
      member.role.toLowerCase().includes(query)
    )
  })

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail.trim()) return

    setIsInviting(true)
    try {
      const { data, error } = await supabase.rpc("invite_user_to_workspace", {
        email_to_invite: inviteEmail,
        workspace_id_to_join: workspaceId,
      })

      if (error) throw error
      if (!data.success) throw new Error(data.message)

      toast.success("User invited successfully")
      setInviteEmail("")
      
      // Refresh members list
      await fetchMembers()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to invite user")
    } finally {
      setIsInviting(false)
    }
  }

  const fetchMembers = async () => {
    const { data } = await supabase
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
      // @ts-ignore
      setMembers(data)
    }
  }

  const handleRoleChange = async (memberId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from("workspace_members")
        .update({ role: newRole })
        .eq("id", memberId)

      if (error) throw error

      toast.success("Role updated successfully")
      await fetchMembers()
    } catch (err) {
      toast.error("Failed to update role")
    }
  }

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (!confirm(`Remove ${memberName} from this workspace?`)) return

    try {
      const { error } = await supabase
        .from("workspace_members")
        .delete()
        .eq("id", memberId)

      if (error) throw error

      toast.success("Member removed successfully")
      await fetchMembers()
    } catch (err) {
      toast.error("Failed to remove member")
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner":
        return <Crown className="w-4 h-4 text-amber-600" />
      case "admin":
        return <Shield className="w-4 h-4 text-blue-600" />
      default:
        return <User className="w-4 h-4 text-gray-600" />
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "owner":
        return "bg-amber-100 text-amber-800 border-amber-200"
      case "admin":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="space-y-6">
      {/* Invite Section */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Invite Members</CardTitle>
            <CardDescription>Add new members to your workspace by email</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleInvite} className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="email" className="sr-only">
                  Email address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="colleague@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  disabled={isInviting}
                />
              </div>
              <Button type="submit" disabled={isInviting}>
                {isInviting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Invite
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Members List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Members ({members.length})</CardTitle>
              <CardDescription>Manage workspace members and their roles</CardDescription>
            </div>
          </div>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredMembers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchQuery ? "No members found matching your search" : "No members yet"}
              </div>
            ) : (
              filteredMembers.map((member) => {
                const isCurrentUser = member.user_id === currentUserId
                const canManage = isAdmin && !isCurrentUser && member.role !== "owner"

                return (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={member.profiles?.avatar_url} />
                        <AvatarFallback className="text-lg">
                          {member.profiles?.full_name?.[0] || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">
                            {member.profiles?.full_name || "Unknown User"}
                            {isCurrentUser && (
                              <span className="text-xs text-muted-foreground ml-2">(You)</span>
                            )}
                          </p>
                        </div>
                        <p className="text-sm text-muted-foreground">{member.profiles?.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {canManage ? (
                        <Select
                          value={member.role}
                          onValueChange={(value) => handleRoleChange(member.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="member">Member</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md border ${getRoleBadgeColor(member.role)}`}>
                          {getRoleIcon(member.role)}
                          <span className="text-sm font-medium capitalize">{member.role}</span>
                        </div>
                      )}

                      {canManage && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveMember(member.id, member.profiles?.full_name)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
