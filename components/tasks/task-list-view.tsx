"use client"

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

interface Task {
  id: string
  title: string
  description?: string
  priority: string
  due_date?: string
  project?: { id: string; name: string }
  status?: { id: string; name: string; color: string }
}

export function TaskListView({ tasks }: { tasks: Task[] }) {
  const priorityColor = {
    low: "bg-blue-100 text-blue-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-orange-100 text-orange-800",
    urgent: "bg-red-100 text-red-800",
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <div className="px-8 py-6">
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader className="bg-muted">
            <TableRow>
              <TableHead>Task</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Due Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task.id} className="hover:bg-muted/50 cursor-pointer">
                <TableCell>
                  <Link href={`/dashboard/projects/${task.project?.id}/tasks/${task.id}`}>
                    <Button variant="link" className="p-0 text-left">
                      {task.title}
                    </Button>
                  </Link>
                </TableCell>
                <TableCell>{task.project?.name}</TableCell>
                <TableCell>{task.status && <Badge variant="outline">{task.status.name}</Badge>}</TableCell>
                <TableCell>
                  <Badge className={priorityColor[task.priority as keyof typeof priorityColor]} variant="secondary">
                    {task.priority}
                  </Badge>
                </TableCell>
                <TableCell>{task.due_date ? formatDate(task.due_date) : "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {tasks.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No tasks assigned to you yet.</p>
        </div>
      )}
    </div>
  )
}
