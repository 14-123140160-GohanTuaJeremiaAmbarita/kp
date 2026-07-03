import { TicketRepository } from '../repositories/ticket.repository';
import { Ticket } from '../types/ticket';

export class TicketService {
  private ticketRepo = new TicketRepository();

  public async getAllTickets(): Promise<Ticket[]> {
    return await this.ticketRepo.getAll();
  }

  public async getTicketById(ticketId: string): Promise<Ticket | undefined> {
    return await this.ticketRepo.getById(ticketId);
  }

  public async getTicketsByKaryawan(nik: string): Promise<Ticket[]> {
    return await this.ticketRepo.getByKaryawanNik(nik);
  }

  public async getTicketsByStatus(status: Ticket['Status']): Promise<Ticket[]> {
    return await this.ticketRepo.getByStatus(status);
  }
}
