import { useMemo } from "react";
import { useQueries, useQuery } from "@tanstack/react-query";

import { useInfraweaveContext } from "../contexts/InfraweaveConfigContext";

const useInfraweaveApi = () => {
  const { infraweaveBaseUrl, isLoading, error } = useInfraweaveContext();

  const get = async <T>(endpoint: string): Promise<T> => {
    if (isLoading) {
      throw new Error("Infraweave API is still loading configuration.");
    }
    if (error) {
      throw new Error(`Infraweave API configuration error: ${error.message}`);
    }
    if (!infraweaveBaseUrl) {
      throw new Error("Infraweave base URL is not configured.");
    }

    const fetchUrl = infraweaveBaseUrl.replace(/\/+$/, "") + "/" +
      endpoint.replace(/^\/+/, "");
    const response = await fetch(fetchUrl);
    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `API Error: ${response.status} ${response.statusText} - ${endpoint}\n${errorBody}`,
      );
    }
    return response.json();
  };

  return { get, isLoading };
};

import {
  Deployment,
  Module,
  Policy,
  Project,
} from "../types";

// Query result types
export interface Event {
  deployment_id: string;
  status: string;
  event: string;
  module: string;
  job_id: string;
  initiated_by: string;
  timestamp: string;
  epoch: number;
}

export interface Log {
  logs: string;
}

export interface ChangeRecord {
  timestamp: string;
  plan_std_output: string;
}

export interface GroupedModule {
  module: string;
  dev_version: string;
  stable_version: string;
  beta_version: string;
  alpha_version: string;
}

export interface GroupedStack {
  module: string;
  stable_version: string;
  beta_version: string;
  alpha_version: string;
  dev_version: string;
}

// Helper function for URL encoding parameters
const encodeParams = (params: Record<string, string>) => {
  return Object.fromEntries(
    Object.entries(params).map((
      [key, value],
    ) => [key, encodeURIComponent(value)]),
  );
};

// =============================================================================
// DEPLOYMENT HOOKS
// =============================================================================

export const useDeployments = (projectId: string, region: string) => {
  const { get, isLoading } = useInfraweaveApi();
  return useQuery({
    queryKey: ["deployments", projectId, region],
    queryFn: () => get<Deployment[]>(`/deployments/${projectId}/${region}`),
    enabled: !!projectId && !!region && !isLoading,
  });
};

export const useDeploymentsByModule = (
  projectId: string,
  region: string,
  module: string,
) => {
  const { get, isLoading } = useInfraweaveApi();
  return useQuery({
    queryKey: ["deployments", "module", projectId, region, module],
    queryFn: () =>
      get<Deployment[]>(`/deployments/module/${projectId}/${region}/${module}`),
    enabled: !!projectId && !!region && !!module && !isLoading,
  });
};

export const useDeployment = (
  projectId: string,
  region: string,
  environment: string,
  deploymentId: string,
) => {
  const { get, isLoading } = useInfraweaveApi();
  const { environment: encodedEnv, deploymentId: encodedId } = encodeParams({
    environment,
    deploymentId,
  });

  return useQuery({
    queryKey: ["deployment", projectId, region, environment, deploymentId],
    queryFn: () =>
      get<Deployment>(
        `/deployment/${projectId}/${region}/${encodedEnv}/${encodedId}`,
      ),
    enabled: !!projectId && !!region && !!environment && !!deploymentId &&
      !isLoading,
  });
};

// Multiple deployments with parallel fetching
export const useMultipleDeployments = (
  queries: Array<{ projectId: string; region: string }>,
  options?: { refreshInterval?: number },
) => {
  const { get, isLoading: isApiLoading } = useInfraweaveApi();
  const queryResults = useQueries({
    queries: queries.map((query) => ({
      queryKey: ["deployments", query.projectId, query.region] as const,
      queryFn: () =>
        get<Deployment[]>(`/deployments/${query.projectId}/${query.region}`),
      enabled: Boolean(query.projectId && query.region && !isApiLoading),
      refetchInterval: options?.refreshInterval,
      staleTime: 30 * 1000, // 30 seconds
    })),
  });

  return useMemo(() => {
    const deployments: Deployment[] = [];
    let isLoading = false;
    let hasError = false;

    queryResults.forEach((result) => {
      if (result.isLoading) isLoading = true;
      if (result.error) hasError = true;
      if (result.data) deployments.push(...result.data);
    });

    const refetch = () => queryResults.forEach((result) => result.refetch());

    return { deployments, isLoading, hasError, refetch };
  }, [queryResults]);
};

// =============================================================================
// MODULE HOOKS
// =============================================================================

export const useModules = () => {
  const { get, isLoading } = useInfraweaveApi();
  return useQuery({
    queryKey: ["modules"],
    queryFn: () => get<Module[]>("/modules"),
    enabled: !isLoading,
  });
};

export const useModuleVersions = (track: string, moduleName: string) => {
  const { get, isLoading } = useInfraweaveApi();
  return useQuery({
    queryKey: ["modules", "versions", track, moduleName],
    queryFn: () => get<Module[]>(`/modules/versions/${track}/${moduleName}`),
    enabled: !!track && !!moduleName && !isLoading,
  });
};

export const useModule = (
  track: string,
  moduleName: string,
  moduleVersion: string,
) => {
  const { get, isLoading } = useInfraweaveApi();
  const { moduleName: encodedName, moduleVersion: encodedVersion } =
    encodeParams({
      moduleName,
      moduleVersion,
    });

  return useQuery({
    queryKey: ["module", track, moduleName, moduleVersion],
    queryFn: () =>
      get<Module>(`/module/${track}/${encodedName}/${encodedVersion}`),
    enabled: !!track && !!moduleName && !!moduleVersion && !isLoading,
  });
};

export const useGroupedModules = () => {
  const { data: modules, ...rest } = useModules();

  const groupedModules = useMemo(() => {
    if (!modules) return [];

    const grouped = modules.reduce(
      (acc: { [key: string]: { [key: string]: string } }, module) => {
        if (!acc[module.module]) {
          acc[module.module] = {};
        }
        acc[module.module][module.track] = module.version;
        return acc;
      },
      {},
    );

    return Object.entries(grouped).map((
      [moduleName, tracks],
    ): GroupedModule => ({
      module: moduleName,
      dev_version: tracks.dev || "",
      stable_version: tracks.stable || "",
      beta_version: tracks.beta || "",
      alpha_version: tracks.alpha || "",
    }));
  }, [modules]);

  return {
    ...rest,
    data: groupedModules,
    rawModules: modules,
  };
};

// =============================================================================
// STACK HOOKS
// =============================================================================

export const useStacks = () => {
  const { get, isLoading } = useInfraweaveApi();
  return useQuery({
    queryKey: ["stacks"],
    queryFn: () => get<Module[]>("/stacks"),
    enabled: !isLoading,
  });
};

export const useStack = (
  track: string,
  stackName: string,
  stackVersion: string,
) => {
  const { get, isLoading } = useInfraweaveApi();
  const { stackName: encodedName, stackVersion: encodedVersion } = encodeParams(
    {
      stackName,
      stackVersion,
    },
  );

  return useQuery({
    queryKey: ["stack", track, stackName, stackVersion],
    queryFn: () =>
      get<Module>(`/stack/${track}/${encodedName}/${encodedVersion}`),
    enabled: !!track && !!stackName && !!stackVersion && !isLoading,
  });
};

export const useGroupedStacks = () => {
  const { data: stacks, ...rest } = useStacks();

  const groupedStacks = useMemo(() => {
    if (!stacks) return [];

    const grouped = stacks.reduce(
      (acc: { [key: string]: { [key: string]: string } }, stack) => {
        if (!acc[stack.module]) {
          acc[stack.module] = {};
        }
        acc[stack.module][stack.track] = stack.version;
        return acc;
      },
      {},
    );

    return Object.entries(grouped).map(([stackName, tracks]): GroupedStack => ({
      module: stackName,
      stable_version: tracks.stable || "",
      beta_version: tracks.beta || "",
      alpha_version: tracks.alpha || "",
      dev_version: tracks.dev || "",
    }));
  }, [stacks]);

  return {
    ...rest,
    data: groupedStacks,
    rawStacks: stacks,
  };
};

// =============================================================================
// POLICY HOOKS
// =============================================================================

export const usePolicies = (environment: string) => {
  const { get, isLoading } = useInfraweaveApi();
  return useQuery({
    queryKey: ["policies", environment],
    queryFn: () => get<Policy[]>(`/policies/${environment}`),
    enabled: !!environment && !isLoading,
  });
};

export const usePolicy = (
  environment: string,
  policyName: string,
  policyVersion: string,
) => {
  const { get, isLoading } = useInfraweaveApi();
  const {
    environment: encodedEnv,
    policyName: encodedName,
    policyVersion: encodedVersion,
  } = encodeParams({ environment, policyName, policyVersion });

  return useQuery({
    queryKey: ["policy", environment, policyName, policyVersion],
    queryFn: () =>
      get<Policy>(`/policy/${encodedEnv}/${encodedName}/${encodedVersion}`),
    enabled: !!environment && !!policyName && !!policyVersion && !isLoading,
  });
};

export const useMultiplePolicies = (environments: string[]) => {
  const { get, isLoading: isApiLoading } = useInfraweaveApi();
  const results = useQueries({
    queries: environments.map((environment) => ({
      queryKey: ["policies", environment] as const,
      queryFn: () => get<Policy[]>(`/policies/${environment}`),
      enabled: !!environment && !isApiLoading,
    })),
  });

  return useMemo(() => {
    const policies: Policy[] = [];
    let isLoading = false;
    let hasError = false;

    results.forEach((result) => {
      if (result.isLoading) isLoading = true;
      if (result.error) hasError = true;
      if (result.data) policies.push(...result.data);
    });

    return { policies, isLoading, hasError, individualResults: results };
  }, [results]);
};

// =============================================================================
// PROJECT HOOKS
// =============================================================================

export const useProjects = () => {
  const { get, isLoading } = useInfraweaveApi();
  return useQuery({
    queryKey: ["projects"],
    queryFn: () => get<Project[]>("/projects"),
    enabled: !isLoading,
  });
};

// =============================================================================
// EVENT & LOG HOOKS
// =============================================================================

export const useEvents = (
  projectId: string,
  region: string,
  environment: string,
  deploymentId: string,
) => {
  const { get, isLoading } = useInfraweaveApi();
  const { environment: encodedEnv, deploymentId: encodedId } = encodeParams({
    environment,
    deploymentId,
  });

  return useQuery({
    queryKey: ["events", projectId, region, environment, deploymentId],
    queryFn: () =>
      get<Event[]>(`/events/${projectId}/${region}/${encodedEnv}/${encodedId}`),
    enabled: !!projectId && !!region && !!environment && !!deploymentId &&
      !isLoading,
  });
};

export const useLogs = (projectId: string, region: string, jobId: string) => {
  const { get, isLoading } = useInfraweaveApi();
  const { jobId: encodedJobId } = encodeParams({ jobId });

  return useQuery({
    queryKey: ["logs", projectId, region, jobId],
    queryFn: () => get<Log>(`/logs/${projectId}/${region}/${encodedJobId}`),
    enabled: !!projectId && !!region && !!jobId && !isLoading,
    refetchInterval: 5000, // Auto-refresh every 5 seconds
  });
};

export const useChangeRecord = (
  projectId: string,
  region: string,
  environment: string,
  deploymentId: string,
  jobId: string,
  changeType: string,
) => {
  const { get, isLoading } = useInfraweaveApi();
  const {
    environment: encodedEnv,
    deploymentId: encodedDeploymentId,
    jobId: encodedJobId,
  } = encodeParams({ environment, deploymentId, jobId });

  return useQuery({
    queryKey: [
      "changeRecord",
      projectId,
      region,
      environment,
      deploymentId,
      jobId,
      changeType,
    ],
    queryFn: () =>
      get<ChangeRecord>(
        `/change_record/${projectId}/${region}/${encodedEnv}/${encodedDeploymentId}/${encodedJobId}/${changeType}`,
      ),
    enabled: !!projectId && !!region && !!environment && !!deploymentId &&
      !!jobId && !!changeType && !isLoading,
  });
};
