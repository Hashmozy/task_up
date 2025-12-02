"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createWorkspace } from "@/lib/actions/workspace"
import { useFormState } from "@/lib/hooks/use-form-state"
import { Loader2 } from "lucide-react"

export function WorkspaceForm() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const { isLoading, error, setError, handleSubmit } = useFormState()

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      setError("Workspace name is required")
      return
    }

    await handleSubmit(async () => {
      await createWorkspace({ name, description })
      router.push("/dashboard")
      router.refresh()
    })
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create New Workspace</CardTitle>
        <CardDescription>
          Create a workspace to organize your projects and collaborate with your team
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleFormSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">
              Workspace Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="My Workspace"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="What is this workspace for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
              rows={4}
            />
          </div>

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              {error}
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Workspace
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
