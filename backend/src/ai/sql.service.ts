import { OpenRouterService } from './openrouter.service';
import { SchemaService } from './schema.service';
import { SqlValidatorService } from './sqlValidator.service';
import { SqlQueryResponse } from '../types/chatPipeline';

export class SqlService {
  private openRouter = new OpenRouterService();
  private schema = new SchemaService();
  private validator = new SqlValidatorService();

  public async generateSql(
    messageText: string,
    memoryContext: string,
    historyContext: string
  ): Promise<SqlQueryResponse> {
    const schemaInstruction = this.schema.getSystemSchemaInstruction();

    const prompt = `
Fakta Personal Pengguna yang Diingat AI (Suntikkan jika relevan):
${memoryContext}

Histori Percakapan Terakhir:
${historyContext}

Pesan Pengguna Sekarang: "${messageText}"

Format keluaran Anda harus berupa objek JSON murni tanpa hiasan markdown atau pembungkus lain (hanya objek JSON).`;

    try {
      const responseText = await this.openRouter.generateContent(prompt, schemaInstruction, true);
      const parsed: SqlQueryResponse | null = this.openRouter.tryParseAiJson(responseText);

      if (!parsed) {
        throw new Error('Gagal mengurai respons JSON dari AI. Format tidak dikenal.');
      }

      if (parsed.requiresQuery && parsed.sql) {
        // Validate the generated SQL
        const validation = this.validator.isReadOnlySelect(parsed.sql);
        if (!validation.isValid) {
          console.warn(`[SqlService] Query validation failed: ${validation.reason}`);
          parsed.sql = null;
          parsed.requiresQuery = false;
        }
      }

      return parsed;
    } catch (error) {
      console.error('[SqlService] Error generating SQL:', error);
      return {
        requiresQuery: false,
        sql: null,
        reasoning: 'Gagal menganalisis atau menghasilkan kueri SQL otomatis.'
      };
    }
  }
}
