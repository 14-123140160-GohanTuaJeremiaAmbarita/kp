import { Database } from './database';

export const getHistoryDbInstance = () => {
  return Database.getInstance();
};
