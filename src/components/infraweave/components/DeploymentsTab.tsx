// src/components/tabs/DeploymentsTab.tsx
import React, { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Badge,
  Loader,
} from '@cortexapps/react-plugin-ui';
import { RefreshCw, AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useProjects, useMultipleDeployments } from '../backend/infraweave';

const DeploymentsTab: React.FC = () => {
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [searchFilter, setSearchFilter] = useState('');

  const { data: projects, isLoading: projectsLoading } = useProjects();

  // Get all unique regions from selected projects
  const availableRegions = useMemo(() => {
    return projects
      ?.filter(p => selectedProjects.includes(p.project_id))
      .flatMap(p => p.regions)
      .filter((region, index, self) => self.indexOf(region) === index) || [];
  }, [projects, selectedProjects]);

  // Build queries for selected project/region combinations using useMemo for stability
  const deploymentQueries = useMemo(() => {
    // Only create queries if both projects and regions are selected
    if (selectedProjects.length === 0 || selectedRegions.length === 0) {
      return [];
    }
    return selectedProjects.flatMap(projectId =>
      selectedRegions.map(region => ({ projectId, region }))
    );
  }, [selectedProjects, selectedRegions]);

  const {
    deployments,
    isLoading: deploymentsLoading,
    hasError,
  } = useMultipleDeployments(deploymentQueries);

  // Filter deployments based on search
  const filteredDeployments = useMemo(() => {
    return deployments.filter(deployment =>
      deployment.deployment_id.toLowerCase().includes(searchFilter.toLowerCase()) ||
      deployment.module.toLowerCase().includes(searchFilter.toLowerCase()) ||
      deployment.environment.toLowerCase().includes(searchFilter.toLowerCase())
    );
  }, [deployments, searchFilter]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'successful': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'running': case 'initiated': return <Clock className="w-4 h-4 text-blue-500" />;
      case 'error': case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      successful: 'success',
      running: 'info',
      initiated: 'info', 
      error: 'destructive',
      failed: 'destructive',
    };
    return variants[status] || 'secondary';
  };

  // Handle project selection
  const handleProjectChange = (value: string) => {
    const newSelectedProjects = value ? [value] : [];
    setSelectedProjects(newSelectedProjects);
    
    // Clear regions when projects change
    setSelectedRegions([]);
  };

  // Handle region selection
  const handleRegionChange = (value: string) => {
    setSelectedRegions(value ? [value] : []);
  };

  if (projectsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Deployments</h1>
        <p className="text-muted-foreground">
          Manage and monitor your infrastructure deployments across projects and regions.
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Project Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">Projects</label>
              <Select
                value={selectedProjects[0] || ""}
                onValueChange={handleProjectChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select projects..." />
                </SelectTrigger>
                <SelectContent>
                  {projects?.map(project => (
                    <SelectItem key={project.project_id} value={project.project_id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Region Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">Regions</label>
              <Select
                value={selectedRegions[0] || ""}
                onValueChange={handleRegionChange}
                disabled={!selectedProjects.length}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select regions..." />
                </SelectTrigger>
                <SelectContent>
                  {availableRegions.map(region => (
                    <SelectItem key={region} value={region}>
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Search */}
            <div>
              <label className="block text-sm font-medium mb-2">Search</label>
              <Input
                placeholder="Filter deployments..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deployments List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            Live Deployments ({filteredDeployments.length})
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
            disabled={deploymentsLoading}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {deploymentsLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader size="medium" />
            </div>
          ) : hasError ? (
            <div className="text-center p-8 text-red-500">
              <AlertCircle className="w-8 h-8 mx-auto mb-2" />
              Error loading deployments
            </div>
          ) : filteredDeployments.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              No deployments found. Select projects and regions to view deployments.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredDeployments.map((deployment) => (
                <div
                  key={`${deployment.project_id}-${deployment.region}-${deployment.environment}-${deployment.deployment_id}`}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(deployment.status)}
                        <h3 className="font-semibold">
                          {deployment.deployment_id.split('/').pop()}
                        </h3>
                        <Badge variant={getStatusBadge(deployment.status)}>
                          {deployment.status}
                        </Badge>
                        {deployment.has_drifted && (
                          <Badge variant="warning">Drifted</Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                        <div>
                          <span className="font-medium">Module:</span> {deployment.module}
                        </div>
                        <div>
                          <span className="font-medium">Version:</span> {deployment.module_version}
                        </div>
                        <div>
                          <span className="font-medium">Environment:</span> {deployment.environment}
                        </div>
                        <div>
                          <span className="font-medium">Region:</span> {deployment.region}
                        </div>
                      </div>

                      {deployment.error_text && (
                        <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                          {deployment.error_text}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <div className="text-sm text-muted-foreground">
                        {new Date(deployment.epoch).toLocaleString()}
                      </div>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DeploymentsTab;
