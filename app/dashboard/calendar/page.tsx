import { createClient } from "@/lib/supabase/server"
import { CalendarView } from "@/components/dashboard/calendar-view"

export default async function CalendarPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get all tasks for the logged-in user
  const { data: tasks } = await supabase
    .from("tasks")
    .select("*")
    .eq("assigned_to", user?.id)
    .order("due_date", { ascending: true })

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-border px-8 py-4">
        <h1 className="text-2xl font-bold">Calendar</h1>
        <p className="text-muted-foreground mt-1">View all your tasks and deadlines</p>
      </div>
      <CalendarView tasks={tasks || []} />
    </div>
  )
}
