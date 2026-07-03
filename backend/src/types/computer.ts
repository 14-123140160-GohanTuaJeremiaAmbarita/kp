export interface Computer {
  AssetID: string;
  UserNIK: string;
  Brand: string;
  Model: string;
  OS: string;
  Status: 'Active' | 'Maintenance' | 'Scrapped';
}
