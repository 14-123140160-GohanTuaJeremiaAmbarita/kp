export interface WorkOrder {
  WOID: string;
  TicketID: string;
  AssignedTo: string;
  ActionTaken: string;
  CompletionDate: string;
  Status: 'Pending' | 'In Progress' | 'Completed';
}
