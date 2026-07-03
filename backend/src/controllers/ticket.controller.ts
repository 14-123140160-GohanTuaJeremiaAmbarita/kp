import { Request, Response, NextFunction } from 'express';
import { TicketService } from '../services/ticket.service';

export class TicketController {
  private ticketService = new TicketService();

  public getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.ticketService.getAllTickets();
      res.json({ success: true, count: data.length, tickets: data });
    } catch (error) {
      next(error);
    }
  };

  public getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const data = await this.ticketService.getTicketById(id as string);
      if (!data) {
        return res.status(404).json({ success: false, error: `Tiket dengan ID '${id}' tidak ditemukan.` });
      }
      res.json({ success: true, ticket: data });
    } catch (error) {
      next(error);
    }
  };
}
