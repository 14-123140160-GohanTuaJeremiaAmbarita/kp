import { Request, Response, NextFunction } from 'express';
import { EmployeeService } from '../services/employee.service';
import { generateToken } from '../utils/auth';

export class AuthController {
  private employeeService = new EmployeeService();

  public register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { username, nama, departemen, sandi } = req.body;
      if (!username || !nama || !departemen || !sandi) {
        return res.status(400).json({ success: false, error: 'Semua kolom input wajib diisi.' });
      }

      const newEmployee = await this.employeeService.register(username, nama, departemen, sandi);
      
      res.json({
        success: true,
        message: 'Pendaftaran karyawan baru berhasil.',
        user: newEmployee
      });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message || 'Gagal mendaftar.' });
    }
  };

  public login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { nik, password } = req.body;
      if (!nik || !password) {
        return res.status(400).json({ success: false, error: 'Username dan sandi wajib diisi.' });
      }

      const employee = await this.employeeService.verifyLogin(nik, password);
      if (!employee) {
        return res.status(401).json({ success: false, error: 'Username atau sandi salah.' });
      }

      // Generate JWT Token containing user info claims
      const token = generateToken({
        NIK: employee.NIK,
        Nama: employee.Nama,
        Departemen: employee.Departemen,
        Role: employee.Jabatan === 'IT Support' ? 'IT Support' : 'Employee'
      });

      res.json({
        success: true,
        token,
        user: employee
      });
    } catch (error) {
      next(error);
    }
  };

  public getCurrentSession = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      const employee = await this.employeeService.getEmployeeByNik(user.NIK);
      
      if (!employee) {
        return res.status(404).json({ success: false, error: 'User corporate session not found.' });
      }

      res.json({
        success: true,
        user: employee
      });
    } catch (error) {
      next(error);
    }
  };

  public deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { username } = req.params;
      const user = (req as any).user;

      if (user?.Role !== 'IT Support') {
        return res.status(403).json({ success: false, error: 'Akses ditolak: Hanya IT Support yang dapat menghapus akun.' });
      }

      if (username === 'admin' || username === 'VOK001') {
        return res.status(400).json({ success: false, error: 'Akun administrator bawaan tidak dapat dihapus.' });
      }

      await this.employeeService.deleteUser(username as string);

      res.json({
        success: true,
        message: `Akun dengan username "${username}" berhasil dihapus.`
      });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message || 'Gagal menghapus user.' });
    }
  };
}
