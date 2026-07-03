export class SqlValidatorService {
  /**
   * Validates if the SQL query is a safe, read-only SELECT statement.
   * Returns true if safe, false if forbidden words or patterns are found.
   */
  public isReadOnlySelect(sql: string): { isValid: boolean; reason?: string } {
    const trimmed = sql.trim().toLowerCase();

    // Must be a SELECT query
    if (!trimmed.startsWith('select')) {
      return { isValid: false, reason: 'Kueri harus diawali dengan instruksi SELECT.' };
    }

    // Prohibited commands
    const prohibitedKeywords = [
      'insert',
      'update',
      'delete',
      'drop',
      'alter',
      'truncate',
      'create',
      'grant',
      'revoke',
      'exec',
      'execute',
      'xp_',
      'sp_'
    ];

    for (const keyword of prohibitedKeywords) {
      const regex = new RegExp(`\\b${keyword}\\b`, 'i');
      if (regex.test(trimmed)) {
        return { isValid: false, reason: `Kata kunci '${keyword}' dilarang demi keamanan data.` };
      }
    }

    // Check for comments or multi-statements to prevent SQL injection
    if (trimmed.includes(';') && trimmed.indexOf(';') !== trimmed.length - 1) {
      return { isValid: false, reason: 'Multi-statement (menggunakan tanda titik koma ;) dilarang.' };
    }

    if (trimmed.includes('--') || trimmed.includes('/*')) {
      return { isValid: false, reason: 'Komentar SQL dilarang.' };
    }

    return { isValid: true };
  }
}
