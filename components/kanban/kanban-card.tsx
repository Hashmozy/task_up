"use client"

import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface Task {
  id: string
  title: string
  description?: string
  priority: string
  assigned_to?: string
}

export function KanbanCard({
  task,
  projectId,
}: {
  task: Task
  projectId: string
}) {
  const priorityColor = {
    low: "bg-blue-100 text-blue-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-orange-100 text-orange-800",
    urgent: "bg-red-100 text-red-800",
  }

  return (
    <Link href={`/dashboard/projects/${projectId}/tasks/${task.id}`}>
      <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer bg-card">
        <h3 className="font-medium text-sm line-clamp-2">{task.title}</h3>
        {task.description && <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{task.description}</p>}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
          <Badge className={priorityColor[task.priority as keyof typeof priorityColor]} variant="secondary">
            {task.priority}
          </Badge>
          {task.assigned_to && (
            <Avatar className="w-6 h-6">
              <AvatarFallback className="text-xs">U</AvatarFallback>
            </Avatar>
          )}
        </div>
      </Card>
    </Link>
  )
}
