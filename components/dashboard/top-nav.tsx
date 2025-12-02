"use client"

import type { User } from "@supabase/supabase-js"
import { Bell, Users, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar"

export function TopNav({ user }: { user: User }) {
  const initials = user.email?.substring(0, 2).toUpperCase() || "U"

  return (
    <div className="h-16 border-b border-border bg-card flex items-center justify-between px-8 gap-4">
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <SidebarTrigger />
        <div className="flex items-center gap-2 flex-1">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input type="search" placeholder="Search tasks, projects..." className="bg-muted border-0" />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon">
          <Bell className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon">
          <Users className="w-5 h-5" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="w-8 h-8">
                <AvatarImage src={user.user_metadata?.avatar_url || "/placeholder.svg"} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem disabled>
              <div className="flex flex-col">
                <span className="font-medium">{user.email}</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
