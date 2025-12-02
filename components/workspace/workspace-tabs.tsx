"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, Users, FolderKanban, Settings, ListTodo } from "lucide-react"

interface WorkspaceTabsProps {
  workspaceId: string
  activeTab: string
  children: React.ReactNode
}

export function WorkspaceTabs({ workspaceId, activeTab, children }: WorkspaceTabsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === "overview") {
      params.delete("tab")
    } else {
      params.set("tab", value)
    }
    const queryString = params.toString()
    router.push(`/dashboard/workspaces/${workspaceId}${queryString ? `?${queryString}` : ""}`)
  }

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
      <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
        <TabsTrigger value="overview" className="gap-2">
          <BarChart3 className="w-4 h-4" />
          <span className="hidden sm:inline">Overview</span>
        </TabsTrigger>
        <TabsTrigger value="projects" className="gap-2">
          <FolderKanban className="w-4 h-4" />
          <span className="hidden sm:inline">Projects</span>
        </TabsTrigger>
        <TabsTrigger value="tasks" className="gap-2">
          <ListTodo className="w-4 h-4" />
          <span className="hidden sm:inline">Tasks</span>
        </TabsTrigger>
        <TabsTrigger value="members" className="gap-2">
          <Users className="w-4 h-4" />
          <span className="hidden sm:inline">Members</span>
        </TabsTrigger>
        <TabsTrigger value="settings" className="gap-2">
          <Settings className="w-4 h-4" />
          <span className="hidden sm:inline">Settings</span>
        </TabsTrigger>
      </TabsList>
      {children}
    </Tabs>
  )
}
