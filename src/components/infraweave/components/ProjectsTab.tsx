// src/components/tabs/ProjectsTab.tsx
import React, { useState, useEffect } from "react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Loader,
} from "@cortexapps/react-plugin-ui";
import { Building, ExternalLink, GitBranch, MapPin } from "lucide-react";
import { useProjects } from "../backend/infraweave";

interface ProjectsTabProps {
  params: Record<string, string>;
  setParams: (p: Record<string, string | undefined>) => void;
}

const ProjectsTab: React.FC<ProjectsTabProps> = ({ params, setParams }) => {
  const [searchFilter, setSearchFilter] = useState(params.search ?? "");

  useEffect(() => {
    setSearchFilter(params.search ?? "");
  }, [params.search]);

  const { data: projects, isLoading, error } = useProjects();

  // Filter projects based on search
  const filteredProjects =
    projects?.filter((project) =>
      project.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      project.description.toLowerCase().includes(searchFilter.toLowerCase()) ||
      project.project_id.includes(searchFilter)
    ) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 text-red-500">
        Error loading projects: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Projects</h1>
        <p className="text-muted-foreground">
          Manage your infrastructure projects across different environments and
          regions.
        </p>
      </div>

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Building className="w-5 h-5 text-blue-500 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900">About Projects</h3>
              <p className="text-blue-700 text-sm mt-1">
                A project represents the separation between different
                environments and products such as dev, staging, and prod for a
                specific product. In AWS it would be a separate account, in
                Azure a separate subscription, etc.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <Input
            placeholder="Search projects..."
            value={searchFilter}
            onChange={(e) => {
              setSearchFilter(e.target.value);
              setParams({ search: e.target.value });
            }}
            className="pl-10"
          />
        </CardContent>
      </Card>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <Card
            key={project.project_id}
            className="hover:shadow-md transition-shadow"
          >
            <CardHeader>
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-green-500" />
                <CardTitle className="text-lg">{project.name}</CardTitle>
              </div>
              <div className="text-sm text-muted-foreground font-mono">
                ID: {project.project_id}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Description */}
              <p className="text-sm text-muted-foreground">
                {project.description}
              </p>

              {/* Regions */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <MapPin className="w-4 h-4" />
                  Regions ({project.regions.length})
                </div>
                <div className="flex flex-wrap gap-1">
                  {project.regions.map((region) => (
                    <Badge key={region} variant="outline" className="text-xs">
                      {region}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Repositories */}
              {project.repositories && project.repositories.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <GitBranch className="w-4 h-4" />
                    Repositories ({project.repositories.length})
                  </div>
                  <div className="space-y-1">
                    {project.repositories.slice(0, 2).map((repo, idx) => (
                      <div
                        key={idx}
                        className="text-xs text-muted-foreground flex items-center gap-2"
                      >
                        <Badge variant="secondary" className="text-xs">
                          {repo.git_provider}
                        </Badge>
                        <span className="truncate font-mono">
                          {repo.repository_path}
                        </span>
                      </div>
                    ))}
                    {project.repositories.length > 2 && (
                      <div className="text-xs text-muted-foreground italic">
                        +{project.repositories.length - 2} more repositories
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  View Deployments
                </Button>
                <Button variant="outline" size="sm">
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground pt-2 border-t">
                <div>
                  <span className="font-medium">Regions:</span>
                  <br />
                  {project.regions.length}
                </div>
                <div>
                  <span className="font-medium">Repos:</span>
                  <br />
                  {project.repositories?.length || 0}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProjects.length === 0 && searchFilter && (
        <div className="text-center p-8 text-muted-foreground">
          No projects found matching "{searchFilter}"
        </div>
      )}

      {projects?.length === 0 && !searchFilter && (
        <div className="text-center p-8 text-muted-foreground">
          No projects configured
        </div>
      )}
    </div>
  );
};

export default ProjectsTab;
