export interface DashboardStats {
  totalEmployees: number;
  totalComputers: number;
  totalTickets: number;
  openTickets: number;
  resolvedTickets: number;
  totalWorkOrders: number;
  ticketsByCategory: { name: string; value: number }[];
  ticketsByPriority: { name: string; value: number }[];
  computersByBrand: { name: string; value: number }[];
  ticketsByDepartment: { name: string; value: number }[];
  employeesByDepartment: { name: string; value: number }[];
  woStatus: { name: string; value: number }[];
  computerStatus: { name: string; value: number }[];
}

export interface SqlQueryResponse {
  requiresQuery: boolean;
  sql: string | null;
  reasoning: string;
}
