"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface Task {
  id: string
  title: string
  description?: string
  priority: string
  status_id?: string
  assigned_to?: string
  due_date?: string
  created_at: string
}

interface Comment {
  id: string
  content: string
  created_at: string
  user: { id: string; full_name: string; email: string }
}

export function TaskDetail({
  task,
  projectId,
  comments,
  statuses,
  assignees,
}: {
  task: Task
  projectId: string
  comments: Comment[]
  statuses: any[]
  assignees: any[]
}) {
  const [newComment, setNewComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [localComments, setLocalComments] = useState(comments)
  const [selectedStatus, setSelectedStatus] = useState(task.status_id)
  const [selectedAssignee, setSelectedAssignee] = useState(task.assigned_to)

  const handleAddComment = async () => {
    if (!newComment.trim()) return

    setIsSubmitting(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("task_comments")
        .insert({
          task_id: task.id,
          content: newComment,
        })
        .select("*, user:profiles(id, full_name, email)")
        .single()

      if (error) throw error

      setLocalComments([...localComments, data])
      setNewComment("")
    } catch (error) {
      console.error("Error adding comment:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStatusChange = async (statusId: string) => {
    setSelectedStatus(statusId)
    const supabase = createClient()
    await supabase.from("tasks").update({ status_id: statusId }).eq("id", task.id)
  }

  const handleAssigneeChange = async (assigneeId: string) => {
    setSelectedAssignee(assigneeId)
    const supabase = createClient()
    await supabase.from("tasks").update({ assigned_to: assigneeId }).eq("id", task.id)
  }

  const priorityColor = {
    low: "bg-blue-100 text-blue-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-orange-100 text-orange-800",
    urgent: "bg-red-100 text-red-800",
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Link href={`/dashboard/projects/${projectId}`}>
        <Button variant="ghost" className="gap-2 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Project
        </Button>
      </Link>

      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-4">{task.title}</h1>
            {task.description && <p className="text-muted-foreground text-lg">{task.description}</p>}
          </div>

          {/* Comments Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Comments ({localComments.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Add Comment */}
              <div className="space-y-3">
                <Textarea
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                />
                <Button onClick={handleAddComment} disabled={isSubmitting || !newComment.trim()}>
                  {isSubmitting ? "Posting..." : "Post Comment"}
                </Button>
              </div>

              {/* Comments List */}
              <div className="space-y-4 border-t border-border pt-6">
                {localComments.map((comment) => (
                  <div key={comment.id} className="flex gap-4">
                    <Avatar>
                      <AvatarFallback>{comment.user.full_name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{comment.user.full_name}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm mt-1">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedStatus || ""} onValueChange={handleStatusChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Set status" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status.id} value={status.id}>
                      {status.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Priority */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Priority</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className={priorityColor[task.priority as keyof typeof priorityColor]}>
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </Badge>
            </CardContent>
          </Card>

          {/* Assignee */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Assigned To</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedAssignee || ""} onValueChange={handleAssigneeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Assign task" />
                </SelectTrigger>
                <SelectContent>
                  {assignees.map((assignee) => (
                    <SelectItem key={assignee.id} value={assignee.id}>
                      {assignee.full_name || assignee.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Due Date */}
          {task.due_date && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Due Date</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  {new Date(task.due_date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
