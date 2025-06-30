// src/components/tabs/ModulesTab.tsx
import React, { useState } from "react";
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
import { ExternalLink, Package } from "lucide-react";
import { useGroupedModules } from "../backend/infraweave";

const ModulesTab: React.FC = () => {
  const [searchFilter, setSearchFilter] = useState("");

  const { data: modules, isLoading, error } = useGroupedModules();

  // Filter modules based on search
  const filteredModules =
    modules?.filter((module) =>
      module.module.toLowerCase().includes(searchFilter.toLowerCase())
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
        Error loading modules: {error.message}
      </div>
    );
  }

  const getVersionBadge = (version: string, track: string) => {
    if (!version) return null;

    const variants: Record<string, any> = {
      stable: "success",
      beta: "warning",
      alpha: "info",
      dev: "secondary",
    };

    return (
      <Badge variant={variants[track] || "secondary"}>
        {track}: {version}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Modules</h1>
        <p className="text-muted-foreground">
          Browse and manage your infrastructure modules across different tracks.
        </p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <Input
            placeholder="Search modules..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="pl-10"
          />
        </CardContent>
      </Card>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredModules.map((module) => (
          <Card
            key={module.module}
            className="hover:shadow-md transition-shadow"
          >
            <CardHeader>
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-500" />
                <CardTitle className="text-lg">{module.module}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Version Badges */}
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">
                  Available Versions:
                </div>
                <div className="flex flex-wrap gap-2">
                  {getVersionBadge(module.stable_version, "stable")}
                  {getVersionBadge(module.beta_version, "beta")}
                  {getVersionBadge(module.alpha_version, "alpha")}
                  {getVersionBadge(module.dev_version, "dev")}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  disabled={!module.stable_version}
                >
                  View Details
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!module.stable_version}
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground pt-2 border-t">
                <div>
                  <span className="font-medium">Latest:</span>
                  <br />
                  {module.stable_version || module.beta_version ||
                    module.dev_version || "None"}
                </div>
                <div>
                  <span className="font-medium">Tracks:</span>
                  <br />
                  {[
                    module.stable_version && "stable",
                    module.beta_version && "beta",
                    module.alpha_version && "alpha",
                    module.dev_version && "dev",
                  ].filter(Boolean).length}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredModules.length === 0 && searchFilter && (
        <div className="text-center p-8 text-muted-foreground">
          No modules found matching "{searchFilter}"
        </div>
      )}
    </div>
  );
};

export default ModulesTab;
