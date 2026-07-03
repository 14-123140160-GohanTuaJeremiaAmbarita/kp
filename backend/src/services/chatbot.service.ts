import { HistoryRepository } from '../repositories/history.repository';
import { QueryCacheService } from './queryCache.service';
import { SqlService } from '../ai/sql.service';
import { OpenRouterService } from '../ai/openrouter.service';
import { Message } from '../types/history';

export class ChatbotService {
  private historyRepo = new HistoryRepository();
  private queryCache = new QueryCacheService();
  private sqlService = new SqlService();
  private openRouter = new OpenRouterService();

  public async processMessage(
    conversationId: string,
    messageText: string,
    model: string,
    userNIK: string = 'VOK001'
  ): Promise<{
    success: boolean;
    message: Message;
    sqlQuery: string | null;
    sqlResult: any;
    sqlError?: string;
    fromLearning: boolean;
  }> {

    // 1. Fetch current conversation-scoped AI Memories (Passive Memory)
    const memories = await this.historyRepo.getMemories(conversationId);
    const memoryContext = memories.length > 0 
      ? memories.map((m, i) => `${i+1}. ${m.FactText}`).join('\n')
      : 'Belum ada fakta personal atau konteks yang diingat dalam percakapan ini.';

    // 2. Fetch history of the current conversation (last 6 messages for context)
    const rawHistory = await this.historyRepo.getMessages(conversationId);
    const history = rawHistory.slice(-6);
    const historyContext = history.length > 0
      ? history.map(h => `${h.Sender}: ${h.MessageText}`).join('\n')
      : 'Sesi baru dimulai.';

    // 3. Detect Passive Context and Data download/export requests
    const isDownloadRequest = /download|export|unduh|cetak|print/i.test(messageText);
    let sqlQuery: string | null = null;
    let sqlResult: any = null;
    let sqlError: string | undefined;
    let fromLearning = false;

    if (isDownloadRequest) {
      // Find the last message in this conversation that has an SQL query and result
      const allMessages = await this.historyRepo.getMessages(conversationId);
      const lastSqlMessage = [...allMessages].reverse().find(m => m.SqlQuery && m.SqlResult);
      if (lastSqlMessage) {
        sqlQuery = lastSqlMessage.SqlQuery || null;
        try {
          sqlResult = JSON.parse(lastSqlMessage.SqlResult!);
        } catch (e) {
          sqlResult = null;
        }
        console.log(`[ChatbotService] Restored passive context download request: ${sqlQuery}`);
      }
    }

    // 4. Memory extraction for personal declarations
    const cleanMsg = messageText.trim().toLowerCase();
    if (
      cleanMsg.includes('nama saya') || 
      cleanMsg.includes('saya bekerja di') || 
      cleanMsg.includes('saya di departemen') || 
      cleanMsg.includes('nik saya')
    ) {
      try {
        const extractionPrompt = `Analisis kalimat berikut dan cari tahu apakah pengguna menyebutkan informasi personal baru tentang diri mereka sendiri seperti Nama, NIK, Departemen, atau Jabatan. Jika ada, sebutkan fakta tersebut dalam 1 kalimat pendek berformat bahasa Indonesia (contoh: "Nama pengguna adalah Gohan" atau "Pengguna bekerja di departemen IT"). Jika tidak ada fakta baru, kembalikan kata "NONE".
Kalimat pengguna: "${messageText}"`;
        const extractedFact = await this.openRouter.generateContent(extractionPrompt);
        if (extractedFact && !extractedFact.toUpperCase().includes('NONE') && extractedFact.length > 3) {
          await this.historyRepo.addMemory(extractedFact, userNIK, conversationId);
          console.log(`[ChatbotService] Auto-saved extracted personal fact: ${extractedFact}`);
        }
      } catch (err) {
        console.error('Error during automatic fact extraction:', err);
      }
    }

    // Add user message to persistent DB history
    await this.historyRepo.addMessage(conversationId, 'User', messageText);

    // 5. Query Cache / Self-Learning Vocabulary Lookup
    if (!sqlQuery) {
      const cacheResult = await this.queryCache.lookup(messageText);
      if (cacheResult.sql) {
        sqlQuery = cacheResult.sql;
        fromLearning = cacheResult.fromLearning;
      }
    }

    // 6. SQL query drafting & verification via LLM if not retrieved from cache
    let sqlErrorFromGen: string | undefined;
    if (!sqlQuery) {
      try {
        const sqlRes = await this.sqlService.generateSql(messageText, memoryContext, historyContext);
        if (sqlRes.requiresQuery && sqlRes.sql) {
          sqlQuery = sqlRes.sql;
        }
      } catch (err: any) {
        console.error('Error in SQL generation pipeline:', err);
        sqlErrorFromGen = `Gagal merancang kueri otomatis: ${err.message}`;
      }
    }

    // 7. Execute SQL Query safely against the simulated engine
    if (sqlQuery && !sqlResult) {
      console.log(`[ChatbotService] Safely executing query: ${sqlQuery}`);
      const queryRes = await this.historyRepo.executeSQL(sqlQuery);
      if (queryRes.success) {
        sqlResult = queryRes.data;
      } else {
        sqlError = queryRes.error;
      }
    }

    if (sqlErrorFromGen) {
      sqlError = sqlError ? `${sqlErrorFromGen} | ${sqlError}` : sqlErrorFromGen;
    }

    // 8. Generate Human-Friendly Synthesized Summary Response
    const summarizationSystem = `
Kamu adalah Smart IT Assistant PT Voksel Electric Tbk. Kamu ramah, profesional, dan membantu mengelola operasional IT di perusahaan kabel PT Voksel Electric Tbk.
Kamu akan diberikan pesan pengguna, kueri SQL yang dijalankan (jika ada), hasil kueri dari database dalam bentuk JSON (jika ada), serta fakta yang kamu ingat tentang pengguna.

Tugas kamu:
- Berikan balasan dalam bahasa Indonesia yang ringkas, elegan, dan profesional.
- Rangkum data yang didapat dari database agar mudah dibaca oleh manusia. Format dalam tabel Markdown atau poin list yang teratur dan rapi.
- Beritahu pengguna secara implisit/eksplisit jika data berhasil diambil dari database produksi ITOpr (Readonly) secara langsung.
- JANGAN menyebutkan hal teknis seperti "JSON string", "Express server", "mock data" atau "simulated database". Bicaralah seolah-olah kamu tersambung ke sistem SAP / IT Operations utama PT Voksel Electric Tbk.
- Jika pengguna meminta untuk mengunduh/mengekspor data dan kueri SQL sebelumnya berhasil ditemukan, beritahu pengguna bahwa data siap diunduh dalam format Microsoft Excel atau dokumen PDF menggunakan tombol unduh yang telah disediakan di bawah gelembung obrolan ini.
- Jika ada kesalahan SQL (sqlError), beritahu pengguna dengan sopan bahwa kueri ditolak oleh lapisan keamanan database (SQL Security Layer) atau ada kesalahan sintaks, lalu tawarkan solusi.
`;

    const summaryPrompt = `
Kalimat Pengguna: "${messageText}"
Kueri SQL yang dijalankan: ${sqlQuery || 'Tidak ada kueri SQL'}
Hasil Eksekusi Database: ${sqlResult ? JSON.stringify(sqlResult) : 'Tidak ada hasil'}
Kesalahan Database (jika ada): ${sqlError || 'Tidak ada kesalahan'}
Informasi AI Memory:
${memoryContext}

Tulis tanggapan akhir yang profesional dan informatif dalam Bahasa Indonesia.`;

    let finalAnswer = 'Maaf, saya tidak dapat merumuskan tanggapan saat ini.';
    try {
      finalAnswer = await this.openRouter.generateContent(summaryPrompt, summarizationSystem);
    } catch (err: any) {
      console.error('Error generating response summary:', err);
      finalAnswer = `Maaf, terjadi kesalahan saat merumuskan tanggapan: ${err.message}`;
    }

    // 9. Persist AI Response in the Conversation History
    const aiMsg = await this.historyRepo.addMessage(
      conversationId,
      'AI',
      finalAnswer,
      sqlQuery || undefined,
      sqlResult || undefined,
      350 // Mock token usage
    );

    return {
      success: true,
      message: aiMsg,
      sqlQuery,
      sqlResult,
      sqlError,
      fromLearning
    };
  }
}
