import React from "react";
import { Card, CardContent, CardHeader, CardTitle, Checkbox } from "@cortexapps/react-plugin-ui";
import { useSelectedProviders } from "../contexts/SelectedProvidersContext";

const ProviderSelector: React.FC = () => {
  const { selectedProviders, toggleProvider, availableProviders } = useSelectedProviders();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cloud Providers</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {availableProviders.map(provider => {
          const key = provider.toLowerCase();
          return (
            <label key={key} className="flex items-center gap-2">
              <Checkbox
                checked={selectedProviders.includes(key)}
                onCheckedChange={() => toggleProvider(key)}
              />
              {provider}
            </label>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default ProviderSelector;
