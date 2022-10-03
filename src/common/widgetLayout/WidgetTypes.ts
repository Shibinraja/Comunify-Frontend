import { SidePanelWidgetsData } from '../../modules/dashboard/interface/dashboard.interface';

export type WidgetIdentification = {
  widgetKey: string;
  sidePanelWidgetsData?: SidePanelWidgetsData[];
  widgetRemoved: string;
};

export type PanelWidgetsType = {
  id?: string;
  layout: {
    x: number;
    y: number;
    w: number;
    h: number;
    i: string;
  };
  widget: { widgetLocation: string; invocationType: number; widgetId: string };
  isAssigned: boolean;
};

export type WidgetsArrayBody = {
  id: string | undefined;
  widgetId: string;
  config?: {
    minWidth?: string;
    maxWidth?: string;
    h?: number;
    w?: number;
    x?: number;
    y?: number;
  };
  order: number;
  status: string;
};

export interface HealthScoreWidgetData {
  title: string;
  percentage: number;
}

export interface WidgetComponentProps {
  isManageMode: boolean | undefined;
  widget: PanelWidgetsType;
  isShrunk?: boolean;
  // eslint-disable-next-line no-unused-vars
  removeWidgetFromDashboard: (selectedWidget: PanelWidgetsType) => void;
}

export interface WidgetContainerProps {
  isManageMode: boolean | undefined
  widgets: PanelWidgetsType[],
  setWidgets?: React.Dispatch<React.SetStateAction<PanelWidgetsType[] | []>>;
  setTransformedWidgetData?: React.Dispatch<React.SetStateAction<unknown[] | []>>;
}
