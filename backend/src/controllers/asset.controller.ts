import { Request, Response, NextFunction } from 'express';
import { AssetService } from '../services/asset.service';

export class AssetController {
  private assetService = new AssetService();

  public getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
       const data = await this.assetService.getAllAssets();
       res.json({ success: true, count: data.length, assets: data });
    } catch (error) {
      next(error);
    }
  };

  public getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const data = await this.assetService.getAssetById(id as string);
      if (!data) {
        return res.status(404).json({ success: false, error: `Aset komputer dengan ID '${id}' tidak ditemukan.` });
      }
      res.json({ success: true, asset: data });
    } catch (error) {
      next(error);
    }
  };
}
