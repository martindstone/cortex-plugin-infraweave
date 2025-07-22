import React, { createContext, useContext, useEffect, useState } from "react";

interface SelectedProvidersContextValue {
  selectedProviders: string[];
  toggleProvider: (provider: string) => void;
  availableProviders: string[];
}

const SelectedProvidersContext = createContext<SelectedProvidersContextValue | undefined>(undefined);

export const SelectedProvidersProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [selectedProviders, setSelectedProviders] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem("selectedProviders");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const availableProviders = ["aws", "azure", "gcp"];

  useEffect(() => {
    localStorage.setItem("selectedProviders", JSON.stringify(selectedProviders));
  }, [selectedProviders]);

  const toggleProvider = (provider: string) => {
    const normalized = provider.toLowerCase();
    setSelectedProviders(prev =>
      prev.includes(normalized) ? prev.filter(p => p !== normalized) : [...prev, normalized]
    );
  };

  return (
    <SelectedProvidersContext.Provider value={{ selectedProviders, toggleProvider, availableProviders }}>
      {children}
    </SelectedProvidersContext.Provider>
  );
};

export const useSelectedProviders = (): SelectedProvidersContextValue => {
  const ctx = useContext(SelectedProvidersContext);
  if (!ctx) {
    throw new Error("useSelectedProviders must be used within a SelectedProvidersProvider");
  }
  return ctx;
};

export default SelectedProvidersProvider;
