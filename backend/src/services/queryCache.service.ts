import { HistoryRepository } from '../repositories/history.repository';

/**
 * Vocabulary lookup only.
 *
 * This service no longer returns hard-coded SQL. Learned entries are supplied
 * to the AI as language hints, while the AI remains responsible for intent
 * understanding and SQL generation.
 */
export class QueryCacheService {
  private historyRepo = new HistoryRepository();

  public async getVocabularyHints(messageText: string): Promise<string[]> {
    const hints = await this.historyRepo.getQueryKnowledgeHints(8);
    if (!hints.length) return [];

    const terms = new Set(
      messageText.toLowerCase().split(/[^\p{L}\p{N}_]+/u).filter(word => word.length > 2)
    );
    const relevant = hints.filter(hint => {
      const lowerHint = hint.toLowerCase();
      return [...terms].some(term => lowerHint.includes(term));
    });
    return relevant.slice(0, 4);
  }
}
