// EntityCustomDataContext.tsx
import React, { createContext, useContext } from "react";
// import type { UseEntityCustomDataReturn } from "../../../hooks/useEntityCustomData";
import useEntityCustomData, { customDataListToDict } from "../../../hooks/useEntityCustomData";

import ConfigInstructions from "../components/ConfigInstructions";

export interface UseInfraweavePluginContextReturn {
  githubBaseUrl: string | undefined;
  gitlabBaseUrl: string | undefined;
  infraweaveBaseUrl: string | undefined;
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
}
const InfraweavePluginContext = createContext<UseInfraweavePluginContextReturn | undefined>(undefined);

interface InfraweavePluginContextProviderProps {
  entityTag: string | undefined;
  children: React.ReactNode;
  loadingFallback?: React.ReactNode;
  errorFallback?: (error: Error) => React.ReactNode;
}

export const InfraweavePluginContextProvider = ({
  entityTag,
  children,
  loadingFallback = <div>Loading custom data...</div>,
  errorFallback = (error) => <ConfigInstructions error={error} />,
}: InfraweavePluginContextProviderProps) => {
  if (!entityTag) {
    // should not happen, but just in case
    return <>{loadingFallback}</>;
  }
  const { customData, isLoading, isFetching, error } = useEntityCustomData({ entityTag });

  const {
    githubBaseUrl = "https://api.github.com",
    gitlabBaseUrl = "https://gitlab.com/api/v4",
    infraweaveBaseUrl,
  } = customDataListToDict(customData);

  if (isLoading) return <>{loadingFallback}</>;
  if (error) return <>{errorFallback(error)}</>;

  const value = {
    githubBaseUrl,
    gitlabBaseUrl,
    infraweaveBaseUrl,
    isLoading,
    isFetching,
    error,
  };

  return (
    <InfraweavePluginContext.Provider
      value={value}
    >
      {children}
    </InfraweavePluginContext.Provider>
  );
};

export const useInfraweaveContext = (): UseInfraweavePluginContextReturn => {
  const ctx = useContext(InfraweavePluginContext);
  if (!ctx) {
    throw new Error("useInfraweaveContext must be used within an InfraweavePluginContextProvider");
  }
  return ctx;
};
