export type AnalyticsRange = {
  from: string;
  to: string;
  timezone: string;
  preset: string;
};

export type AnalyticsOverview = {
  users: number;
  activeUsers: number;
  newUsers: number;
  sessions: number;
  pageViews: number;
  engagementRate: number;
  averageSessionDuration: number;
  purchaseEvents: number;
  searchEvents: number;
  checkoutConversionRate: number;
};

export type AnalyticsChannelRow = {
  channel: string;
  sessions: number;
  users: number;
};

export type AnalyticsSourceRow = {
  source: string;
  medium: string;
  sessions: number;
  users: number;
};

export type AnalyticsCountryRow = {
  country: string;
  sessions: number;
  users: number;
};

export type AnalyticsDeviceRow = {
  device: string;
  sessions: number;
  users: number;
};

export type AnalyticsPageRow = {
  pagePath: string;
  pageViews: number;
  sessions: number;
};

export type AnalyticsTopViewed = {
  itemId: string;
  itemName: string;
  views: number;
};

export type AnalyticsTopAdded = {
  itemId: string;
  itemName: string;
  adds: number;
};

export type AnalyticsCampaignRow = {
  campaign: string;
  source: string;
  sessions: number;
  users: number;
};

export type AnalyticsRealtime = {
  available: boolean;
  activeUsers: number | null;
};

export type AnalyticsGa4Status =
  | "oauth_not_configured"
  | "not_connected"
  | "unavailable"
  | "ok";

export type AnalyticsGa4 = {
  available: boolean;
  connected: boolean;
  needsConnect: boolean;
  status: AnalyticsGa4Status;
  error: string | null;
  propertyId?: string | null;
  googleEmail?: string;
  overview: AnalyticsOverview;
  realtime: AnalyticsRealtime;
  traffic: {
    byChannel: AnalyticsChannelRow[];
    bySourceMedium: AnalyticsSourceRow[];
    byCountry: AnalyticsCountryRow[];
    byDevice: AnalyticsDeviceRow[];
    topPages: AnalyticsPageRow[];
  };
  products: {
    viewItem: number;
    addToCart: number;
    beginCheckout: number;
    search: number;
    topViewed: AnalyticsTopViewed[];
    topAddedToCart: AnalyticsTopAdded[];
  };
  campaigns: AnalyticsCampaignRow[];
};

export type AnalyticsSalesDay = {
  date: string;
  orders: number;
  completedOrders: number;
  revenue: number;
};

export type AnalyticsSales = {
  available: boolean;
  error: string | null;
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  revenue: number;
  averageOrderValue: number;
  byDay: AnalyticsSalesDay[];
};

export type AnalyticsDashboardResponse = {
  range: AnalyticsRange;
  ga4: AnalyticsGa4;
  sales: AnalyticsSales;
};
