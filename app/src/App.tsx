import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom';

import Error from '@/components/Error/Error';
import { ThemeProvider } from '@/components/ThemeProvider/ThemeProvider';
import { SettingsProvider } from '@/providers/SettingsProvider';
import routes from '@/routes';

import './App.css';

const ErrorBoundaryLayout = () => (
  <ErrorBoundary FallbackComponent={Error}>
    <Outlet />
  </ErrorBoundary>
);

const router = createBrowserRouter([
  {
    children: Object.values(routes).map(({ element, path }) => ({
      element: React.createElement(element),
      path,
    })),
    element: <ErrorBoundaryLayout />,
  },
]);

const App = () => (
  <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
    <SettingsProvider>
      <RouterProvider router={router} />
    </SettingsProvider>
  </ThemeProvider>
);

export default App;
