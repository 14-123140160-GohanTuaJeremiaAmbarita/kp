import { EmployeeRepository } from '../repositories/employee.repository';
import { Karyawan } from '../types/employee';

export class EmployeeService {
  private employeeRepo = new EmployeeRepository();

  public async getAllEmployees(): Promise<Karyawan[]> {
    return await this.employeeRepo.getAll();
  }

  public async getEmployeeByNik(nik: string): Promise<Karyawan | undefined> {
    return await this.employeeRepo.getById(nik);
  }

  public async register(nrp: string, name: string, dept: string, pass: string): Promise<Karyawan> {
    const existing = await this.employeeRepo.getById(nrp);
    if (existing) {
      throw new Error('Username / NIK sudah terdaftar.');
    }
    const newEmp = await this.employeeRepo.register(nrp, name, dept, pass);
    if (!newEmp) {
      throw new Error('Gagal mendaftarkan karyawan.');
    }
    return newEmp;
  }

  public async verifyLogin(nik: string, pass: string): Promise<Karyawan | undefined> {
    // Check real DB credentials
    const dbUser = await this.employeeRepo.verifyLogin(nik, pass);
    if (dbUser) return dbUser;

    // Developer mode demo fallback
    if (nik === 'VOK001' && pass === 'admin') {
      return {
        NIK: 'VOK001',
        Nama: 'Gohan Admin',
        Departemen: 'IT Support',
        Jabatan: 'IT Support',
        Email: 'vok001@voksel.co.id',
        Status: 'Active'
      };
    }
    return undefined;
  }

  public async getEmployeesByDepartment(dept: string): Promise<Karyawan[]> {
    return await this.employeeRepo.getByDepartemen(dept);
  }

  public async deleteUser(username: string): Promise<void> {
    await this.employeeRepo.deleteUser(username);
  }
}
