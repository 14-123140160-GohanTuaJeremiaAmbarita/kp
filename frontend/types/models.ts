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
