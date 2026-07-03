import { HistoryRepository } from '../repositories/history.repository';

export class QueryCacheService {
  private historyRepo = new HistoryRepository();

  public async lookup(messageText: string): Promise<{ sql: string | null; fromLearning: boolean }> {
    const cleanMsg = messageText.trim().toLowerCase();
    const learnedWords = await this.historyRepo.getLearnedWords();

    // 1. Direct match check
    if (learnedWords[cleanMsg]) {
      return { sql: learnedWords[cleanMsg], fromLearning: true };
    }

    // 2. Fuzzy/typo dictionary matching for words
    const words = cleanMsg.split(/\s+/);
    let changed = false;
    const correctedWords = words.map(w => {
      if (learnedWords[w]) {
        changed = true;
        return learnedWords[w];
      }
      return w;
    });

    if (changed) {
      const correctedMsg = correctedWords.join(' ');
      if (learnedWords[correctedMsg]) {
        return { sql: learnedWords[correctedMsg], fromLearning: true };
      }
    }

    return { sql: null, fromLearning: false };
  }
}
