import { TooltipProvider } from "@/components/ui/tooltip";
import axiosInstance from "@/lib/axios";
import React, { ComponentProps, useEffect } from "react";
import {
  createBrowserRouter,
  Navigate,
  Outlet,
  RouterProvider,
  useLocation,
} from "react-router-dom";
import { SWRConfig } from "swr";
import { ConfigureDatasets } from "./components/configurations/ConfigureDatasets";
import { ConfigureDataviews } from "./components/configurations/ConfigureDataviews";
import { ConfigureGrouping } from "./components/configurations/ConfigureGrouping";
import ErrorBoundary from "./components/ErrorBoundary";
import Layout from "./components/Layout";
import LogoSpinner from "./components/LogoSpinner";
import { Toaster } from "./components/ui/toaster";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import ForgotPassword from "./pages/auth/ForgotPassword";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Config from "./pages/ConfigureView";
import Data from "./pages/Data";
import Relationships from "./pages/Relationship";

const PrivateRoute: React.FC = () => {
  const { user, loading, refreshUserSession } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!user && !loading) {
      refreshUserSession();
    }
  }, [user, loading, refreshUserSession]);

  if (loading) {
    return <LogoSpinner />;
  }

  if (!user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

const router = createBrowserRouter([
  {
    path: "auth/",
    children: [
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "register",
        element: <Register />,
      },
      {
        path: "forgot-password",
        element: <ForgotPassword />,
      },
    ],
  },
  {
    path: "/",
    element: <PrivateRoute />,
    children: [
      {
        element: <Layout />,
        children: [
          {
            path: "",
            element: <Navigate to="/configuration" replace />,
          },
          {
            path: "configuration",
            children: [
              {
                path: "",
                element: <Config />,
              },
              {
                path: "dataset",
                element: <ConfigureDatasets />,
              },
              {
                path: "dataview",
                element: <ConfigureDataviews />,
              },
              {
                path: "groups",
                element: <ConfigureGrouping />,
              },
            ],
          },
          {
            path: "data",
            element: <Data />,
          },
          {
            path: "relationships",
            element: <Relationships />,
          },
        ],
      },
    ],
  },
]);

const swrConfig = {
  fetcher: (res: string) => axiosInstance.get(res).then((r) => r.data),
  focusThrottleInterval: 30000,
} satisfies ComponentProps<typeof SWRConfig>["value"];

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <SWRConfig value={swrConfig}>
          <TooltipProvider>
            <Toaster />
            <RouterProvider router={router} />
          </TooltipProvider>
        </SWRConfig>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
