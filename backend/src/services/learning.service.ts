import { HistoryRepository } from '../repositories/history.repository';

export class LearningService {
  private historyRepo = new HistoryRepository();

  public async learnFromFeedback(question: string, sqlQuery: string): Promise<void> {
    if (!question || !sqlQuery) return;
    const cleanQuestion = question.trim().toLowerCase();
    await this.historyRepo.addLearnedWord(cleanQuestion, sqlQuery);
    console.log(`[LearningService] Successfully learned/reinforced query for: "${cleanQuestion}"`);
  }

  public async getLearnedVocabulary(): Promise<Record<string, string>> {
    return await this.historyRepo.getLearnedWords();
  }
}
