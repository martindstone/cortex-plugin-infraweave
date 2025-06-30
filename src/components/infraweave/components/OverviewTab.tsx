// src/components/tabs/OverviewTab.tsx
import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  // Badge,
  Loader,
} from '@cortexapps/react-plugin-ui';
import { 
  Activity, 
  Package, 
  Layers, 
  Shield, 
  Building, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { 
  useProjects, 
  useModules, 
  useStacks, 
  useMultiplePolicies,
  useMultipleDeployments 
} from '../backend/infraweave';

// import { useInfraweaveContext } from '../contexts/InfraweaveConfigContext';

const OverviewTab: React.FC = () => {
  // const { githubBaseUrl, gitlabBaseUrl, infraweaveBaseUrl } = useInfraweaveContext();
  const { data: projects, isLoading: projectsLoading } = useProjects();
  const { data: modules, isLoading: modulesLoading } = useModules();
  const { data: stacks, isLoading: stacksLoading } = useStacks();
  const { policies, isLoading: policiesLoading } = useMultiplePolicies(['stable']);
  
  // Get deployments for all projects/regions
  const deploymentQueries = projects?.flatMap(project =>
    project.regions.map(region => ({ projectId: project.project_id, region }))
  ) || [];
  
  const { deployments, isLoading: deploymentsLoading } = useMultipleDeployments(deploymentQueries);

  const isLoading = projectsLoading || modulesLoading || stacksLoading || policiesLoading || deploymentsLoading;

  // Calculate stats
  const stats = {
    totalProjects: projects?.length || 0,
    totalModules: modules?.length || 0,
    totalStacks: stacks?.length || 0,
    totalPolicies: policies?.length || 0,
    totalDeployments: deployments?.length || 0,
    successfulDeployments: deployments?.filter(d => d.status === 'successful').length || 0,
    runningDeployments: deployments?.filter(d => d.status === 'running' || d.status === 'initiated').length || 0,
    failedDeployments: deployments?.filter(d => d.status === 'error' || d.status === 'failed').length || 0,
    driftedDeployments: deployments?.filter(d => d.has_drifted).length || 0,
  };

  // Recent deployments
  const recentDeployments = deployments
    ?.sort((a, b) => b.epoch - a.epoch)
    .slice(0, 5) || [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'successful': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'running': case 'initiated': return <Clock className="w-4 h-4 text-blue-500" />;
      case 'error': case 'failed': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
  };

  if (isLoading && projects?.length === 0) {
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
        <h1 className="text-3xl font-bold">InfraWeave Overview</h1>
        <p className="text-muted-foreground">
          Manage your infrastructure deployments, modules, and policies.
        </p>
      </div>

      {/* <div>
        <h1 className="text-3xl font-bold">InfraWeave Context</h1>
        <p className="text-muted-foreground">
          GitHub Base URL: {githubBaseUrl || 'Not configured'}<br />
          GitLab Base URL: {gitlabBaseUrl || 'Not configured'}<br />
          InfraWeave Base URL: {infraweaveBaseUrl || 'Not configured'}
        </p>
      </div> */}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Building className="w-8 h-8 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{stats.totalProjects}</div>
                <div className="text-sm text-muted-foreground">Projects</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Activity className="w-8 h-8 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{stats.totalDeployments}</div>
                <div className="text-sm text-muted-foreground">Deployments</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Package className="w-8 h-8 text-purple-500" />
              <div>
                <div className="text-2xl font-bold">{stats.totalModules}</div>
                <div className="text-sm text-muted-foreground">Modules</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Layers className="w-8 h-8 text-indigo-500" />
              <div>
                <div className="text-2xl font-bold">{stats.totalStacks}</div>
                <div className="text-sm text-muted-foreground">Stacks</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-amber-500" />
              <div>
                <div className="text-2xl font-bold">{stats.totalPolicies}</div>
                <div className="text-sm text-muted-foreground">Policies</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Deployment Health */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Deployment Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-700">{stats.successfulDeployments}</div>
                <div className="text-sm text-green-600">Successful</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-700">{stats.runningDeployments}</div>
                <div className="text-sm text-blue-600">Running</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-700">{stats.failedDeployments}</div>
                <div className="text-sm text-red-600">Failed</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-700">{stats.driftedDeployments}</div>
                <div className="text-sm text-purple-600">Drifted</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {recentDeployments.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No recent deployments
              </div>
            ) : (
              <div className="space-y-3">
                {recentDeployments.map((deployment, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-2 rounded border">
                    {getStatusIcon(deployment.status)}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">
                        {deployment.deployment_id.split('/').pop()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {deployment.module} • {deployment.environment}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(deployment.epoch).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button className="h-20 flex-col gap-2">
              <Package className="w-6 h-6" />
              Browse Modules
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Layers className="w-6 h-6" />
              Deploy Stack
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Activity className="w-6 h-6" />
              View Deployments
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Shield className="w-6 h-6" />
              Check Policies
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardHeader>
          <CardTitle>About InfraWeave</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            InfraWeave is an infrastructure management platform that helps you deploy, manage, and monitor 
            your infrastructure across multiple environments and cloud providers.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              Documentation
            </Button>
            <Button variant="outline" size="sm">
              Learn More
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OverviewTab;
