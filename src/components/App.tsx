import type React from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import PluginProvider from "./RoutingPluginProvider";
import { InfraweavePluginContextProvider } from "./infraweave/contexts/InfraweaveConfigContext";
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
            <AppTabs />
          </InfraweavePluginContextProvider>
        </PluginProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
