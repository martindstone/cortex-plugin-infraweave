// src/components/tabs/PoliciesTab.tsx
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@cortexapps/react-plugin-ui";
import { AlertTriangle, CheckCircle, ExternalLink, Shield } from "lucide-react";
import { useMultiplePolicies } from "../backend/infraweave";

const PoliciesTab: React.FC = () => {
  const [searchFilter, setSearchFilter] = useState("");
  const [selectedEnvironments, setSelectedEnvironments] = useState<string[]>([
    "stable",
  ]);

  const { policies, isLoading, hasError } = useMultiplePolicies(
    selectedEnvironments,
  );

  // Filter policies based on search
  const filteredPolicies = policies.filter((policy) =>
    policy.policy.toLowerCase().includes(searchFilter.toLowerCase()) ||
    policy.description.toLowerCase().includes(searchFilter.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader size="large" />
      </div>
    );
  }

  const getEnvironmentBadge = (environment: string) => {
    const variants: Record<string, any> = {
      stable: "success",
      beta: "warning",
      dev: "secondary",
      aws: "info",
    };
    return variants[environment] || "secondary";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Policies</h1>
        <p className="text-muted-foreground">
          Manage and enforce infrastructure policies and compliance standards.
        </p>
      </div>

      {/* Info Card */}
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-900">
                Policy Enforcement
              </h3>
              <p className="text-amber-700 text-sm mt-1">
                Policies are used to enforce rules and standards for
                infrastructure and are applied to all deployments. They help
                ensure compliance, security, and consistency across your
                infrastructure.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Environment Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Environment
              </label>
              <Select
                value={selectedEnvironments[0] || ""}
                onValueChange={(value) =>
                  setSelectedEnvironments(value ? [value] : [])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select environment..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stable">Stable</SelectItem>
                  <SelectItem value="beta">Beta</SelectItem>
                  <SelectItem value="dev">Development</SelectItem>
                  <SelectItem value="aws">AWS</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Search */}
            <div>
              <label className="block text-sm font-medium mb-2">Search</label>
              <Input
                placeholder="Search policies..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Policies List */}
      <div className="space-y-4">
        {hasError
          ? (
            <div className="text-center p-8 text-red-500">
              <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
              Error loading policies
            </div>
          )
          : filteredPolicies.length === 0
          ? (
            <div className="text-center p-8 text-muted-foreground">
              {selectedEnvironments.length === 0
                ? "Select an environment to view policies"
                : searchFilter
                ? `No policies found matching "${searchFilter}"`
                : "No policies found in selected environment"}
            </div>
          )
          : (
            filteredPolicies.map((policy) => (
              <Card
                key={`${policy.environment}-${policy.policy}-${policy.version}`}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-blue-500" />
                      <div>
                        <CardTitle className="text-lg">
                          {policy.policy}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant={getEnvironmentBadge(policy.environment)}
                          >
                            {policy.environment}
                          </Badge>
                          <Badge variant="outline">
                            v{policy.version}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                      {policy.reference && (
                        <Button variant="outline" size="sm">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm line-clamp-3">
                    {policy.description.split("\n")[0] ||
                      "No description available"}
                  </p>

                  {/* Policy Data Preview */}
                  {policy.data && Object.keys(policy.data).length > 0 && (
                    <div className="mt-4 p-3 bg-muted rounded-lg">
                      <div className="text-sm font-medium mb-2">
                        Configuration:
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {Object.keys(policy.data).slice(0, 3).map((key) => (
                          <div key={key} className="truncate">
                            <span className="font-mono">{key}:</span>{" "}
                            {JSON.stringify(policy.data[key]).slice(0, 50)}...
                          </div>
                        ))}
                        {Object.keys(policy.data).length > 3 && (
                          <div className="text-xs italic">
                            +{Object.keys(policy.data).length - 3} more settings
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-4 pt-4 border-t text-sm text-muted-foreground">
                    <div>
                      Updated: {new Date(policy.timestamp).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Active
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
      </div>
    </div>
  );
};

export default PoliciesTab;
