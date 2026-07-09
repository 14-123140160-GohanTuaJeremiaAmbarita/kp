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
    historyContext: string,
    model?: string
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
      let responseText = await this.openRouter.generateContent(prompt, schemaInstruction, true, model, 600);
      let parsed: SqlQueryResponse | null = this.openRouter.tryParseAiJson(responseText);

      if (!parsed) {
        const retryPrompt = `${prompt}

Respons sebelumnya tidak dapat diurai. Ulangi dan balas HANYA satu objek JSON valid
dengan keys requiresQuery (boolean), sql (string atau null), dan reasoning (string).`;
        responseText = await this.openRouter.generateContent(retryPrompt, schemaInstruction, true, model, 600);
        parsed = this.openRouter.tryParseAiJson(responseText);
      }

      if (
        !parsed ||
        typeof parsed.requiresQuery !== 'boolean' ||
        !('sql' in parsed) ||
        (parsed.sql !== null && typeof parsed.sql !== 'string')
      ) {
        throw new Error('Gagal mengurai respons JSON dari AI. Format tidak dikenal.');
      }

      if (parsed.requiresQuery && parsed.sql) {
        const validation = this.validateSql(parsed.sql);
        if (!validation.isValid) {
          console.warn(`[SqlService] Query validation failed: ${validation.reason}`);
          parsed.sql = null;
          parsed.requiresQuery = false;
        }
      } else if (parsed.requiresQuery !== Boolean(parsed.sql)) {
        parsed.requiresQuery = false;
        parsed.sql = null;
      }

      return parsed;
    } catch (error) {
      console.error('[SqlService] Error generating SQL:', error);
      throw error;
    }
  }

  public validateSql(sql: string): { isValid: boolean; reason?: string } {
    const readOnly = this.validator.isReadOnlySelect(sql);
    if (!readOnly.isValid) return readOnly;
    const tables = this.validator.checkAllowedTables(sql);
    if (!tables.isValid) return tables;
    return this.validator.checkSensitiveColumns(sql);
  }
}
