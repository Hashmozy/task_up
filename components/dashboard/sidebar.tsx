"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { 
  Settings, 
  LogOut, 
  ChevronsUpDown, 
  Plus, 
  UserPlus, 
  Loader2,
  LayoutGrid,
  FolderKanban,
  ListTodo,
  Users,
  BarChart3,
  Calendar
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { signOut } from "@/lib/actions/auth"
import { inviteUserToWorkspace } from "@/lib/actions/workspace"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarRail,
} from "@/components/ui/sidebar"

interface Workspace {
  id: string
  name: string
}

export function Sidebar({ workspaces }: { workspaces: Workspace[] }) {
  const pathname = usePathname()
  const router = useRouter()
  const currentWorkspace = workspaces?.[0]

  const [isInviteOpen, setIsInviteOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleLogout = async () => {
    await signOut()
    router.push("/auth/login")
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail.trim()) return

    setIsLoading(true)
    try {
      await inviteUserToWorkspace(inviteEmail, currentWorkspace?.id)
      toast.success("User added to workspace")
      setInviteEmail("")
      setIsInviteOpen(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to invite user")
    } finally {
      setIsLoading(false)
    }
  }

  if (!currentWorkspace) {
    return null
  }

  const workspaceLinks = [
    {
      label: "Dashboard",
      icon: LayoutGrid,
      href: `/dashboard/workspaces/${currentWorkspace.id}`,
      exact: true,
    },
    {
      label: "Projects",
      icon: FolderKanban,
      href: `/dashboard/projects?workspace=${currentWorkspace.id}`,
    },
    {
      label: "Tasks",
      icon: ListTodo,
      href: `/dashboard/tasks?workspace=${currentWorkspace.id}`,
    },
    {
      label: "Calendar",
      icon: Calendar,
      href: `/dashboard/calendar?workspace=${currentWorkspace.id}`,
    },
    {
      label: "Members",
      icon: Users,
      href: `/dashboard/members?workspace=${currentWorkspace.id}`,
    },
    {
      label: "Settings",
      icon: Settings,
      href: `/dashboard/settings?workspace=${currentWorkspace.id}`,
    },
  ]

  return (
    <>
      <ShadcnSidebar collapsible="icon">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  >
                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                      {currentWorkspace?.name?.substring(0, 2).toUpperCase() || "PM"}
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        {currentWorkspace?.name || "Project Manager"}
                      </span>
                      <span className="truncate text-xs">Free Plan</span>
                    </div>
                    <ChevronsUpDown className="ml-auto" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                  align="start"
                  side="bottom"
                  sideOffset={4}
                >
                  <DropdownMenuLabel className="text-xs text-muted-foreground">
                    Workspaces
                  </DropdownMenuLabel>
                  {workspaces.map((workspace) => (
                    <DropdownMenuItem
                      key={workspace.id}
                      onClick={() => router.push(`/dashboard?workspace=${workspace.id}`)}
                      className="gap-2 p-2"
                    >
                      <div className="flex size-6 items-center justify-center rounded-sm border">
                        {workspace.name.substring(0, 2).toUpperCase()}
                      </div>
                      {workspace.name}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="gap-2 p-2" onClick={() => router.push("/dashboard/workspaces/new")}>
                    <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                      <Plus className="size-4" />
                    </div>
                    <div className="font-medium text-muted-foreground">Add workspace</div>
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-xs text-muted-foreground">
                    Account
                  </DropdownMenuLabel>
                  <DropdownMenuItem className="gap-2 p-2">
                    <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                      <span className="text-xs">P</span>
                    </div>
                    <div className="font-medium text-muted-foreground">Personal Account</div>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-2 p-2">
                    <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                      <span className="text-xs">C</span>
                    </div>
                    <div className="font-medium text-muted-foreground">Company Account</div>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-xs text-muted-foreground">
                    Plans
                  </DropdownMenuLabel>
                  <DropdownMenuItem className="gap-2 p-2">
                    <div className="font-medium text-muted-foreground">View Plans</div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Workspace</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {workspaceLinks.map((link) => {
                  const linkPath = link.href.split('?')[0]
                  const isActive = link.exact 
                    ? pathname === linkPath
                    : pathname.startsWith(linkPath)
                  
                  return (
                    <SidebarMenuItem key={link.label}>
                      <SidebarMenuButton 
                        asChild 
                        isActive={isActive}
                      >
                        <Link href={link.href}>
                          <link.icon />
                          <span>{link.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          
          <SidebarGroup className="mt-auto">
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={() => setIsInviteOpen(true)}>
                    <UserPlus />
                    <span>Invite Members</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton 
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                onClick={handleLogout}
              >
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <LogOut className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Log out</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </ShadcnSidebar>

      <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Members</DialogTitle>
            <DialogDescription>
              Invite a user to <strong>{currentWorkspace?.name}</strong> by email.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleInvite} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="colleague@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsInviteOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Invite
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
