import { getDbInstance } from '../config/database';

export abstract class BaseRepository<T> {
  protected db = getDbInstance();

  abstract getAll(): Promise<T[]>;
  abstract getById(id: string): Promise<T | undefined>;
}
