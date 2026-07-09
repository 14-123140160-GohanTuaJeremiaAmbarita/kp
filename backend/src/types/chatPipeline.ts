export interface DashboardStats {
  totalEmployees: number;
  totalComputers: number;
  activeComputers: number;
  inactiveComputers: number;
  totalMonitors: number;
  activeMonitors: number;
  totalPrinters: number;
  activePrinters: number;
  totalCctvUnits: number;
  totalLicenses: number;
  totalTickets: number;
  openTickets: number;
  resolvedTickets: number;
  totalWorkOrders: number;
  openWorkOrders: number;
  closedWorkOrders: number;
  completionRate: number;
  averageDowntime: number;
  ticketsByCategory: { name: string; value: number }[];
  ticketsByPriority: { name: string; value: number }[];
  computersByBrand: { name: string; value: number }[];
  computersByType: { name: string; value: number }[];
  ticketsByDepartment: { name: string; value: number }[];
  employeesByDepartment: { name: string; value: number }[];
  assetsByDepartment: { name: string; computers: number; monitors: number; printers: number }[];
  woStatus: { name: string; value: number }[];
  woByType: { name: string; value: number }[];
  woByDifficulty: { name: string; value: number }[];
  woByCause: { name: string; value: number }[];
  woByPic: { name: string; total: number; closed: number; averageDowntime: number }[];
  woMonthlyTrend: { month: string; total: number; closed: number; open: number }[];
  computerStatus: { name: string; value: number }[];
  devicesByTypeAndStatus: { type: string; y: number; n: number; p: number }[];
  devicesByUsed: { type: string; user: number; nonUser: number }[];
  devicesByAgeAndCondition: { type: string; location: string; ageGroup: '<= 6 Years' | '> 6 Years'; condition: 'Good' | 'Not Good'; count: number }[];
  lastUpdated: string;
}

export interface SqlQueryResponse {
  requiresQuery: boolean;
  sql: string | null;
  reasoning: string;
}
