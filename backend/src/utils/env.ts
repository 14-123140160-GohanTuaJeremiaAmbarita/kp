import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

export function loadEnv() {
  const localEnv = path.resolve(process.cwd(), '.env');
  const backendEnv = path.resolve(process.cwd(), 'backend/.env');

  if (fs.existsSync(localEnv)) {
    dotenv.config({ path: localEnv });
  } else if (fs.existsSync(backendEnv)) {
    dotenv.config({ path: backendEnv });
  } else {
    // Fallback to default behavior
    dotenv.config();
  }
}
