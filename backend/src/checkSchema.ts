import mssql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

const companyConfig: mssql.config = {
  server: process.env.DB_SERVER || '192.168.9.14',
  port: parseInt(process.env.DB_PORT || '1433', 10),
  database: process.env.DB_DATABASE || 'ITOpr',
  user: process.env.DB_USER || 'itmagang',
  password: process.env.DB_PASSWORD || 'ItMangag@2026!',
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
  connectionTimeout: 10000,
  requestTimeout: 10000
};

const historyConfig: mssql.config = {
  server: process.env.AI_DB_SERVER || 'localhost',
  port: parseInt(process.env.AI_DB_PORT || '1433', 10),
  database: process.env.AI_DB_DATABASE || 'SmartIT_AI',
  user: process.env.AI_DB_USER || 'smartit_ai',
  password: process.env.AI_DB_PASSWORD || 'SmartIT@2026',
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
  connectionTimeout: 10000,
  requestTimeout: 10000
};

async function run() {
  console.log('Connecting to Company DB (ITOpr)...');
  try {
    const pool = await mssql.connect(companyConfig);
    console.log('Connected!');
    
    // Check tables list
    const tables = await pool.request().query("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'");
    console.log('Tables in ITOpr:', tables.recordset.map(r => r.TABLE_NAME));

    for (const table of ['TD_karyawan', 'TD_COMPUTER', 'TD_TICKET', 'TD_WO']) {
      console.log(`\nColumns in ${table}:`);
      const cols = await pool.request().query(`SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '${table}'`);
      console.log(cols.recordset);
    }
    
    await pool.close();
  } catch (err: any) {
    console.error('Error with Company DB:', err.message);
  }

  console.log('\nConnecting to History DB (SmartIT_AI)...');
  try {
    const pool = await mssql.connect(historyConfig);
    console.log('Connected!');
    
    const tables = await pool.request().query("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'");
    console.log('Tables in SmartIT_AI:', tables.recordset.map(r => r.TABLE_NAME));

    for (const table of ['AI_Conversation', 'AI_Message', 'AI_Feedback', 'TD_MEMORY', 'AI_LearnedWords']) {
      console.log(`\nColumns in ${table}:`);
      const cols = await pool.request().query(`SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '${table}'`);
      console.log(cols.recordset);
    }
    
    await pool.close();
  } catch (err: any) {
    console.error('Error with History DB:', err.message);
  }
}

run();
