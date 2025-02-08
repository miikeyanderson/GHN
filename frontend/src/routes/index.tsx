import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import ProtectedRoute from './ProtectedRoute';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/common/LoadingSpinner';

// Lazy-loaded components
const Dashboard = lazy(() => import('../pages/Dashboard'));
const Login = lazy(() => import('../pages/auth/Login'));
const Register = lazy(() => import('../pages/auth/Register'));
const Profile = lazy(() => import('../pages/Profile'));
const ResourceLibrary = lazy(() => import('../pages/ResourceLibrary'));

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: '/login',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Login />
          </Suspense>
        ),
      },
      {
        path: '/register',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Register />
          </Suspense>
        ),
      },
      {
        path: '/',
        element: <ProtectedRoute />,
        children: [
          {
            path: '/',
            element: (
              <Suspense fallback={<LoadingSpinner />}>
                <Dashboard />
              </Suspense>
            ),
          },
          {
            path: '/profile',
            element: (
              <Suspense fallback={<LoadingSpinner />}>
                <Profile />
              </Suspense>
            ),
          },
          {
            path: '/resources',
            element: (
              <Suspense fallback={<LoadingSpinner />}>
                <ResourceLibrary />
              </Suspense>
            ),
          },
        ],
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
