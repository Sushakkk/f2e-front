import * as React from 'react';
import { createBrowserRouter } from 'react-router-dom';

import { ErrorFallback } from 'components/special';
import AppLayout from 'layouts/AppLayout/AppLayout';
import CalendarPage from 'pages/CalendarPage/CalendarPage';
import { HomePage } from 'pages/HomePage';
import MapPage from 'pages/MapPage/MapPage';
import ProfilePage from 'pages/ProfilePage/ProfilePage';

import { RoutePath } from './paths';

export const ROUTER = createBrowserRouter([
  {
    path: RoutePath.root,
    element: <AppLayout />,
    errorElement: <ErrorFallback />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: RoutePath.home,
        element: <HomePage />,
      },
      {
        path: RoutePath.calendar,
        element: <CalendarPage />,
      },
      {
        path: RoutePath.map,
        element: <MapPage />,
      },
      {
        path: RoutePath.profile,
        element: <ProfilePage />,
      },
    ],
  },
]);
