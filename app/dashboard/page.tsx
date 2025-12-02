"use client"

import { useWorkspaces } from "@/lib/hooks/use-queries"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loader2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function DashboardPage() {
  const router = useRouter()
  const { data: workspaces, isLoading } = useWorkspaces()

  useEffect(() => {
    if (!isLoading && workspaces && workspaces.length > 0) {
      // Redirect to the first workspace
      router.replace(`/dashboard/workspaces/${workspaces[0].id}`)
    }
  }, [workspaces, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // If no workspaces, show empty state
  if (workspaces && workspaces.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <h2 className="text-2xl font-bold">Welcome to Task Up</h2>
        <p className="text-muted-foreground">You don't have any workspaces yet.</p>
        <Button onClick={() => router.push("/dashboard/workspaces/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Create Workspace
        </Button>
      </div>
    )
  }

  return null // Redirecting...
}
