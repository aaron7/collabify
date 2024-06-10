import { createContext, useContext, useState } from 'react';

type Settings = {
  name: string;
};

type SettingsProviderProps = {
  children: React.ReactNode;
  defaultSettings?: Settings;
  storageKey?: string;
};

type SettingsProviderState = {
  setSettings: (settings: Settings) => void;
  settings: Settings;
};

const initialState: SettingsProviderState = {
  setSettings: () => null,
  settings: { name: '' },
};

const SettingsProviderContext =
  createContext<SettingsProviderState>(initialState);

export function SettingsProvider({
  children,
  defaultSettings = { name: 'Anonymous' },
  storageKey = 'settings',
  ...props
}: SettingsProviderProps) {
  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      return JSON.parse(saved) as Settings;
    }

    localStorage.setItem(storageKey, JSON.stringify(defaultSettings));
    return defaultSettings;
  });

  const value = {
    setSettings: (settings: Settings) => {
      localStorage.setItem(storageKey, JSON.stringify(settings));
      setSettings(settings);
    },
    settings,
  };

  return (
    <SettingsProviderContext.Provider {...props} value={value}>
      {children}
    </SettingsProviderContext.Provider>
  );
}

export const useSettings = () => {
  const context = useContext(SettingsProviderContext);

  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }

  return context;
};
