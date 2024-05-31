import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import ComingSoon from '@/routes/ComingSoon';
import Join from '@/routes/Join';
import Landing from '@/routes/Landing';
import New from '@/routes/New';
import Session from '@/routes/Session';

import './App.css';

const router = createBrowserRouter([
  {
    element: <ComingSoon />,
    path: '/',
  },
  {
    element: <Landing />,
    path: 'landing',
  },
  {
    element: <Session />,
    path: 'session',
  },
  {
    element: <New />,
    path: 'new',
  },
  {
    element: <Join />,
    path: 'join',
  },
]);

const App = () => <RouterProvider router={router} />;

export default App;
