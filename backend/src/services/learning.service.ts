import { HistoryRepository } from '../repositories/history.repository';
import { SqlValidatorService } from '../ai/sqlValidator.service';

export class LearningService {
  private historyRepo = new HistoryRepository();
  private validator = new SqlValidatorService();

  public async learnFromFeedback(question: string, sqlQuery: string): Promise<void> {
    if (!question || !sqlQuery) return;
    const readOnly = this.validator.isReadOnlySelect(sqlQuery);
    const allowedTables = this.validator.checkAllowedTables(sqlQuery);
    const safeColumns = this.validator.checkSensitiveColumns(sqlQuery);
    if (!readOnly.isValid || !allowedTables.isValid || !safeColumns.isValid) {
      throw new Error(readOnly.reason || allowedTables.reason || safeColumns.reason || 'SQL feedback tidak aman.');
    }

    const cleanQuestion = question.trim();
    await this.historyRepo.addQueryKnowledge(cleanQuestion, sqlQuery.trim());
    console.log(`[LearningService] Knowledge pattern saved for: "${cleanQuestion}"`);
  }

  public async getLearnedVocabulary(): Promise<Record<string, string>> {
    return await this.historyRepo.getLearnedWords();
  }
}
