import { BaseRepository } from './base.repository';
import { Ticket } from '../types/ticket';

export class TicketRepository extends BaseRepository<Ticket> {
  public async getAll(): Promise<Ticket[]> {
    return await this.db.getTicket();
  }

  public async getById(id: string): Promise<Ticket | undefined> {
    const list = await this.db.getTicket();
    return list.find(t => t.TicketID === id);
  }

  public async getByKaryawanNik(nik: string): Promise<Ticket[]> {
    const list = await this.db.getTicket();
    return list.filter(t => t.KaryawanNIK === nik);
  }

  public async getByStatus(status: Ticket['Status']): Promise<Ticket[]> {
    const list = await this.db.getTicket();
    return list.filter(t => t.Status === status);
  }
}
