import { AssetRepository } from '../repositories/asset.repository';
import { Computer } from '../types/computer';

export class AssetService {
  private assetRepo = new AssetRepository();

  public async getAllAssets(): Promise<Computer[]> {
    return await this.assetRepo.getAll();
  }

  public async getAssetById(assetId: string): Promise<Computer | undefined> {
    return await this.assetRepo.getById(assetId);
  }

  public async getAssetsByUser(nik: string): Promise<Computer[]> {
    return await this.assetRepo.getByUserNik(nik);
  }

  public async getAssetsByBrand(brand: string): Promise<Computer[]> {
    return await this.assetRepo.getByBrand(brand);
  }
}
