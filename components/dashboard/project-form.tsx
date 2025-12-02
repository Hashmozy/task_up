"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createProject } from "@/lib/actions/project"
import { useFormState } from "@/lib/hooks/use-form-state"
import { Loader2 } from "lucide-react"

export function ProjectForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const workspaceId = searchParams.get("workspace")
  
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const { isLoading, error, setError, handleSubmit } = useFormState()

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      setError("Project name is required")
      return
    }

    if (!workspaceId) {
      setError("Workspace ID is missing")
      return
    }

    await handleSubmit(async () => {
      await createProject({
        name,
        description,
        workspace_id: workspaceId,
      })
      router.push("/dashboard")
      router.refresh()
    })
  }

  if (!workspaceId) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-6">
          <div className="text-center text-destructive">
            Error: No workspace selected. Please go back to the dashboard and try again.
          </div>
          <Button className="mt-4" onClick={() => router.push("/dashboard")}>
            Back to Dashboard
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create New Project</CardTitle>
        <CardDescription>
          Create a project to track tasks and progress
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleFormSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">
              Project Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="Website Redesign"
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
              placeholder="What is this project about?"
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
              Create Project
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
