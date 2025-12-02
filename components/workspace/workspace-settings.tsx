"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { Loader2, Trash2, Save, AlertTriangle } from "lucide-react"
import { toast } from "sonner"

interface WorkspaceSettingsProps {
  workspace: {
    id: string
    name: string
    description: string | null
    owner_id: string
  }
  isOwner: boolean
}

export function WorkspaceSettings({ workspace, isOwner }: WorkspaceSettingsProps) {
  const [name, setName] = useState(workspace.name)
  const [description, setDescription] = useState(workspace.description || "")
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error("Workspace name is required")
      return
    }

    setIsSaving(true)
    try {
      const { error } = await supabase
        .from("workspaces")
        .update({
          name: name.trim(),
          description: description.trim() || null,
        })
        .eq("id", workspace.id)

      if (error) throw error

      toast.success("Workspace updated successfully")
      router.refresh()
    } catch (err) {
      toast.error("Failed to update workspace")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    const confirmText = "DELETE"
    const userInput = prompt(
      `⚠️ WARNING: This action cannot be undone!\n\nDeleting this workspace will permanently remove:\n• All projects\n• All tasks\n• All members\n• All data associated with this workspace\n\nType "${confirmText}" to confirm deletion:`
    )

    if (userInput !== confirmText) {
      if (userInput !== null) {
        toast.error("Deletion cancelled - confirmation text did not match")
      }
      return
    }

    setIsDeleting(true)
    try {
      const { error } = await supabase.from("workspaces").delete().eq("id", workspace.id)

      if (error) throw error

      toast.success("Workspace deleted successfully")
      router.push("/dashboard")
      router.refresh()
    } catch (err) {
      toast.error("Failed to delete workspace")
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>Update your workspace name and description</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Workspace Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Workspace"
                disabled={!isOwner || isSaving}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this workspace for?"
                rows={4}
                disabled={!isOwner || isSaving}
              />
            </div>

            {isOwner && (
              <div className="flex justify-end">
                <Button type="submit" disabled={isSaving}>
                  {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            )}

            {!isOwner && (
              <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                Only the workspace owner can modify these settings.
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      {isOwner && (
        <Card className="border-destructive/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
            </div>
            <CardDescription>Irreversible and destructive actions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <h4 className="font-semibold text-destructive mb-2">Delete Workspace</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Once you delete a workspace, there is no going back. This will permanently delete:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 mb-4 ml-4 list-disc">
                <li>All projects in this workspace</li>
                <li>All tasks and task data</li>
                <li>All workspace members and permissions</li>
                <li>All associated data and settings</li>
              </ul>
              <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                {isDeleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Workspace Permanently
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
