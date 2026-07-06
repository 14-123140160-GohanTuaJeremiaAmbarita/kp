import { Request, Response, NextFunction } from 'express';
import { HistoryRepository } from '../repositories/history.repository';
import { generateExcelBuffer } from '../utils/exportExcel';

export class ExportController {
  private historyRepo = new HistoryRepository();

  public exportData = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { sql } = req.body;
      if (!sql) {
        return res.status(400).json({ success: false, error: 'SQL query is required for export' });
      }

      const execResult = await this.historyRepo.executeSQL(sql);
      if (!execResult.success || !execResult.data || execResult.data.length === 0) {
        return res.status(400).json({ success: false, error: execResult.error || 'No data found to export' });
      }

      const rows = execResult.data;
      const buffer = await generateExcelBuffer(rows);

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="smartit_export_${Date.now()}.xlsx"`);
      return res.send(buffer);
    } catch (error) {
      next(error);
    }
  };
}
