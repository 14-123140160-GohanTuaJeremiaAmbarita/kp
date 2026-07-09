import mssql from 'mssql';
import { v4 as uuidv4 } from 'uuid';
import { loadEnv } from '../utils/env';
import { Karyawan } from '../types/employee';
import { Computer } from '../types/computer';
import { Ticket } from '../types/ticket';
import { WorkOrder } from '../types/workorder';
import { Conversation, Message, Feedback, Memory } from '../types/history';
import { DashboardStats } from '../types/chatPipeline';

loadEnv();

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
  connectionTimeout: 4000,
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
  connectionTimeout: 4000,
  requestTimeout: 10000
};

let companyPool: mssql.ConnectionPool | null = null;
let historyPool: mssql.ConnectionPool | null = null;
let isCompanyConnected = false;
let isHistoryConnected = false;

export async function connectDatabase() {
  // 1. Attempt Connection to Company Database (ITOpr)
  try {
    companyPool = await new mssql.ConnectionPool(companyConfig).connect();
    isCompanyConnected = true;
    console.log("================================");
    console.log("SQL SERVER CONNECTED");
    console.log("Database :", process.env.DB_DATABASE || 'ITOpr');
    console.log("================================");
  } catch (err: any) {
    console.error(`[SQL Server Error] Failed to connect to Company DB (ITOpr): ${err.message}`);
    companyPool = null;
    isCompanyConnected = false;
  }

  // 2. Attempt Connection to History/AI Database (SmartIT_AI)
  try {
    historyPool = await new mssql.ConnectionPool(historyConfig).connect();
    isHistoryConnected = true;
    console.log("History Database Connected (SmartIT_AI)");

    // Dynamically bootstrap tables in SmartIT_AI if they do not exist
    await ensureRealHistoryTablesExist(historyPool);
  } catch (err: any) {
    console.error(`[SQL Server Error] Failed to connect to AI DB (SmartIT_AI): ${err.message}`);
    historyPool = null;
    isHistoryConnected = false;
  }
}

async function ensureRealHistoryTablesExist(pool: mssql.ConnectionPool) {
  try {
    // 1. AI_Conversation
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='AI_Conversation' AND xtype='U')
      CREATE TABLE AI_Conversation (
        ConversationId UNIQUEIDENTIFIER PRIMARY KEY,
        Title NVARCHAR(255) NOT NULL,
        Description NVARCHAR(MAX) NULL,
        Model NVARCHAR(255) NULL,
        CreatedBy VARCHAR(50) NOT NULL,
        IsPinned BIT NOT NULL DEFAULT 0,
        IsArchived BIT NOT NULL DEFAULT 0,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        UpdatedAt DATETIME2 NOT NULL DEFAULT GETDATE()
      )
    `);

    // 2. AI_Message
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='AI_Message' AND xtype='U')
      CREATE TABLE AI_Message (
        MessageId UNIQUEIDENTIFIER PRIMARY KEY,
        ConversationId UNIQUEIDENTIFIER NOT NULL,
        Role NVARCHAR(50) NOT NULL,
        Content NVARCHAR(MAX) NOT NULL,
        SqlQuery NVARCHAR(MAX) NULL,
        SqlResult NVARCHAR(MAX) NULL,
        TokenUsage INT NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        Model NVARCHAR(255) NULL,
        PromptToken INT NULL,
        CompletionToken INT NULL,
        ResponseTimeMs INT NULL
      )
    `);

    // 3. AI_Feedback
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='AI_Feedback' AND xtype='U')
      CREATE TABLE AI_Feedback (
        FeedbackId UNIQUEIDENTIFIER PRIMARY KEY,
        MessageId UNIQUEIDENTIFIER NOT NULL,
        IsHelpful BIT NOT NULL,
        Comment NVARCHAR(MAX) NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE()
      )
    `);

    // 4. TD_MEMORY
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='TD_MEMORY' AND xtype='U')
      CREATE TABLE TD_MEMORY (
        MemoryID VARCHAR(50) PRIMARY KEY,
        UserNIK VARCHAR(50) NOT NULL,
        ConversationID VARCHAR(50) NULL,
        FactText NVARCHAR(MAX) NOT NULL,
        CreatedDate VARCHAR(50) NOT NULL
      )
    `);

    // 5. AI_LearnedWords
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='AI_LearnedWords' AND xtype='U')
      CREATE TABLE AI_LearnedWords (
        Word NVARCHAR(255) PRIMARY KEY,
        Correction NVARCHAR(255) NOT NULL
      )
    `);

    // 6. AI_Knowledge (Dynamic Schema & Tool Use)
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='AI_Knowledge' AND xtype='U')
      CREATE TABLE AI_Knowledge (
        KnowledgeId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        KnowledgeType NVARCHAR(50) NOT NULL,
        TableName NVARCHAR(100) NULL,
        ColumnName NVARCHAR(100) NULL,
        Metadata NVARCHAR(MAX) NULL,
        IsWhitelisted BIT NOT NULL DEFAULT 1,
        ReviewStatus NVARCHAR(50) NOT NULL DEFAULT 'Approved',
        LearnedBy VARCHAR(50) NULL,
        Confidence FLOAT NULL,
        UsageCount INT NOT NULL DEFAULT 0,
        LastRefreshed DATETIME2 NOT NULL DEFAULT GETDATE()
      )
    `);

    // 7. TD_users (for Auth storage in SmartIT_AI)
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='TD_users' AND xtype='U')
      CREATE TABLE TD_users (
        username VARCHAR(50) PRIMARY KEY,
        nama VARCHAR(100) NOT NULL,
        dept VARCHAR(100) NOT NULL,
        password VARCHAR(100) NOT NULL
      )
    `);

    // Seed default admin in SmartIT_AI if table is empty or admin doesn't exist
    const adminCheck = await pool.request().query("SELECT COUNT(*) as count FROM TD_users WHERE username = 'admin'");
    if (adminCheck.recordset && adminCheck.recordset[0].count === 0) {
      console.log("[Database Bootstrap] Seeding default admin user in SmartIT_AI TD_users table");
      await pool.request().query(`
        INSERT INTO TD_users (username, nama, dept, password)
        VALUES ('admin', 'Gohan Admin', 'IT Support', '$2b$10$tMh4E/8bNnU1u592xWep/.7E27gT60J.MsknI8Q/W3YvX3Z6F0vKy')
      `);
    }

    const devCheck = await pool.request().query("SELECT COUNT(*) as count FROM TD_users WHERE username = 'VOK001'");
    if (devCheck.recordset && devCheck.recordset[0].count === 0) {
      await pool.request().query(`
        INSERT INTO TD_users (username, nama, dept, password)
        VALUES ('VOK001', 'Gohan Admin', 'IT Support', '$2b$10$tMh4E/8bNnU1u592xWep/.7E27gT60J.MsknI8Q/W3YvX3Z6F0vKy')
      `);
    }

  } catch (err: any) {
    console.error('[SQL Server Error] Failed to bootstrap SmartIT_AI tables:', err.message);
  }
}

export function getCompanyDbPool(): mssql.ConnectionPool | null {
  return isCompanyConnected ? companyPool : null;
}

export function getHistoryDbPool(): mssql.ConnectionPool | null {
  return isHistoryConnected ? historyPool : null;
}

export function isUsingRealCompanyDb(): boolean {
  return isCompanyConnected;
}

export function isUsingRealHistoryDb(): boolean {
  return isHistoryConnected;
}

export class Database {
  private static instance: Database;

  private constructor() {
    // No more Alasql simulator initialization
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  // --- TD_karyawan ---
  public async getKaryawan(): Promise<Karyawan[]> {
    const pool = getCompanyDbPool();
    if (pool) {
      try {
        const res = await pool.request().query('SELECT Nrp, Name, Dept, status FROM TD_karyawan');
        return res.recordset.map((row: any) => ({
          NIK: row.Nrp ? row.Nrp.trim() : '',
          Nama: row.Name ? row.Name.trim() : '',
          Departemen: row.Dept ? row.Dept.trim() : '',
          Jabatan: 'Staff',
          Email: row.Nrp ? `${row.Nrp.trim().toLowerCase()}@voksel.co.id` : '',
          Status: row.status ? row.status.trim() : 'Active'
        }));
      } catch (err: any) {
        console.error('[Database] Failed to SELECT * FROM TD_karyawan:', err.message);
      }
    }
    return [];
  }

  // --- TD_COMPUTER ---
  public async getComputer(): Promise<Computer[]> {
    const pool = getCompanyDbPool();
    if (pool) {
      try {
        const res = await pool.request().query('SELECT CodeCpu, Nrp, CPU_Merk, CPU_Type, OS, Aktif FROM TD_computer');
        return res.recordset.map((row: any) => ({
          AssetID: row.CodeCpu ? row.CodeCpu.trim() : '',
          UserNIK: row.Nrp ? row.Nrp.trim() : '',
          Brand: row.CPU_Merk ? row.CPU_Merk.trim() : '',
          Model: row.CPU_Type ? row.CPU_Type.trim() : '',
          OS: row.OS ? row.OS.trim() : '',
          Status: (row.Aktif === 'Y' || row.Aktif === '1' || row.Aktif === 'Active' ? 'Active' : 'Maintenance') as 'Active' | 'Maintenance' | 'Scrapped'
        }));
      } catch (err: any) {
        console.error('[Database] Failed to SELECT * FROM TD_computer:', err.message);
      }
    }
    return [];
  }

  // --- TD_TICKET ---
  public async getTicket(): Promise<Ticket[]> {
    const pool = getCompanyDbPool();
    if (pool) {
      try {
        const res = await pool.request().query('SELECT NRP, name, problem, NoWO, tgl FROM TD_TICKET');
        return res.recordset.map((row: any) => {
          const prob = (row.problem || '').toLowerCase();
          let category: 'Software' | 'Hardware' | 'Network' | 'System' = 'Software';
          if (prob.includes('network') || prob.includes('koneksi') || prob.includes('lan') || prob.includes('internet')) category = 'Network';
          else if (prob.includes('printer') || prob.includes('komputer') || prob.includes('laptop') || prob.includes('mouse') || prob.includes('keyboard')) category = 'Hardware';
          else if (prob.includes('sistem') || prob.includes('erp') || prob.includes('aplikasi')) category = 'System';

          return {
            TicketID: row.NoWO && row.NoWO.trim() ? row.NoWO.trim() : `TCK-${row.NRP ? row.NRP.trim() : 'UNKNOWN'}-${row.tgl ? new Date(row.tgl).getTime() : Date.now()}`,
            KaryawanNIK: row.NRP ? row.NRP.trim() : '',
            Issue: row.problem || '',
            Category: category,
            Status: (row.NoWO && row.NoWO.trim() ? 'Resolved' : 'Open') as 'Open' | 'In Progress' | 'Resolved' | 'Closed',
            CreatedDate: row.tgl ? new Date(row.tgl).toISOString() : new Date().toISOString(),
            Priority: 'Medium' as 'Low' | 'Medium' | 'High' | 'Urgent'
          };
        });
      } catch (err: any) {
        console.error('[Database] Failed to SELECT * FROM TD_TICKET:', err.message);
      }
    }
    return [];
  }

  // --- TD_WO ---
  public async getWO(): Promise<WorkOrder[]> {
    const pool = getCompanyDbPool();
    if (pool) {
      try {
        const res = await pool.request().query('SELECT NoWO, Date, Dept, Type, Content, Uraiankerusakan, DeskripsiTindakan, ITPic, Closed, SelesaiPengarjaan FROM TD_WO');
        return res.recordset.map((row: any) => ({
          WOID: row.NoWO ? row.NoWO.trim() : '',
          TicketID: row.NoWO ? row.NoWO.trim() : '',
          AssignedTo: row.ITPic ? row.ITPic.trim() : 'Unassigned',
          ActionTaken: row.DeskripsiTindakan ? row.DeskripsiTindakan.trim() : (row.Uraiankerusakan ? row.Uraiankerusakan.trim() : ''),
          CompletionDate: row.SelesaiPengarjaan ? new Date(row.SelesaiPengarjaan).toISOString() : '',
          Status: row.Closed === 1 ? 'Completed' : 'In Progress'
        }));
      } catch (err: any) {
        console.error('[Database] Failed to SELECT * FROM TD_WO:', err.message);
      }
    }
    return [];
  }

  // --- AI_Conversation ---
  public async getConversations(userNik?: string): Promise<Conversation[]> {
    const pool = getHistoryDbPool();
    if (pool) {
      try {
        let query = 'SELECT TOP 50 ConversationId, Title, CreatedBy, IsPinned, IsArchived, CreatedAt FROM AI_Conversation WHERE IsArchived = 0';
        const request = pool.request();
        if (userNik) {
          query += ' AND CreatedBy = @userNik';
          request.input('userNik', mssql.VarChar(50), userNik);
        }
        query += ' ORDER BY CreatedAt DESC';

        const res = await request.query(query);
        return res.recordset.map((row: any) => ({
          ConversationID: String(row.ConversationId).toLowerCase(),
          Title: row.Title,
          CreatedBy: row.CreatedBy,
          CreatedDate: row.CreatedAt ? new Date(row.CreatedAt).toISOString() : new Date().toISOString(),
          IsPinned: row.IsPinned === true || row.IsPinned === 1,
          IsArchived: row.IsArchived === true || row.IsArchived === 1
        }));
      } catch (err: any) {
        console.error('[Database] Failed to SELECT conversations:', err.message);
      }
    }
    return [];
  }

  public async addConversation(title: string, createdBy: string = 'VOK001'): Promise<Conversation> {
    const newConv: Conversation = {
      ConversationID: uuidv4(),
      Title: title,
      CreatedBy: createdBy,
      CreatedDate: new Date().toISOString(),
      IsPinned: false,
      IsArchived: false
    };

    const pool = getHistoryDbPool();
    if (pool) {
      try {
        await pool.request()
          .input('id', mssql.UniqueIdentifier, newConv.ConversationID)
          .input('title', mssql.NVarChar(255), newConv.Title)
          .input('createdBy', mssql.VarChar(50), newConv.CreatedBy)
          .query('INSERT INTO AI_Conversation (ConversationId, Title, CreatedBy, IsPinned, IsArchived, CreatedAt, UpdatedAt) VALUES (@id, @title, @createdBy, 0, 0, GETDATE(), GETDATE())');
        return newConv;
      } catch (err: any) {
        console.error('[Database] Failed to INSERT conversation:', err.message);
      }
    }
    return newConv;
  }

  public async deleteConversation(conversationId: string): Promise<void> {
    const pool = getHistoryDbPool();
    if (pool) {
      try {
        await pool.request()
          .input('id', mssql.UniqueIdentifier, conversationId)
          .query('DELETE FROM AI_Feedback WHERE MessageId IN (SELECT MessageId FROM AI_Message WHERE ConversationId = @id); DELETE FROM AI_Message WHERE ConversationId = @id; DELETE FROM AI_Conversation WHERE ConversationId = @id;');
      } catch (err: any) {
        console.error('[Database] Failed to delete conversation:', err.message);
      }
    }
  }

  public async togglePinConversation(conversationId: string): Promise<Conversation | null> {
    const pool = getHistoryDbPool();
    if (pool) {
      try {
        const res = await pool.request()
          .input('id', mssql.UniqueIdentifier, conversationId)
          .query('SELECT IsPinned FROM AI_Conversation WHERE ConversationId = @id');
        if (res.recordset.length > 0) {
          const current = res.recordset[0].IsPinned === true || res.recordset[0].IsPinned === 1;
          const nextVal = current ? 0 : 1;
          await pool.request()
            .input('id', mssql.UniqueIdentifier, conversationId)
            .input('nextVal', mssql.Bit, nextVal)
            .query('UPDATE AI_Conversation SET IsPinned = @nextVal WHERE ConversationId = @id');

          const updatedRes = await pool.request()
            .input('id', mssql.UniqueIdentifier, conversationId)
            .query('SELECT * FROM AI_Conversation WHERE ConversationId = @id');
          const row = updatedRes.recordset[0];
          return {
            ConversationID: String(row.ConversationId).toLowerCase(),
            Title: row.Title,
            CreatedBy: row.CreatedBy,
            CreatedDate: row.CreatedAt ? new Date(row.CreatedAt).toISOString() : new Date().toISOString(),
            IsPinned: row.IsPinned === true || row.IsPinned === 1,
            IsArchived: row.IsArchived === true || row.IsArchived === 1
          };
        }
      } catch (err: any) {
        console.error('[Database] Failed to toggle conversation pin:', err.message);
      }
    }
    return null;
  }

  // --- AI_Message ---
  public async getMessages(conversationId: string): Promise<Message[]> {
    const pool = getHistoryDbPool();
    if (pool) {
      try {
        const res = await pool.request()
          .input('convId', mssql.UniqueIdentifier, conversationId)
          .query('SELECT MessageId, ConversationId, Role, Content, SqlQuery, SqlResult, TokenUsage, CreatedAt FROM AI_Message WHERE ConversationId = @convId ORDER BY CreatedAt ASC');
        return res.recordset.map((row: any) => ({
          MessageID: String(row.MessageId).toLowerCase(),
          ConversationID: String(row.ConversationId).toLowerCase(),
          Sender: (row.Role === 'User' || row.Role === 'user' ? 'User' : 'AI') as 'User' | 'AI',
          MessageText: row.Content,
          SqlQuery: row.SqlQuery,
          SqlResult: row.SqlResult,
          TokenUsage: row.TokenUsage,
          CreatedDate: row.CreatedAt ? new Date(row.CreatedAt).toISOString() : new Date().toISOString()
        }));
      } catch (err: any) {
        console.error('[Database] Failed to get messages:', err.message);
      }
    }
    return [];
  }

  public async addMessage(
    conversationId: string,
    sender: 'User' | 'AI',
    text: string,
    sqlQuery?: string,
    sqlResult?: any,
    tokenUsage?: number
  ): Promise<Message> {
    const newMessage: Message = {
      MessageID: uuidv4(),
      ConversationID: conversationId,
      Sender: sender,
      MessageText: text,
      SqlQuery: sqlQuery,
      SqlResult: sqlResult ? (typeof sqlResult === 'string' ? sqlResult : JSON.stringify(sqlResult)) : undefined,
      TokenUsage: tokenUsage,
      CreatedDate: new Date().toISOString()
    };

    const pool = getHistoryDbPool();
    if (pool) {
      try {
        await pool.request()
          .input('msgId', mssql.UniqueIdentifier, newMessage.MessageID)
          .input('convId', mssql.UniqueIdentifier, newMessage.ConversationID)
          .input('role', mssql.NVarChar(50), newMessage.Sender)
          .input('content', mssql.NVarChar(mssql.MAX), newMessage.MessageText)
          .input('sql', mssql.NVarChar(mssql.MAX), newMessage.SqlQuery || null)
          .input('result', mssql.NVarChar(mssql.MAX), newMessage.SqlResult || null)
          .input('tokens', mssql.Int, newMessage.TokenUsage || null)
          .query(`INSERT INTO AI_Message (MessageId, ConversationId, Role, Content, SqlQuery, SqlResult, TokenUsage, CreatedAt)
                  VALUES (@msgId, @convId, @role, @content, @sql, @result, @tokens, GETDATE())`);

        // Dynamic title updating on first interaction
        const titleRes = await pool.request()
          .input('convId', mssql.UniqueIdentifier, conversationId)
          .query('SELECT Title FROM AI_Conversation WHERE ConversationId = @convId');
        if (titleRes.recordset.length > 0) {
          const title = titleRes.recordset[0].Title;
          if (title === 'Sesi Diskusi IT Support' || title === 'New Chat' || title.length < 2) {
            const newTitle = text.length > 30 ? text.substring(0, 27) + '...' : text;
            await pool.request()
              .input('convId', mssql.UniqueIdentifier, conversationId)
              .input('title', mssql.NVarChar(255), newTitle)
              .query('UPDATE AI_Conversation SET Title = @title WHERE ConversationId = @convId');
          }
        }
        return newMessage;
      } catch (err: any) {
        console.error('[Database] Failed to add message:', err.message);
      }
    }
    return newMessage;
  }

  // --- AI_Feedback ---
  public async addFeedback(messageId: string, score: number, question: string, sqlQuery: string, answerText: string): Promise<Feedback> {
    const feedback: Feedback = {
      FeedbackID: uuidv4(),
      MessageID: messageId,
      Question: question,
      SqlQuery: sqlQuery,
      AnswerText: answerText,
      Score: score,
      CreatedDate: new Date().toISOString()
    };

    const pool = getHistoryDbPool();
    if (pool) {
      try {
        const comment = JSON.stringify({ question, sqlQuery, answerText });
        await pool.request()
          .input('fbId', mssql.UniqueIdentifier, feedback.FeedbackID)
          .input('msgId', mssql.UniqueIdentifier, feedback.MessageID)
          .input('isHelpful', mssql.Bit, score === 1 ? 1 : 0)
          .input('comment', mssql.NVarChar(mssql.MAX), comment)
          .query(`INSERT INTO AI_Feedback (FeedbackId, MessageId, IsHelpful, Comment, CreatedAt)
                  VALUES (@fbId, @msgId, @isHelpful, @comment, GETDATE())`);
        return feedback;
      } catch (err: any) {
        console.error('[Database] Failed to add feedback:', err.message);
      }
    }
    return feedback;
  }

  public async getFeedback(): Promise<Feedback[]> {
    const pool = getHistoryDbPool();
    if (pool) {
      try {
        const res = await pool.request().query('SELECT FeedbackId, MessageId, IsHelpful, Comment, CreatedAt FROM AI_Feedback ORDER BY CreatedAt DESC');
        return res.recordset.map((row: any) => {
          let question = '';
          let sqlQuery = '';
          let answerText = '';
          try {
            const parsed = JSON.parse(row.Comment || '{}');
            question = parsed.question || '';
            sqlQuery = parsed.sqlQuery || '';
            answerText = parsed.answerText || '';
          } catch (e) {
            question = row.Comment || '';
          }
          return {
            FeedbackID: String(row.FeedbackId).toLowerCase(),
            MessageID: String(row.MessageId).toLowerCase(),
            Question: question,
            SqlQuery: sqlQuery,
            AnswerText: answerText,
            Score: row.IsHelpful ? 1 : -1,
            CreatedDate: row.CreatedAt ? new Date(row.CreatedAt).toISOString() : new Date().toISOString()
          };
        });
      } catch (err: any) {
        console.error('[Database] Failed to get feedback:', err.message);
      }
    }
    return [];
  }

  // --- TD_MEMORY (Personal Fact Context) ---
  public async getMemories(conversationId?: string, userNik?: string): Promise<Memory[]> {
    const pool = getHistoryDbPool();
    if (pool) {
      try {
        let query = 'SELECT MemoryID, UserNIK, ConversationID, FactText, CreatedDate FROM TD_MEMORY WHERE 1=1';
        const req = pool.request();
        if (conversationId) {
          query += ' AND ConversationID = @convId';
          req.input('convId', mssql.VarChar(50), conversationId);
        }
        if (userNik) {
          query += ' AND UserNIK = @userNik';
          req.input('userNik', mssql.VarChar(50), userNik);
        }
        const res = await req.query(query);
        return res.recordset;
      } catch (err: any) {
        console.error('[Database] Failed to get memories:', err.message);
      }
    }
    return [];
  }

  public async addMemory(factText: string, userNIK: string = 'VOK001', conversationId?: string): Promise<Memory> {
    const memory: Memory = {
      MemoryID: 'MEM-' + Date.now(),
      UserNIK: userNIK,
      ConversationID: conversationId,
      FactText: factText,
      CreatedDate: new Date().toISOString()
    };

    const pool = getHistoryDbPool();
    if (pool) {
      try {
        await pool.request()
          .input('memId', mssql.VarChar(50), memory.MemoryID)
          .input('nik', mssql.VarChar(50), memory.UserNIK)
          .input('convId', mssql.VarChar(50), memory.ConversationID || null)
          .input('fact', mssql.NVarChar(mssql.MAX), memory.FactText)
          .input('createdDate', mssql.VarChar(50), memory.CreatedDate)
          .query(`INSERT INTO TD_MEMORY (MemoryID, UserNIK, ConversationID, FactText, CreatedDate)
                  VALUES (@memId, @nik, @convId, @fact, @createdDate)`);
        return memory;
      } catch (err: any) {
        console.error('[Database] Failed to add memory:', err.message);
      }
    }
    return memory;
  }

  public async deleteMemory(memoryId: string): Promise<void> {
    const pool = getHistoryDbPool();
    if (pool) {
      try {
        await pool.request()
          .input('memId', mssql.VarChar(50), memoryId)
          .query('DELETE FROM TD_MEMORY WHERE MemoryID = @memId');
      } catch (err: any) {
        console.error('[Database] Failed to delete memory:', err.message);
      }
    }
  }

  // --- AI_LearnedWords ---
  public async getLearnedWords(): Promise<Record<string, string>> {
    const pool = getHistoryDbPool();
    if (pool) {
      try {
        const res = await pool.request().query('SELECT Word, Correction FROM AI_LearnedWords');
        const map: Record<string, string> = {};
        for (const row of res.recordset) {
          map[row.Word] = row.Correction;
        }
        return map;
      } catch (err: any) {
        console.error('[Database] Failed to get learned words:', err.message);
      }
    }
    return {};
  }

  public async addLearnedWord(typo: string, correction: string): Promise<void> {
    const w = typo.toLowerCase();
    const c = correction.toLowerCase();

    const pool = getHistoryDbPool();
    if (pool) {
      try {
        await pool.request()
          .input('w', mssql.NVarChar(255), w)
          .input('c', mssql.NVarChar(255), c)
          .query(`IF EXISTS (SELECT * FROM AI_LearnedWords WHERE Word = @w)
                    UPDATE AI_LearnedWords SET Correction = @c WHERE Word = @w
                  ELSE
                    INSERT INTO AI_LearnedWords (Word, Correction) VALUES (@w, @c)`);
      } catch (err: any) {
        console.error('[Database] Failed to add learned word:', err.message);
      }
    }
  }

  public async addQueryKnowledge(question: string, sql: string): Promise<void> {
    const pool = getHistoryDbPool();
    if (!pool) throw new Error('Database knowledge SmartIT_AI tidak terhubung.');

    const metadata = JSON.stringify({ question, sql });
    await pool.request()
      .input('metadata', mssql.NVarChar(mssql.MAX), metadata)
      .query(`
        IF EXISTS (
          SELECT 1 FROM AI_Knowledge
          WHERE KnowledgeType = 'query_pattern' AND Metadata = @metadata
        )
          UPDATE AI_Knowledge
          SET UsageCount = UsageCount + 1,
              Confidence = CASE WHEN Confidence IS NULL OR Confidence < 1 THEN 1 ELSE Confidence END,
              LastRefreshed = GETDATE()
          WHERE KnowledgeType = 'query_pattern' AND Metadata = @metadata
        ELSE
          INSERT INTO AI_Knowledge (
            KnowledgeId, KnowledgeType, Metadata, IsWhitelisted, ReviewStatus,
            LearnedBy, Confidence, UsageCount, LastRefreshed
          )
          VALUES (
            NEWID(), 'query_pattern', @metadata, 1, 'Approved',
            'feedback', 1, 1, GETDATE()
          )
      `);
  }

  public async getQueryKnowledgeHints(limit: number = 8): Promise<string[]> {
    const pool = getHistoryDbPool();
    if (!pool) return [];

    const safeLimit = Math.max(1, Math.min(20, Math.floor(limit)));
    try {
      const result = await pool.request().query(`
        SELECT TOP ${safeLimit} Metadata
        FROM AI_Knowledge
        WHERE KnowledgeType = 'query_pattern'
          AND IsWhitelisted = 1
          AND ReviewStatus = 'Approved'
        ORDER BY Confidence DESC, UsageCount DESC, LastRefreshed DESC
      `);
      return result.recordset.flatMap((row: any) => {
        try {
          const item = JSON.parse(row.Metadata);
          return item.question && item.sql
            ? [`Pertanyaan serupa: "${item.question}" -> pola SQL tervalidasi: ${item.sql}`]
            : [];
        } catch {
          return [];
        }
      });
    } catch (error: any) {
      console.error('[Database] Failed to read AI_Knowledge:', error.message);
      return [];
    }
  }

  private stripSensitiveColumns(data: any[]): any[] {
    if (!data || !Array.isArray(data) || data.length === 0) return data;
    const sensitivePatterns = [
      /pass/i, /password/i, /token/i, /secret/i, /salary/i, /gaji/i,
      /^email_internal$/i, /^email_voksel_(?:coid|com)$/i
    ];
    
    return data.map(row => {
      const sanitizedRow = { ...row };
      for (const key of Object.keys(sanitizedRow)) {
        if (sensitivePatterns.some(regex => regex.test(key))) {
          sanitizedRow[key] = '[REDACTED]';
        }
      }
      return sanitizedRow;
    });
  }

  // --- Direct SQL Execution ---
  public async executeSQL(sql: string): Promise<{ success: boolean; data?: any[]; error?: string }> {
    const trimmed = sql.trim().replace(/;$/, '');

    // Safety check first
    const forbiddenKeywords = ['DROP', 'DELETE', 'UPDATE', 'INSERT', 'ALTER', 'EXEC', 'TRUNCATE', 'CREATE', 'REPLACE'];
    for (const kw of forbiddenKeywords) {
      const regex = new RegExp(`\\b${kw}\\b`, 'i');
      if (regex.test(trimmed)) {
        return { success: false, error: `Validasi Keamanan Gagal: Kata kunci '${kw}' dilarang pada database readonly.` };
      }
    }

    if (trimmed.includes(';')) {
      return { success: false, error: 'Validasi Keamanan Gagal: Kueri multi-statement tidak diizinkan.' };
    }

    if (/\-\-|#|\/\*/.test(trimmed)) {
      return { success: false, error: 'Validasi Keamanan Gagal: Komentar SQL tidak diizinkan.' };
    }

    const pool = getCompanyDbPool();
    if (pool) {
      try {
        console.log(`[Database Bridge] Directing query to real ITOpr SQL Server: ${sql}`);
        const res = await pool.request().query(sql);
        const safeData = this.stripSensitiveColumns(res.recordset);
        return { success: true, data: safeData };
      } catch (e: any) {
        console.error('[Database Bridge] Direct query on real SQL Server failed:', e.message);
        return { success: false, error: `Kesalahan Database: ${e.message}` };
      }
    }
    return { success: false, error: 'Kesalahan Koneksi Database: Database utama tidak terhubung.' };
  }

  // --- Verify Employee Login Credentials ---
  public async verifyEmployeeLogin(nrp: string, pass: string): Promise<Karyawan | null> {
    const pool = getHistoryDbPool();
    if (!pool) {
      throw new Error('Koneksi database SmartIT_AI tidak terhubung. Silakan restart backend server Anda agar memuat file .env yang baru.');
    }

    try {
      console.log(`[Database Bridge] Verifying employee credentials in database for Username: ${nrp}`);
      const res = await pool.request()
        .input('username', mssql.VarChar(50), nrp)
        .query('SELECT username, nama, dept, password FROM TD_users WHERE username = @username');

      if (res.recordset && res.recordset.length > 0) {
        const row = res.recordset[0];
        const dbPass = row.password ? row.password.trim() : '';

        let isMatch = false;
        let needsMigration = false;

        // 1. Verify password using bcrypt compare
        try {
          const { comparePassword } = require('../utils/auth');
          isMatch = await comparePassword(pass, dbPass);
        } catch (bcryptErr) {
          console.warn('[Database] Bcrypt comparison failed, falling back to plain text check:', bcryptErr);
        }

        // 2. Fallback check for legacy plain text passwords (Lazy migration check)
        if (!isMatch && dbPass === pass) {
          isMatch = true;
          needsMigration = true;
        }

        if (isMatch) {
          // Lazy migration: if password matched plain text, or isn't formatted as bcrypt, write hash back
          if (needsMigration || !dbPass.startsWith('$2b$')) {
            try {
              const { hashPassword } = require('../utils/auth');
              const hashedPass = await hashPassword(pass);
              console.log(`[Database Bridge] Lazy migrating password to Bcrypt hash for user: ${nrp}`);
              await pool.request()
                .input('username', mssql.VarChar(50), nrp)
                .input('hashedPass', mssql.VarChar(100), hashedPass)
                .query('UPDATE TD_users SET password = @hashedPass WHERE username = @username');
            } catch (migrateErr: any) {
              console.error('[Database] Failed to lazy migrate employee password:', migrateErr.message);
            }
          }

          return {
            NIK: row.username ? row.username.trim() : '',
            Nama: row.nama ? row.nama.trim() : '',
            Departemen: row.dept ? row.dept.trim() : '',
            Jabatan: row.dept && row.dept.toLowerCase().includes('it') ? 'IT Support' : 'Employee',
            Email: row.username ? `${row.username.trim().toLowerCase()}@voksel.co.id` : '',
            Status: 'Active'
          };
        }
      }
    } catch (err: any) {
      console.error('[Database] Failed to verify employee login:', err.message);
      throw err;
    }
    return null;
  }

  // --- Register New Employee ---
  public async registerEmployee(nrp: string, name: string, dept: string, pass: string): Promise<Karyawan | null> {
    const pool = getHistoryDbPool();
    if (!pool) {
      throw new Error('Koneksi database SmartIT_AI tidak terhubung. Silakan restart backend server Anda agar memuat file .env yang baru.');
    }

    try {
      const { hashPassword } = require('../utils/auth');
      const hashedPass = await hashPassword(pass);

      console.log(`[Database Bridge] Registering new user ${nrp} in database`);
      await pool.request()
        .input('username', mssql.VarChar(50), nrp)
        .input('name', mssql.VarChar(100), name)
        .input('dept', mssql.VarChar(100), dept)
        .input('pass', mssql.VarChar(100), hashedPass)
        .query('INSERT INTO TD_users (username, nama, dept, password) VALUES (@username, @name, @dept, @pass)');

      return {
        NIK: nrp,
        Nama: name,
        Departemen: dept,
        Jabatan: dept.toLowerCase().includes('it') ? 'IT Support' : 'Employee',
        Email: `${nrp.toLowerCase()}@voksel.co.id`,
        Status: 'Active'
      };
    } catch (err: any) {
      console.error('[Database] Failed to register employee:', err.message);
      throw err;
    }
  }

  // --- Fetch User Profile by Username from SmartIT_AI ---
  public async getUserByUsername(username: string): Promise<Karyawan | null> {
    const pool = getHistoryDbPool();
    if (pool) {
      try {
        const res = await pool.request()
          .input('username', mssql.VarChar(50), username)
          .query('SELECT username, nama, dept FROM TD_users WHERE username = @username');
        if (res.recordset && res.recordset.length > 0) {
          const row = res.recordset[0];
          return {
            NIK: row.username ? row.username.trim() : '',
            Nama: row.nama ? row.nama.trim() : '',
            Departemen: row.dept ? row.dept.trim() : '',
            Jabatan: row.dept && row.dept.toLowerCase().includes('it') ? 'IT Support' : 'Employee',
            Email: row.username ? `${row.username.trim().toLowerCase()}@voksel.co.id` : '',
            Status: 'Active'
          };
        }
      } catch (err: any) {
        console.error('[Database] Failed to get user by username:', err.message);
      }
    }
    return null;
  }

  // --- Hapus Akun User dari SmartIT_AI ---
  public async deleteUserByUsername(username: string): Promise<void> {
    const pool = getHistoryDbPool();
    if (pool) {
      try {
        console.log(`[Database Bridge] Menghapus user ${username} dari tabel TD_users`);
        await pool.request()
          .input('username', mssql.VarChar(50), username)
          .query('DELETE FROM TD_users WHERE username = @username');
      } catch (err: any) {
        console.error('[Database] Gagal menghapus user dari database:', err.message);
        throw err;
      }
    }
  }

  // --- Dashboard Stats Compilation ---
  public async getDashboardStats(): Promise<DashboardStats> {
    const pool = getCompanyDbPool();
    if (pool) {
      try {
        const [
          summaryRes, catRes, prioRes, brandRes, deptRes, empDeptRes,
          woStatusRes, compStatusRes, compTypeRes, woTypeRes, woDifficultyRes,
          woCauseRes, woPicRes, woTrendRes, assetDeptRes,
          devicesTypeStatusRes, devicesUsedRes, devicesAgeCondRes
        ] = await Promise.all([
          pool.request().query(`
            SELECT
              (SELECT COUNT(*) FROM TD_karyawan WHERE status = 'Aktif') AS totalEmployees,
              (SELECT COUNT(*) FROM TD_computer) AS totalComputers,
              (SELECT COUNT(*) FROM TD_computer WHERE Aktif = 'Y') AS activeComputers,
              (SELECT COUNT(*) FROM TD_computer WHERE Aktif <> 'Y') AS inactiveComputers,
              (SELECT COUNT(*) FROM TD_monitor) AS totalMonitors,
              (SELECT COUNT(*) FROM TD_monitor WHERE Aktif = 'Y') AS activeMonitors,
              (SELECT COUNT(*) FROM TD_printer) AS totalPrinters,
              (SELECT COUNT(*) FROM TD_printer WHERE Aktif = 'Y') AS activePrinters,
              (SELECT COALESCE(SUM(COALESCE(jumlah, 1)), 0) FROM TD_CCTV) AS totalCctvUnits,
              (SELECT COALESCE(SUM(COALESCE(qty, 1)), 0) FROM TD_License) AS totalLicenses,
              (SELECT COUNT(*) FROM TD_TICKET) AS totalTickets,
              (SELECT COUNT(*) FROM TD_TICKET WHERE NoWO IS NULL OR LTRIM(RTRIM(NoWO)) = '') AS openTickets,
              (SELECT COUNT(*) FROM TD_TICKET WHERE NoWO IS NOT NULL AND LTRIM(RTRIM(NoWO)) <> '') AS resolvedTickets,
              (SELECT COUNT(*) FROM TD_WO) AS totalWorkOrders,
              (SELECT COUNT(*) FROM TD_WO WHERE Closed = 0) AS openWorkOrders,
              (SELECT COUNT(*) FROM TD_WO WHERE Closed = 1) AS closedWorkOrders,
              (SELECT COALESCE(AVG(CAST(TotalDowntime AS FLOAT)), 0) FROM TD_WO WHERE Closed = 1) AS averageDowntime
          `),
          pool.request().query(`
          SELECT 
            CASE 
              WHEN problem LIKE '%network%' OR problem LIKE '%koneksi%' OR problem LIKE '%lan%' OR problem LIKE '%internet%' THEN 'Network'
              WHEN problem LIKE '%printer%' OR problem LIKE '%komputer%' OR problem LIKE '%laptop%' OR problem LIKE '%mouse%' OR problem LIKE '%keyboard%' THEN 'Hardware'
              WHEN problem LIKE '%sistem%' OR problem LIKE '%erp%' OR problem LIKE '%aplikasi%' THEN 'System'
              ELSE 'Software'
            END as name,
            COUNT(*) as value
          FROM TD_TICKET
          GROUP BY 
            CASE 
              WHEN problem LIKE '%network%' OR problem LIKE '%koneksi%' OR problem LIKE '%lan%' OR problem LIKE '%internet%' THEN 'Network'
              WHEN problem LIKE '%printer%' OR problem LIKE '%komputer%' OR problem LIKE '%laptop%' OR problem LIKE '%mouse%' OR problem LIKE '%keyboard%' THEN 'Hardware'
              WHEN problem LIKE '%sistem%' OR problem LIKE '%erp%' OR problem LIKE '%aplikasi%' THEN 'System'
              ELSE 'Software'
            END
          `),
          pool.request().query("SELECT 'Belum diklasifikasikan' as name, COUNT(*) as value FROM TD_TICKET"),
          pool.request().query('SELECT CPU_Merk as name, COUNT(*) as value FROM TD_computer GROUP BY CPU_Merk'),
          pool.request().query(`
          SELECT k.Dept as name, COUNT(*) as value 
          FROM TD_TICKET t
          INNER JOIN TD_karyawan k ON t.NRP = k.Nrp
          GROUP BY k.Dept
          `),
          pool.request().query("SELECT Dept as name, COUNT(*) as value FROM TD_karyawan WHERE status = 'Aktif' GROUP BY Dept ORDER BY value DESC"),
          pool.request().query(`
          SELECT 
            CASE WHEN Closed = 1 THEN 'Selesai' ELSE 'Terbuka' END as name,
            COUNT(*) as value 
          FROM TD_WO 
          GROUP BY Closed
          `),
          pool.request().query(`
          SELECT 
            CASE WHEN Aktif = 'Y' THEN 'Aktif' ELSE 'Status ' + ISNULL(Aktif, 'Kosong') END as name,
            COUNT(*) as value 
          FROM TD_computer 
          GROUP BY Aktif
          `),
          pool.request().query("SELECT COALESCE(Jenis, 'Tidak diketahui') AS name, COUNT(*) AS value FROM TD_computer GROUP BY Jenis ORDER BY value DESC"),
          pool.request().query("SELECT COALESCE(Type, 'Tidak diketahui') AS name, COUNT(*) AS value FROM TD_WO GROUP BY Type ORDER BY value DESC"),
          pool.request().query("SELECT COALESCE(TingkatKesulitan, 'Tidak diketahui') AS name, COUNT(*) AS value FROM TD_WO GROUP BY TingkatKesulitan ORDER BY value DESC"),
          pool.request().query("SELECT COALESCE(Penyebab, 'Tidak diketahui') AS name, COUNT(*) AS value FROM TD_WO GROUP BY Penyebab ORDER BY value DESC"),
          pool.request().query(`
            SELECT COALESCE(ITPic, 'Tidak diketahui') AS name,
              COUNT(*) AS total,
              SUM(CASE WHEN Closed = 1 THEN 1 ELSE 0 END) AS closed,
              COALESCE(AVG(CASE WHEN Closed = 1 THEN CAST(TotalDowntime AS FLOAT) END), 0) AS averageDowntime
            FROM TD_WO
            GROUP BY ITPic
            ORDER BY total DESC
          `),
          pool.request().query(`
            WITH Latest AS (SELECT MAX([Date]) AS maxDate FROM TD_WO)
            SELECT CONVERT(char(7), w.[Date], 120) AS month,
              COUNT(*) AS total,
              SUM(CASE WHEN Closed = 1 THEN 1 ELSE 0 END) AS closed,
              SUM(CASE WHEN Closed = 0 THEN 1 ELSE 0 END) AS [open]
            FROM TD_WO w CROSS JOIN Latest l
            WHERE w.[Date] >= DATEADD(month, DATEDIFF(month, 0, l.maxDate) - 11, 0)
            GROUP BY CONVERT(char(7), w.[Date], 120)
            ORDER BY month
          `),
          pool.request().query(`
            WITH Departments AS (
              SELECT Dept FROM TD_computer
              UNION SELECT Dept FROM TD_monitor
              UNION SELECT Dept FROM TD_printer
            )
            SELECT COALESCE(d.Dept, 'Tidak diketahui') AS name,
              (SELECT COUNT(*) FROM TD_computer c WHERE ISNULL(c.Dept, '') = ISNULL(d.Dept, '')) AS computers,
              (SELECT COUNT(*) FROM TD_monitor m WHERE ISNULL(m.Dept, '') = ISNULL(d.Dept, '')) AS monitors,
              (SELECT COUNT(*) FROM TD_printer p WHERE ISNULL(p.Dept, '') = ISNULL(d.Dept, '')) AS printers
            FROM Departments d
            ORDER BY (SELECT COUNT(*) FROM TD_computer c WHERE ISNULL(c.Dept, '') = ISNULL(d.Dept, '')) DESC
          `),
          pool.request().query(`
            SELECT Jenis as type, Aktif, COUNT(*) as Count
            FROM TD_computer
            WHERE Jenis IN ('PC', 'ALL IN ONE', 'NOTEBOOK')
            GROUP BY Jenis, Aktif
          `),
          pool.request().query(`
            SELECT Jenis as type, 
              CASE WHEN Nrp IS NOT NULL AND LTRIM(RTRIM(Nrp)) <> '' THEN 'User' ELSE 'Non-User' END as UsedType,
              COUNT(*) as Count
            FROM TD_computer
            WHERE Jenis IN ('PC', 'ALL IN ONE', 'NOTEBOOK') AND Aktif = 'Y'
            GROUP BY Jenis, CASE WHEN Nrp IS NOT NULL AND LTRIM(RTRIM(Nrp)) <> '' THEN 'User' ELSE 'Non-User' END
          `),
          pool.request().query(`
            SELECT 
              Jenis as type, 
              ISNULL(perusahaan, 'VOKSEL') as location,
              CASE WHEN CPU_RcptDate < DATEADD(year, -6, GETDATE()) THEN '> 6 Years' ELSE '<= 6 Years' END as ageGroup,
              CASE WHEN Keterangan IS NOT NULL AND LTRIM(RTRIM(Keterangan)) <> '' AND Keterangan NOT IN ('OK', 'BAGUS', 'GOOD') THEN 'Not Good' ELSE 'Good' END as condition,
              COUNT(*) as count
            FROM TD_computer
            WHERE Aktif = 'Y' AND Jenis IN ('PC', 'ALL IN ONE', 'NOTEBOOK')
            GROUP BY Jenis, ISNULL(perusahaan, 'VOKSEL'),
              CASE WHEN CPU_RcptDate < DATEADD(year, -6, GETDATE()) THEN '> 6 Years' ELSE '<= 6 Years' END,
              CASE WHEN Keterangan IS NOT NULL AND LTRIM(RTRIM(Keterangan)) <> '' AND Keterangan NOT IN ('OK', 'BAGUS', 'GOOD') THEN 'Not Good' ELSE 'Good' END
          `)
        ]);

        // Sort and group computer brands to top 5 + "Lainnya" to prevent chart label overlaps
        const brandSorted = brandRes.recordset.map((r: any) => ({
          name: r.name ? r.name.trim() : 'Lainnya',
          value: r.value
        })).sort((a: any, b: any) => b.value - a.value);

        const topBrands: { name: string; value: number }[] = [];
        let otherValue = 0;
        for (let i = 0; i < brandSorted.length; i++) {
          if (i < 5) {
            topBrands.push(brandSorted[i]);
          } else {
            otherValue += brandSorted[i].value;
          }
        }
        if (otherValue > 0) {
          topBrands.push({ name: 'Lainnya', value: otherValue });
        }

        const summary = summaryRes.recordset[0];
        const completionRate = summary.totalWorkOrders > 0
          ? Number(((summary.closedWorkOrders / summary.totalWorkOrders) * 100).toFixed(1))
          : 0;

        return {
          ...summary,
          completionRate,
          averageDowntime: Math.round(summary.averageDowntime || 0),
          ticketsByCategory: catRes.recordset.map(r => ({ name: r.name || 'Software', value: r.value })),
          ticketsByPriority: prioRes.recordset.map(r => ({ name: r.name, value: r.value })),
          computersByBrand: topBrands,
          computersByType: compTypeRes.recordset,
          ticketsByDepartment: deptRes.recordset.map(r => ({ name: r.name || 'Lainnya', value: r.value })),
          employeesByDepartment: empDeptRes.recordset.map(r => ({ name: r.name ? r.name.trim() : 'Lainnya', value: r.value })),
          assetsByDepartment: assetDeptRes.recordset,
          woStatus: woStatusRes.recordset.map(r => ({ name: r.name || 'In Progress', value: r.value })),
          woByType: woTypeRes.recordset,
          woByDifficulty: woDifficultyRes.recordset,
          woByCause: woCauseRes.recordset,
          woByPic: woPicRes.recordset,
          woMonthlyTrend: woTrendRes.recordset,
          computerStatus: compStatusRes.recordset,
          devicesByTypeAndStatus: [
            ...['PC', 'ALL IN ONE', 'NOTEBOOK'].map(type => {
              const y = devicesTypeStatusRes.recordset.find(r => r.type === type && r.Aktif === 'Y')?.Count || 0;
              const n = devicesTypeStatusRes.recordset.find(r => r.type === type && r.Aktif === 'N')?.Count || 0;
              const p = devicesTypeStatusRes.recordset.find(r => r.type === type && r.Aktif === 'P')?.Count || 0;
              return { type, y, n, p };
            })
          ],
          devicesByUsed: [
            ...['PC', 'ALL IN ONE', 'NOTEBOOK'].map(type => {
              const user = devicesUsedRes.recordset.find(r => r.type === type && r.UsedType === 'User')?.Count || 0;
              const nonUser = devicesUsedRes.recordset.find(r => r.type === type && r.UsedType === 'Non-User')?.Count || 0;
              return { type, user, nonUser };
            })
          ],
          devicesByAgeAndCondition: devicesAgeCondRes.recordset.map(r => ({
            type: r.type, location: r.location, ageGroup: r.ageGroup, condition: r.condition, count: r.count
          })),
          lastUpdated: new Date().toISOString()
        };
      } catch (err: any) {
        console.error('[Database] Failed to fetch dashboard stats from real database:', err.message);
      }
    }

    return {
      totalEmployees: 0,
      totalComputers: 0,
      activeComputers: 0,
      inactiveComputers: 0,
      totalMonitors: 0,
      activeMonitors: 0,
      totalPrinters: 0,
      activePrinters: 0,
      totalCctvUnits: 0,
      totalLicenses: 0,
      totalTickets: 0,
      openTickets: 0,
      resolvedTickets: 0,
      totalWorkOrders: 0,
      openWorkOrders: 0,
      closedWorkOrders: 0,
      completionRate: 0,
      averageDowntime: 0,
      ticketsByCategory: [],
      ticketsByPriority: [],
      computersByBrand: [],
      computersByType: [],
      ticketsByDepartment: [],
      employeesByDepartment: [],
      assetsByDepartment: [],
      woStatus: [],
      woByType: [],
      woByDifficulty: [],
      woByCause: [],
      woByPic: [],
      woMonthlyTrend: [],
      computerStatus: [],
      devicesByTypeAndStatus: [],
      devicesByUsed: [],
      devicesByAgeAndCondition: [],
      lastUpdated: new Date().toISOString()
    };
  }
}

export const getDbInstance = () => {
  return Database.getInstance();
};
