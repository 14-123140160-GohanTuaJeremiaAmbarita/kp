import { Request, Response, NextFunction } from 'express';
import { WorkOrderService } from '../services/workorder.service';

export class WorkOrderController {
  private woService = new WorkOrderService();

  public getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.woService.getAllWorkOrders();
      res.json({ success: true, count: data.length, workorders: data });
    } catch (error) {
      next(error);
    }
  };

  public getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const data = await this.woService.getWorkOrderById(id as string);
      if (!data) {
        return res.status(404).json({ success: false, error: `Work Order dengan ID '${id}' tidak ditemukan.` });
      }
      res.json({ success: true, workorder: data });
    } catch (error) {
      next(error);
    }
  };
}
