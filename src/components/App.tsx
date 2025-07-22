import type React from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import PluginProvider from "./RoutingPluginProvider";
import { InfraweavePluginContextProvider } from "./infraweave/contexts/InfraweaveConfigContext";
import { SelectedProjectsProvider } from "./infraweave/contexts/SelectedProjectsContext";
import { SelectedProvidersProvider } from "./infraweave/contexts/SelectedProvidersContext";
import ErrorBoundary from "./ErrorBoundary";
import AppTabs from "./AppTabs";

import "../baseStyles.css";

const App: React.FC = () => {
  const queryClient = new QueryClient();

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <PluginProvider enableRouting initialEntries={["/overview"]}>
          <InfraweavePluginContextProvider entityTag="infraweave-plugin-config">
            <SelectedProvidersProvider>
              <SelectedProjectsProvider>
                <AppTabs />
              </SelectedProjectsProvider>
            </SelectedProvidersProvider>
          </InfraweavePluginContextProvider>
        </PluginProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
