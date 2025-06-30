// src/components/tabs/StacksTab.tsx
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
import { Layers, Package } from "lucide-react";
import { useGroupedStacks } from "../backend/infraweave";

const StacksTab: React.FC = () => {
  const [searchFilter, setSearchFilter] = useState("");

  const { data: stacks, isLoading, error, rawStacks } = useGroupedStacks();

  // Filter stacks based on search
  const filteredStacks =
    stacks?.filter((stack) =>
      stack.module.toLowerCase().includes(searchFilter.toLowerCase())
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
        Error loading stacks: {error.message}
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

  // Get stack details for a given stack name
  const getStackDetails = (stackName: string) => {
    return rawStacks?.find((s) => s.module === stackName);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Stacks</h1>
        <p className="text-muted-foreground">
          Browse and deploy pre-configured infrastructure stacks following
          golden paths.
        </p>
      </div>

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Layers className="w-5 h-5 text-blue-500 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900">About Stacks</h3>
              <p className="text-blue-700 text-sm mt-1">
                Stacks are collections of linked modules that are deployed as
                one, following a golden path. These combinations are thoroughly
                tested (including upgrades) and are known to work well together.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <Input
            placeholder="Search stacks..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="pl-10"
          />
        </CardContent>
      </Card>

      {/* Stacks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStacks.map((stack) => {
          const stackDetails = getStackDetails(stack.module);
          const moduleCount = stackDetails?.stack_data?.modules?.length || 0;

          return (
            <Card
              key={stack.module}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-purple-500" />
                  <CardTitle className="text-lg">{stack.module}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Description */}
                {stackDetails?.description && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {stackDetails.description.split("\n")[0]}
                  </p>
                )}

                {/* Module Count */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Package className="w-4 h-4" />
                  {moduleCount} module{moduleCount !== 1 ? "s" : ""} included
                </div>

                {/* Version Badges */}
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">
                    Available Versions:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {getVersionBadge(stack.stable_version, "stable")}
                    {getVersionBadge(stack.beta_version, "beta")}
                    {getVersionBadge(stack.alpha_version, "alpha")}
                    {getVersionBadge(stack.dev_version, "dev")}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    disabled={!stack.stable_version && !stack.dev_version}
                  >
                    View Details
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    disabled={!stack.stable_version && !stack.dev_version}
                  >
                    Deploy
                  </Button>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground pt-2 border-t">
                  <div>
                    <span className="font-medium">Latest:</span>
                    <br />
                    {stack.stable_version || stack.beta_version ||
                      stack.dev_version || "None"}
                  </div>
                  <div>
                    <span className="font-medium">Tracks:</span>
                    <br />
                    {[
                      stack.stable_version && "stable",
                      stack.beta_version && "beta",
                      stack.alpha_version && "alpha",
                      stack.dev_version && "dev",
                    ].filter(Boolean).length}
                  </div>
                </div>

                {/* Module List (if available) */}
                {stackDetails?.stack_data?.modules &&
                  stackDetails.stack_data.modules.length > 0 && (
                  <div className="pt-2 border-t">
                    <div className="text-sm font-medium text-muted-foreground mb-2">
                      Modules:
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {stackDetails.stack_data.modules.slice(0, 3).map((
                        module,
                        idx,
                      ) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {module.module}
                        </Badge>
                      ))}
                      {stackDetails.stack_data.modules.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{stackDetails.stack_data.modules.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredStacks.length === 0 && searchFilter && (
        <div className="text-center p-8 text-muted-foreground">
          No stacks found matching "{searchFilter}"
        </div>
      )}
    </div>
  );
};

export default StacksTab;
