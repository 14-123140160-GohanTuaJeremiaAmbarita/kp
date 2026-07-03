import app from '../src/app';
import path from 'path';
import { connectDatabase } from './config/database';

const PORT = process.env.PORT || 5000;

async function startServer() {
  console.log("=========================================");
  console.log("     SMART IT ASSISTANT BACKEND");
  console.log("=========================================");

  // Connect to databases
  await connectDatabase();

  console.log("=========================================");
  console.log("SERVER");
  console.log("=========================================");
  console.log(`Server Running : http://localhost:${PORT}`);
  console.log("");
  console.log("=========================================");
  console.log("API");
  console.log("=========================================");
  console.log(`http://localhost:${PORT}/api/chat`);
  console.log(`http://localhost:${PORT}/api/history`);
  console.log(`http://localhost:${PORT}/api/employees`);
  console.log(`http://localhost:${PORT}/api/tickets`);
  console.log(`http://localhost:${PORT}/api/workorders`);
  console.log(`http://localhost:${PORT}/api/assets`);
  console.log(`http://localhost:${PORT}/api/dashboard`);
  console.log(`http://localhost:${PORT}/api/export`);
  console.log("");
  console.log("=========================================");
  console.log("Backend Ready");

  app.listen(Number(PORT), '0.0.0.0', () => {
    // Already printed above
  });
}

// Access express globally if CJS bundler uses it
import express from 'express';

startServer().catch((error) => {
  console.error('[Server Error] Critical failure during startup:', error);
});
