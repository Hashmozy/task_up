"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { GlobalAnalytics } from "@/lib/workspace-analytics"
import { Users, FolderKanban, CheckCircle2, LayoutGrid, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface GlobalDashboardProps {
  analytics: GlobalAnalytics
}

export function GlobalDashboard({ analytics }: GlobalDashboardProps) {
  const statCards = [
    {
      title: "Total Workspaces",
      value: analytics.totalWorkspaces,
      icon: LayoutGrid,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Active Projects",
      value: analytics.totalProjects,
      icon: FolderKanban,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Total Tasks",
      value: analytics.totalTasks,
      icon: CheckCircle2,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Team Members",
      value: analytics.totalMembers,
      icon: Users,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    },
  ]

  return (
    <div className="space-y-8">
      {/* Global Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-3xl font-bold mt-2">{stat.value}</p>
                  </div>
                  <div className={`${stat.bgColor} p-3 rounded-lg`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Workspaces List */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Your Workspaces</h2>
          <Link href="/dashboard/workspaces/new">
            <Button>Create Workspace</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {analytics.workspaces.map((workspace) => (
            <Link key={workspace.id} href={`/dashboard/workspaces/${workspace.id}`}>
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-bold text-lg group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      {workspace.name.substring(0, 2).toUpperCase()}
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <CardTitle className="mt-4">{workspace.name}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {workspace.description || "No description provided"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-2 pt-4 border-t">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Projects</p>
                      <p className="font-bold">{workspace.projectCount}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Tasks</p>
                      <p className="font-bold">{workspace.taskCount}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Members</p>
                      <p className="font-bold">{workspace.memberCount}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
