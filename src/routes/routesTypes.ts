import { ReactElement } from 'react';

export interface Props {
  children: ReactElement;
}

export type PublicRouteState = {
  route: string;
};

export type PublicRouteStateValues =
  | { type: 'SET_WELCOME_ROUTE'; payload: string }
  | { type: 'SET_WORKSPACE_ROUTE'; payload: string }
  | { type: 'SET_DASHBOARD_ROUTE'; payload: string }
  | { type: 'SET_RESEND_VERIFICATION_ROUTE'; payload: string }
  | { type: 'SET_SUPER_ADMIN_USER_ROUTE'; payload: string };
