"use client"

import { useState, useMemo } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Task {
  id: string
  title: string
  priority: string
  due_date?: string
}

export function TaskCalendarView({ tasks }: { tasks: Task[] }) {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 10)) // November 2025

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()

  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()

  const tasksByDate = useMemo(() => {
    const map: { [key: string]: Task[] } = {}
    tasks.forEach((task) => {
      if (task.due_date) {
        const date = new Date(task.due_date).toISOString().split("T")[0]
        if (!map[date]) map[date] = []
        map[date].push(task)
      }
    })
    return map
  }, [tasks])

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const monthName = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  })

  const priorityColor = {
    low: "bg-blue-100 text-blue-800 text-xs",
    medium: "bg-yellow-100 text-yellow-800 text-xs",
    high: "bg-orange-100 text-orange-800 text-xs",
    urgent: "bg-red-100 text-red-800 text-xs",
  }

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const emptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => i)

  return (
    <div className="p-8">
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">{monthName}</h2>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={prevMonth}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={nextMonth}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="text-center font-semibold text-sm text-muted-foreground py-2">
              {day}
            </div>
          ))}

          {emptyDays.map((i) => (
            <div key={`empty-${i}`} className="bg-muted/30 rounded-lg p-2 min-h-24" />
          ))}

          {days.map((day) => {
            const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toISOString().split("T")[0]
            const dayTasks = tasksByDate[dateStr] || []

            return (
              <div key={day} className="bg-muted/30 rounded-lg p-2 min-h-24 border border-border/50">
                <div className="text-sm font-semibold mb-1">{day}</div>
                <div className="space-y-1">
                  {dayTasks.slice(0, 2).map((task) => (
                    <Badge
                      key={task.id}
                      className={priorityColor[task.priority as keyof typeof priorityColor]}
                      variant="secondary"
                    >
                      {task.title.substring(0, 12)}...
                    </Badge>
                  ))}
                  {dayTasks.length > 2 && (
                    <div className="text-xs text-muted-foreground">+{dayTasks.length - 2} more</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
