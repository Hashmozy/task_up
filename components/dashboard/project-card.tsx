import Link from "next/link"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface Project {
  id: string
  name: string
  description?: string
  color?: string
}

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link href={`/dashboard/projects/${project.id}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle>{project.name}</CardTitle>
              {project.description && (
                <CardDescription className="mt-2 line-clamp-2">{project.description}</CardDescription>
              )}
            </div>
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: project.color || "#3B82F6" }}
            />
          </div>
        </CardHeader>
      </Card>
    </Link>
  )
}
