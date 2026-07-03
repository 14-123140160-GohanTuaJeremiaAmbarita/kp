import { WorkOrderRepository } from '../repositories/workorder.repository';
import { WorkOrder } from '../types/workorder';

export class WorkOrderService {
  private woRepo = new WorkOrderRepository();

  public async getAllWorkOrders(): Promise<WorkOrder[]> {
    return await this.woRepo.getAll();
  }

  public async getWorkOrderById(id: string): Promise<WorkOrder | undefined> {
    return await this.woRepo.getById(id);
  }

  public async getWorkOrdersByTicket(ticketId: string): Promise<WorkOrder[]> {
    return await this.woRepo.getByTicketId(ticketId);
  }

  public async getWorkOrdersByTechnician(name: string): Promise<WorkOrder[]> {
    return await this.woRepo.getByTechnician(name);
  }
}
