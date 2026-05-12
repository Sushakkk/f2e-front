import * as React from 'react';
import { Navigate, createBrowserRouter } from 'react-router-dom';

import { ErrorFallback } from 'components/special';
import AppLayout from 'layouts/AppLayout/AppLayout';
import { AuthPage } from 'pages/AuthPage';
import CalendarPage from 'pages/CalendarPage/CalendarPage';
import { CoursePage } from 'pages/CoursePage';
import { HomePage } from 'pages/HomePage';
import MapPage from 'pages/MapPage/MapPage';
import ProfilePage from 'pages/ProfilePage/ProfilePage';
import SurveyPage from 'pages/SurveyPage/SurveyPage';
import { TeacherPage } from 'pages/TeacherPage';

import { RoutePath } from './paths';
import { PROFILE_DEFAULT_PATH } from './profilePaths';

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
        path: RoutePath.homeLegacy,
        element: <Navigate to={RoutePath.home} replace />,
      },
      {
        path: RoutePath.auth,
        element: <AuthPage />,
      },
      {
        path: RoutePath.authRegister,
        element: <AuthPage />,
      },
      {
        path: RoutePath.survey,
        element: <SurveyPage />,
      },
      {
        path: RoutePath.course,
        element: <CoursePage />,
      },
      {
        path: RoutePath.teacher,
        element: <TeacherPage />,
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
        element: <Navigate to={PROFILE_DEFAULT_PATH} replace />,
      },
      {
        path: RoutePath.profileSection,
        element: <ProfilePage />,
      },
    ],
  },
]);
