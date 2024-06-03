import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import { SettingsProvider } from '@/components/SettingsProvider/SettingsProvider';
import routes from '@/routes';

import './App.css';

const router = createBrowserRouter(
  Object.values(routes).map(({ element, path }) => ({
    element: React.createElement(element),
    path,
  })),
);

const App = () => (
  <SettingsProvider>
    <RouterProvider router={router} />
  </SettingsProvider>
);

export default App;
