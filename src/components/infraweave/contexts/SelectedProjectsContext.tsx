import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useProjects } from "../backend/infraweave";
import { Project } from "../types";

interface SelectedProjectsContextValue {
  selectedProjects: string[];
  selectedRegions: string[];
  projects: Project[] | undefined;
  toggleProject: (projectId: string) => void;
  toggleRegion: (region: string) => void;
  setSelectedProjects: (ids: string[]) => void;
  setSelectedRegions: (regions: string[]) => void;
  availableRegions: string[];
}

const SelectedProjectsContext = createContext<SelectedProjectsContextValue | undefined>(undefined);

export const SelectedProjectsProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const { data: projects } = useProjects();
  const [selectedProjects, setSelectedProjects] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem("selectedProjectIds");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [selectedRegions, setSelectedRegions] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem("selectedRegions");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("selectedProjectIds", JSON.stringify(selectedProjects));
  }, [selectedProjects]);

  useEffect(() => {
    localStorage.setItem("selectedRegions", JSON.stringify(selectedRegions));
  }, [selectedRegions]);

  const availableRegions = useMemo(() => {
    if (!projects) return [];
    const regions = projects
      .filter(p => selectedProjects.includes(p.project_id))
      .flatMap(p => p.regions);
    return Array.from(new Set(regions));
  }, [projects, selectedProjects]);

  useEffect(() => {
    setSelectedRegions(prev => prev.filter(r => availableRegions.includes(r)));
  }, [availableRegions]);

  const toggleProject = (projectId: string) => {
    setSelectedProjects(prev =>
      prev.includes(projectId) ? prev.filter(p => p !== projectId) : [...prev, projectId]
    );
  };

  const toggleRegion = (region: string) => {
    setSelectedRegions(prev =>
      prev.includes(region) ? prev.filter(r => r !== region) : [...prev, region]
    );
  };

  return (
    <SelectedProjectsContext.Provider
      value={{
        selectedProjects,
        selectedRegions,
        projects,
        toggleProject,
        toggleRegion,
        setSelectedProjects,
        setSelectedRegions,
        availableRegions,
      }}
    >
      {children}
    </SelectedProjectsContext.Provider>
  );
};

export const useSelectedProjects = (): SelectedProjectsContextValue => {
  const ctx = useContext(SelectedProjectsContext);
  if (!ctx) {
    throw new Error("useSelectedProjects must be used within a SelectedProjectsProvider");
  }
  return ctx;
};

export default SelectedProjectsProvider;
