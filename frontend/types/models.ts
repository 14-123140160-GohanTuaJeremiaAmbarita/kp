export interface Karyawan {
  NIK: string;
  Nama: string;
  Departemen: string;
  Jabatan: string;
  Email: string;
  Status: 'Active' | 'Inactive';
}

export interface Computer {
  AssetID: string;
  UserNIK: string;
  Brand: string;
  Model: string;
  OS: string;
  Status: 'Active' | 'Maintenance' | 'Scrapped';
}

export interface Ticket {
  TicketID: string;
  KaryawanNIK: string;
  Issue: string;
  Category: 'Software' | 'Hardware' | 'Network' | 'System';
  Status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  CreatedDate: string;
  Priority: 'Low' | 'Medium' | 'High' | 'Urgent';
}

export interface WorkOrder {
  WOID: string;
  TicketID: string;
  AssignedTo: string;
  ActionTaken: string;
  CompletionDate: string;
  Status: 'Pending' | 'In Progress' | 'Completed';
}

export interface Feedback {
  FeedbackID: string;
  MessageID: string;
  Question: string;
  SqlQuery: string;
  AnswerText: string;
  Score: number; // 1 = Thumbs Up, -1 = Thumbs Down
  CreatedDate: string;
}

export interface Memory {
  MemoryID: string;
  UserNIK: string;
  ConversationID?: string;
  FactText: string;
  CreatedDate: string;
}

export interface Learning {
  LearningID: string;
  Question: string;
  SqlQuery: string;
  AnswerText: string;
  Score: number;
  CreatedDate: string;
}

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
