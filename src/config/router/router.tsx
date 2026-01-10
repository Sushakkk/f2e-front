import * as React from 'react';
import { createBrowserRouter } from 'react-router-dom';

import { AppLayout, ErrorFallback } from 'components/special';
import { AboutPage } from 'pages/AboutPage';
import { HomePage } from 'pages/HomePage';
import { OnboardingPage } from 'pages/OnboardingPage';

import { RoutePath } from './paths';

export const ROUTER = createBrowserRouter([
  {
    path: RoutePath.root,
    element: <AppLayout />,
    errorElement: <ErrorFallback />,
    children: [
      {
        children: [
          {
            index: false,
          },
          {
            path: RoutePath.onboarding,
            element: <OnboardingPage />,
          },
          {
            path: RoutePath.home,
            element: <HomePage />,
          },
          {
            path: RoutePath.about,
            element: <AboutPage />,
          },
        ],
      },
    ],
  },
]);
