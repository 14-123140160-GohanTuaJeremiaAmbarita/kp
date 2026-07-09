export class SqlValidatorService {
  private readonly allowedTables = new Set([
    'td_karyawan', 'td_computer', 'td_computerhistory', 'td_ticket', 'td_wo',
    'td_monitor', 'td_printer', 'td_hardlain', 'td_cctv', 'td_license',
    'td_datatoner', 'td_pabx', 'td_ipothers', 'td_typewo', 'td_subtype',
    'td_itpic', 'td_grup'
  ]);

  /**
   * Validates if the SQL query is a safe, read-only SELECT statement.
   * Returns true if safe, false if forbidden words or patterns are found.
   */
  public isReadOnlySelect(sql: string): { isValid: boolean; reason?: string } {
    const trimmed = sql.trim().toLowerCase();

    if (!trimmed) {
      return { isValid: false, reason: 'Kueri tidak boleh kosong.' };
    }

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
      'merge',
      'backup',
      'restore',
      'dbcc',
      'use',
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

    if (/\bselect\s+[\s\S]*\binto\b/i.test(trimmed)) {
      return { isValid: false, reason: 'SELECT INTO dilarang karena dapat membuat atau mengubah tabel.' };
    }

    if (/\b(openrowset|opendatasource|openquery)\s*\(/i.test(trimmed)) {
      return { isValid: false, reason: 'Akses sumber data eksternal dilarang.' };
    }

    return { isValid: true };
  }

  /**
   * Validates if the SQL query explicitly queries sensitive columns or uses SELECT * on sensitive tables.
   */
  public checkSensitiveColumns(sql: string): { isValid: boolean; reason?: string } {
    const lower = sql.toLowerCase();
    const sensitiveTables = ['td_karyawan', 'td_computer', 'td_itpic'];
    for (const table of sensitiveTables) {
      const sensitiveTablePattern = new RegExp(
        `\\b(?:from|join)\\s+(?:\\[[^\\]]+\\]\\.)?(?:dbo\\.)?\\[?${table}\\]?\\b`,
        'i'
      );
      if (!sensitiveTablePattern.test(sql)) continue;

      const selectList = sql.match(/\bselect\s+(?:distinct\s+)?([\s\S]*?)\bfrom\b/i)?.[1] || '';
      const alias = sql.match(new RegExp(
        `\\b(?:from|join)\\s+(?:\\[[^\\]]+\\]\\.)?(?:dbo\\.)?\\[?${table}\\]?(?:\\s+(?:as\\s+)?([a-z_][\\w]*))?`,
        'i'
      ))?.[1];
      const hasUnqualifiedStar = /(^|,)\s*\*(?=\s*(?:,|$))/i.test(selectList);
      const hasSensitiveAliasStar = alias
        ? new RegExp(`(?:^|,)\\s*${alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\.\\*(?=\\s*(?:,|$))`, 'i').test(selectList)
        : false;

      if (hasUnqualifiedStar || hasSensitiveAliasStar) {
        return {
          isValid: false,
          reason: `Validasi Keamanan Gagal: SELECT * pada ${table} tidak diizinkan karena mengandung kolom sensitif. Gunakan daftar kolom spesifik.`
        };
      }
    }

    for (const col of [
      'pass', 'password', 'token', 'secret', 'salary', 'gaji',
      'email_internal', 'email_voksel_coid', 'email_voksel_com'
    ]) {
      const regex = new RegExp(`\\bselect\\b[\\s\\S]*?(?:\\b|\\])${col}(?:\\b|\\[)[\\s\\S]*?\\bfrom\\b`, 'i');
      if (regex.test(lower)) {
        return { isValid: false, reason: `Validasi Keamanan Gagal: Kolom '${col}' dilarang diakses secara eksplisit lewat query AI.` };
      }
    }
    return { isValid: true };
  }

  public checkAllowedTables(sql: string): { isValid: boolean; reason?: string } {
    const tableMatches = sql.matchAll(/\b(?:from|join)\s+(?:\[[^\]]+\]\.)?(?:dbo\.)?\[?([a-z_][\w]*)\]?/gi);
    let found = false;
    for (const match of tableMatches) {
      found = true;
      const table = match[1].toLowerCase();
      if (!this.allowedTables.has(table)) {
        return { isValid: false, reason: `Tabel '${match[1]}' tidak termasuk sumber data chatbot yang diizinkan.` };
      }
    }
    return found
      ? { isValid: true }
      : { isValid: false, reason: 'Kueri tidak memiliki tabel sumber yang valid.' };
  }
}
