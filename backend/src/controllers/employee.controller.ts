import { Request, Response, NextFunction } from 'express';
import { EmployeeService } from '../services/employee.service';

export class EmployeeController {
  private employeeService = new EmployeeService();

  public getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.employeeService.getAllEmployees();
      res.json({ success: true, count: data.length, employees: data });
    } catch (error) {
      next(error);
    }
  };

  public getByNik = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { nik } = req.params;
      const data = await this.employeeService.getEmployeeByNik(nik as string);
      if (!data) {
        return res.status(404).json({ success: false, error: `Karyawan dengan NIK '${nik}' tidak ditemukan.` });
      }
      res.json({ success: true, employee: data });
    } catch (error) {
      next(error);
    }
  };
}
