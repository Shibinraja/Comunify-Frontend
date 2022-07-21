import React from "react";
import PublicRoute from "../../../routes/PublicRoute";
import { RoutesArray } from "../../../interface/interface";
import CreateNewPassword from "../createNewPassword/pages/CreateNewPassword";
import Subscription from "../subscription/pages/Subscription";
import Welcome from "../welcome/pages/Welcome";
import Integration from "../integration/pages/Integration";
import SubscriptionExpired from "../subscriptionExpired/pages/SubscriptionExpired";
import PrivateRoute from 'routes/PrivateRoute';
import GuestRoute from 'routes/GuestGuard';

const SignIn = React.lazy(() => import("../signIn/pages/SignIn"));
const SignUp = React.lazy(() => import("../signUp/pages/SignUp"));
const ForgotPassword = React.lazy(() => import("../forgotPassword/pages/ForgotPassword"));
const CreateWorkSpace = React.lazy(()=> import("../createWorkSpace/pages/CreateWorkSpace"));
const ResendVerificationMail = React.lazy(()=> import("../resendVerificationMail/ResendVerification"))
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
        path: "/create-workspace",
        element: (
          <PrivateRoute>
            <CreateWorkSpace />
          </PrivateRoute>
        ),
      },
      {
        path: "/forgot-password",
        element: (
          <PublicRoute>
            <ForgotPassword />
          </PublicRoute>
        )
      },
      {
        path: "/create-password",
        element: (
          <PublicRoute>
            <CreateNewPassword />
          </PublicRoute>
        )
      },
      {
        path: "/resend-mail",
        element: (
           <GuestRoute>
            <ResendVerificationMail />
          </GuestRoute>
        )
      },
      {
        element: (
          <PrivateRoute>
            <Welcome/>
          </PrivateRoute>
        ),
        path: "/welcome",
      },
      {
        element: (
          <PrivateRoute>
            <Integration/>
          </PrivateRoute>
        ),
        path: "/integration",
      },
      {
        element: (
          <PrivateRoute>
            <Subscription/>
          </PrivateRoute>
        ),
        path: "/subscription",
      },
      {
        element: (
          <PrivateRoute>
            <SubscriptionExpired/>
          </PrivateRoute>
        ),
        path: "/subscription/expired",
      },
    ],
  },
];

export default authRoutes;
