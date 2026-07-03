import { BaseRepository } from './base.repository';
import { Karyawan } from '../types/employee';

export class EmployeeRepository extends BaseRepository<Karyawan> {
  public async getAll(): Promise<Karyawan[]> {
    return await this.db.getKaryawan();
  }

  public async getById(id: string): Promise<Karyawan | undefined> {
    const user = await this.db.getUserByUsername(id);
    if (user) return user;

    const list = await this.db.getKaryawan();
    return list.find(k => k.NIK === id);
  }

  public async verifyLogin(nik: string, pass: string): Promise<Karyawan | undefined> {
    const user = await this.db.verifyEmployeeLogin(nik, pass);
    return user || undefined;
  }

  public async register(nrp: string, name: string, dept: string, pass: string): Promise<Karyawan | null> {
    return await this.db.registerEmployee(nrp, name, dept, pass);
  }

  public async getByDepartemen(dept: string): Promise<Karyawan[]> {
    const list = await this.db.getKaryawan();
    return list.filter(k => k.Departemen.toLowerCase() === dept.toLowerCase());
  }

  public async deleteUser(username: string): Promise<void> {
    await this.db.deleteUserByUsername(username);
  }
}
