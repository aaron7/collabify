import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import routes from '@/routes';

import './App.css';

const router = createBrowserRouter(
  Object.values(routes).map(({ element, path }) => ({
    element: React.createElement(element),
    path,
  })),
);

const App = () => <RouterProvider router={router} />;

export default App;
