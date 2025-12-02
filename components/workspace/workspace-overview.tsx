"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { WorkspaceAnalytics } from "@/lib/workspace-analytics"
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Users, FolderKanban, CheckCircle2, Clock, Pause, AlertCircle } from "lucide-react"

interface WorkspaceOverviewProps {
  analytics: WorkspaceAnalytics
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"]

export function WorkspaceOverview({ analytics }: WorkspaceOverviewProps) {
  const statCards = [
    {
      title: "Total Tasks",
      value: analytics.tasks.total,
      icon: FolderKanban,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Completed",
      value: analytics.tasks.completed,
      icon: CheckCircle2,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "In Progress",
      value: analytics.tasks.inProgress,
      icon: Clock,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    },
    {
      title: "On Hold",
      value: analytics.tasks.onHold,
      icon: AlertCircle,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Paused",
      value: analytics.tasks.paused,
      icon: Pause,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Total Members",
      value: analytics.members.total,
      icon: Users,
      color: "text-pink-600",
      bgColor: "bg-pink-50",
    },
  ]

  const projectStats = [
    { name: "Total Projects", value: analytics.projects.total },
    { name: "Active Projects", value: analytics.projects.active },
  ]

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Task Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.tasks.byStatus.filter((s) => s.count > 0)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {analytics.tasks.byStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Project Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Project Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={projectStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Task Trends */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Task Activity (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="created" stroke="#3b82f6" name="Created" strokeWidth={2} />
                <Line type="monotone" dataKey="completed" stroke="#10b981" name="Completed" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Member Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Team Composition</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-4 p-4 border rounded-lg">
              <div className="bg-blue-50 p-3 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Members</p>
                <p className="text-2xl font-bold">{analytics.members.total}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 border rounded-lg">
              <div className="bg-purple-50 p-3 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Admins</p>
                <p className="text-2xl font-bold">{analytics.members.admins}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 border rounded-lg">
              <div className="bg-green-50 p-3 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Regular Members</p>
                <p className="text-2xl font-bold">{analytics.members.regular}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
