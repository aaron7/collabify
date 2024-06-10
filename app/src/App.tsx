import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import { SettingsProvider } from '@/components/SettingsProvider/SettingsProvider';
import { ThemeProvider } from '@/components/ThemeProvider/ThemeProvider';
import routes from '@/routes';

import './App.css';

const router = createBrowserRouter(
  Object.values(routes).map(({ element, path }) => ({
    element: React.createElement(element),
    path,
  })),
);

const App = () => (
  <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
    <SettingsProvider>
      <RouterProvider router={router} />
    </SettingsProvider>
  </ThemeProvider>
);

export default App;