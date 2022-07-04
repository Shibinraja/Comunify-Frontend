import React from "react";
import PublicRoute from "../../../routes/PublicRoute";
import { RoutesArray } from "../../../interface/interface";
import CreateNewPassword from "../createNewPassword/pages/CreateNewPassword";
import ResendVerificationMail from "../resendVerificationMail/ResendVerification";
import Subscription from "../subscription/pages/Subscription";
import Welcome from "../welcome/pages/Welcome";
import Integration from "../integration/pages/Integration";
import SubscriptionExpired from "../subscriptionExpired/pages/SubscriptionExpired";
import CreateWorkSpace from '../createWorkSpace/pages/CreateWorkSpace';
import PrivateRoute from 'routes/PrivateRoute';

const SignIn = React.lazy(() => import("../signIn/pages/SignIn"));
const SignUp = React.lazy(() => import("../signUp/pages/SignUp"));
const ForgotPassword = React.lazy(
  () => import("../forgotPassword/pages/ForgotPassword")
);
const AuthLayout = React.lazy(() => import("../../../layout/AuthLayout"));

let authRoutes: RoutesArray[] = [
  {
    element: <AuthLayout />,
    path: "/",
    children: [
      {
        path: "/",
        element: (
          <PublicRoute>
            <SignIn />
          </PublicRoute>
        ),
      },
      {
        path: "/signup",
        element: (
          <PublicRoute>
            <SignUp />
          </PublicRoute>
        ),
      },
      {
        path: "/createWorkSpace",
        element: (
          <PrivateRoute>
            <CreateWorkSpace />
          </PrivateRoute>
        ),
      },
      {
        element: (
          <PublicRoute>
            <ForgotPassword />
          </PublicRoute>
        ),
        path: "/forgot-password",
      },
      {
        element: (
          <PublicRoute>
            <CreateNewPassword />
          </PublicRoute>
        ),
        path: "/forgot-password/:id",
      },
      {
        element: (
          <PublicRoute>
            <ResendVerificationMail />
          </PublicRoute>
        ),
        path: "/resend-mail",
      },
      {
        element: (
          <PublicRoute>
            <Welcome />
          </PublicRoute>
        ),
        path: "/welcome",
      },
      {
        element: (
          <PublicRoute>
            <Integration />
          </PublicRoute>
        ),
        path: "/integration",
      },
      {
        element: (
          <PublicRoute>
            <Subscription />
          </PublicRoute>
        ),
        path: "/subscription",
      },
      {
        element: (
          <PublicRoute>
            <SubscriptionExpired />
          </PublicRoute>
        ),
        path: "/subscription/expired/:id",
      },
    ],
  },
];

export default authRoutes;
