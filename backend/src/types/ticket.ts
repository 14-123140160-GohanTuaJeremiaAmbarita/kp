export interface Ticket {
  TicketID: string;
  KaryawanNIK: string;
  Issue: string;
  Category: 'Software' | 'Hardware' | 'Network' | 'System';
  Status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  CreatedDate: string;
  Priority: 'Low' | 'Medium' | 'High' | 'Urgent';
}
