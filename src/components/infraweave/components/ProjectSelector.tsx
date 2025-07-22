import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Checkbox,
  Loader,
} from "@cortexapps/react-plugin-ui";
import { useProjects } from "../backend/infraweave";
import { useSelectedProjects } from "../contexts/SelectedProjectsContext";

const ProjectSelector: React.FC = () => {
  const { data: projects, isLoading, error } = useProjects();
  const { selectedProjects, toggleProject, selectedRegions, toggleRegion, availableRegions } = useSelectedProjects();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader size="medium" />
      </div>
    );
  }
  if (error) {
    return <div className="text-red-500 p-4">Error loading projects</div>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Projects</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {projects?.map(project => (
            <label key={project.project_id} className="flex items-center gap-2">
              <Checkbox
                checked={selectedProjects.includes(project.project_id)}
                onCheckedChange={() => toggleProject(project.project_id)}
              />
              {project.name}
            </label>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Regions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {availableRegions.map(region => (
            <label key={region} className="flex items-center gap-2">
              <Checkbox
                checked={selectedRegions.includes(region)}
                onCheckedChange={() => toggleRegion(region)}
              />
              {region}
            </label>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectSelector;
