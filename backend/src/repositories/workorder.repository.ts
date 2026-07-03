import { BaseRepository } from './base.repository';
import { WorkOrder } from '../types/workorder';

export class WorkOrderRepository extends BaseRepository<WorkOrder> {
  public async getAll(): Promise<WorkOrder[]> {
    return await this.db.getWO();
  }

  public async getById(id: string): Promise<WorkOrder | undefined> {
    const list = await this.db.getWO();
    return list.find(w => w.WOID === id);
  }

  public async getByTicketId(ticketId: string): Promise<WorkOrder[]> {
    const list = await this.db.getWO();
    return list.filter(w => w.TicketID === ticketId);
  }

  public async getByTechnician(name: string): Promise<WorkOrder[]> {
    const list = await this.db.getWO();
    return list.filter(w => w.AssignedTo.toLowerCase() === name.toLowerCase());
  }
}
