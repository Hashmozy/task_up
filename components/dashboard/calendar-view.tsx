"use client"

import { useState, useMemo } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface Task {
  id: string
  title: string
  priority: string
  due_date?: string
}

export function CalendarView({ tasks }: { tasks: Task[] }) {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 10))

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

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const emptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => i)

  const priorityBg = {
    low: "bg-blue-500",
    medium: "bg-yellow-500",
    high: "bg-orange-500",
    urgent: "bg-red-500",
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden p-8">
      <Card className="flex-1 flex flex-col p-6">
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

        <div className="grid grid-cols-7 gap-1 flex-1">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="text-center font-semibold text-sm text-muted-foreground py-2">
              {day}
            </div>
          ))}

          {emptyDays.map((i) => (
            <div key={`empty-${i}`} className="bg-muted/20 rounded p-1" />
          ))}

          {days.map((day) => {
            const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toISOString().split("T")[0]
            const dayTasks = tasksByDate[dateStr] || []

            return (
              <div key={day} className="bg-muted/30 rounded p-2 min-h-24 border border-border/50 flex flex-col">
                <div className="text-sm font-semibold mb-1">{day}</div>
                <div className="space-y-1 flex-1 overflow-hidden">
                  {dayTasks.slice(0, 2).map((task) => (
                    <div
                      key={task.id}
                      className={`text-xs px-2 py-1 rounded text-white truncate ${
                        priorityBg[task.priority as keyof typeof priorityBg]
                      }`}
                    >
                      {task.title}
                    </div>
                  ))}
                  {dayTasks.length > 2 && (
                    <div className="text-xs text-muted-foreground px-2">+{dayTasks.length - 2} more</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
