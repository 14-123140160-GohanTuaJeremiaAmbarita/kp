import { BaseRepository } from './base.repository';
import { Computer } from '../types/computer';

export class AssetRepository extends BaseRepository<Computer> {
  public async getAll(): Promise<Computer[]> {
    return await this.db.getComputer();
  }

  public async getById(id: string): Promise<Computer | undefined> {
    const list = await this.db.getComputer();
    return list.find(c => c.AssetID === id);
  }

  public async getByUserNik(nik: string): Promise<Computer[]> {
    const list = await this.db.getComputer();
    return list.filter(c => c.UserNIK === nik);
  }

  public async getByBrand(brand: string): Promise<Computer[]> {
    const list = await this.db.getComputer();
    return list.filter(c => c.Brand.toLowerCase() === brand.toLowerCase());
  }
}
