import { Request, Response, NextFunction } from 'express';

/**
 * Authentication middleware scaffold.
 * Verifies the corporate session header or injects the default corporate NIK 'VOK001' for development.
 */
import { verifyToken } from '../utils/auth';

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    if (decoded) {
      (req as any).user = decoded;
      return next();
    } else {
      return res.status(401).json({ success: false, error: 'Sesi login tidak valid atau sudah kedaluwarsa. Silakan login kembali.' });
    }
  }

  // Fallback untuk mode pengembangan dan kompatibilitas lama
  const userNIK = req.headers['x-user-nik'] || 'VOK001';
  (req as any).user = {
    NIK: userNIK,
    Nama: userNIK === 'VOK001' ? 'Gohan Admin' : 'Karyawan',
    Departemen: userNIK === 'VOK001' ? 'IT Support' : 'Corporate',
    Role: userNIK === 'VOK001' ? 'IT Support' : 'Employee'
  };

  next();
}
