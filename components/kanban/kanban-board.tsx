"use client"

import { useState } from "react"
import { KanbanColumn } from "./kanban-column"
import { CreateTaskDialog } from "./create-task-dialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

interface Status {
  id: string
  name: string
  color: string
}

interface Task {
  id: string
  title: string
  description?: string
  status_id?: string
  priority: string
  assigned_to?: string
}

export function KanbanBoard({
  projectId,
  statuses,
  tasks,
}: {
  projectId: string
  statuses: Status[]
  tasks: Task[]
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [localTasks, setLocalTasks] = useState(tasks)

  const handleTaskCreated = (newTask: Task) => {
    setLocalTasks([...localTasks, newTask])
    setIsOpen(false)
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="px-8 py-4 flex justify-end">
        <CreateTaskDialog
          projectId={projectId}
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          onTaskCreated={handleTaskCreated}
        >
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Task
          </Button>
        </CreateTaskDialog>
      </div>

      <div className="flex-1 overflow-x-auto px-8 pb-8">
        <div className="flex gap-6 min-w-max">
          {statuses.map((status) => {
            const statusTasks = localTasks.filter((task) => task.status_id === status.id)
            return <KanbanColumn key={status.id} status={status} tasks={statusTasks} projectId={projectId} />
          })}
        </div>
      </div>
    </div>
  )
}
