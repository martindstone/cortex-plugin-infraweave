import type React from "react";

import { useLocation, useNavigate } from "react-router-dom";

import {
  Tabs,
  TabsContent,
  TabsTrigger,
  TabsList,
  Card,
  CardContent,
} from "@cortexapps/react-plugin-ui";

// These components can be used for development or testing, we will remove them later
// import Components from "./Components";
// import PluginContext from "./PluginContext";
// import EntityDetails from "./EntityDetails";
// import ColorSwatches from "./ColorSwatches";
// import ProxyTest from "./ProxyTest";

import DeploymentsTab from "./infraweave/components/DeploymentsTab";
import ModulesTab from "./infraweave/components/ModulesTab";
import OverviewTab from "./infraweave/components/OverviewTab";
import StacksTab from "./infraweave/components/StacksTab";
import PoliciesTab from "./infraweave/components/PoliciesTab";
import ProjectsTab from "./infraweave/components/ProjectsTab";
import "../baseStyles.css";

interface TabRoute {
  label: string;
  path: string;
  element: JSX.Element;
}

export const AppTabs: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const tabRoutes: TabRoute[] = [
    { label: "Overview", path: "/overview", element: <OverviewTab /> },
    { label: "Modules", path: "/modules", element: <ModulesTab /> },
    { label: "Stacks", path: "/stacks", element: <StacksTab /> },
    { label: "Policies", path: "/policies", element: <PoliciesTab /> },
    { label: "Projects", path: "/projects", element: <ProjectsTab /> },
    { label: "Deployments", path: "/deployments", element: <DeploymentsTab /> },

    // Uncomment these lines to enable the additional tabs for development or testing
    // { label: "Components", path: "/basic", element: <Components /> },
    // { label: "Context", path: "/context", element: <PluginContext /> },
    // { label: "Entity", path: "/entity", element: <EntityDetails /> },
    // { label: "Colors", path: "/colors", element: <ColorSwatches /> },
    // { label: "Proxy", path: "/proxy", element: <ProxyTest /> },
  ];

  const handleTabsChange = (value: string): void => {
    void navigate(value);
  };

  return (
    <div className="flex flex-col p-1">
      <Card>
        <Tabs
          className="tab-root"
          onValueChange={handleTabsChange}
          defaultValue={location.pathname}
        >
          <TabsList className="tab-list">
            {tabRoutes.map((route, index) => (
              <TabsTrigger
                className="tab-trigger"
                key={index}
                value={route.path}
              >
                {route.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <CardContent className="pt-0">
            {tabRoutes.map((route, index) => (
              <TabsContent
                className="tab-content"
                style={{ minHeight: "100%" }}
                key={index}
                value={route.path}
              >
                {route.element}
              </TabsContent>
            ))}
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default AppTabs;
