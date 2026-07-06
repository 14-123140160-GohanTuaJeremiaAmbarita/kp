// backend/src/ai/openrouter.service.ts
// Versi OpenRouter dengan dukungan pemilihan model dinamis dari frontend.

import { loadEnv } from "../utils/env";
import { GoogleGenAI } from "@google/genai";

loadEnv();

function buildRouterSystemPrompt(schemaText: string): string {
    return `
Kamu adalah Smart IT Assistant PT Voksel Electric Tbk yang ahli dalam SQL Server (T-SQL).
Tugasmu adalah menerjemahkan kebutuhan bahasa alami pengguna (termasuk yang ada typo/singkatan) menjadi query SQL SELECT yang valid dan optimal.

PENTING: HANYA gunakan nama tabel dan nama kolom yang TERDAFTAR di skema di bawah ini.
JANGAN PERNAH mengarang/menebak nama tabel atau kolom yang tidak ada di skema, walaupun terdengar masuk akal.
Kalau pengguna meminta data/kolom yang tidak ada di skema, jawab dengan action GENERAL_CHAT dan jelaskan bahwa data tersebut tidak tersedia.

=== SKEMA DATABASE (sumber kebenaran, diambil langsung dari SQL Server) ===
${schemaText}
=== AKHIR SKEMA ===

Kamu HARUS merespons HANYA dengan JSON MURNI (tanpa markdown code fence, tanpa teks tambahan apapun di luar JSON) dengan format berikut:
{
  "action": "EXECUTE_SQL" atau "GENERAL_CHAT",
  "sqlQuery": "T-SQL SELECT query yang valid jika EXECUTE_SQL. Kosongkan jika GENERAL_CHAT.",
  "content": "Jawaban sapaan/umum langsung jika action GENERAL_CHAT, atau penjelasan singkat kalau data yang diminta tidak tersedia di skema."
}

ATURAN PEMBUATAN QUERY:

1. AKSES DATA (Read-Only):
   - HANYA BOLEH menggunakan perintah SELECT. Dilarang DROP/DELETE/UPDATE/INSERT/ALTER/EXEC.

2. KOREKSI BAHASA:
   - Koreksi dulu typo/singkatan pengguna sebelum menentukan tabel & kolom (mis. "krywn", "karywan" -> karyawan).

3. FLEKSIBILITAS KOLOM (PENTING):
   - Jika pertanyaan bersifat UMUM/LUAS dan TIDAK menyebut kolom tertentu (contoh: "tampilkan data komputer", "semua data karyawan", "berikan data HRD"), gunakan SELECT * FROM [tabel]. JANGAN menuliskan satu per satu nama seluruh kolom kalau user tidak minta detail spesifik.
   - Jika pertanyaan SPESIFIK menyebut kolom/informasi tertentu (contoh: "tampilkan merk dan tipe komputer saja", "nama dan nrp karyawan IT"), pilih HANYA kolom yang relevan dengan permintaan itu -- jangan gunakan SELECT * di kasus ini supaya hasil tetap ringkas dan relevan.
   - Untuk hasil JOIN antar tabel, tetap pilih kolom secara eksplisit (jangan SELECT * lintas tabel) supaya tidak terjadi duplikasi nama kolom yang membingungkan.

4. FILTER DEPARTEMEN (PENTING):
   - Satu departemen: WHERE Dept = 'IT'
   - Banyak departemen sekaligus: WHERE Dept IN ('IT', 'GA', 'HRD') -- JANGAN pakai OR/LIKE berantai untuk kasus ini, gunakan IN(...) supaya akurat dan rapi.
   - JANGAN gunakan LIKE untuk kolom Dept (nilai departemen itu tetap/pasti, LIKE berisiko menangkap departemen lain yang mirip namanya).
   - LIKE hanya dipakai untuk pencarian nama/teks bebas, BUKAN untuk kolom Dept. Contoh: "berawalan huruf ..." -> LIKE 'huruf%'; "mengandung kata ..." -> LIKE '%kata%'; "berakhiran ..." -> LIKE '%huruf'.

5. LOGIKA COUNT:
   - Jika pertanyaan mengandung kata "berapa", "jumlah", atau "hitung", WAJIB gunakan SELECT COUNT(*) AS Total (tambahkan filter WHERE yang relevan jika ada).

6. JOIN ANTAR TABEL (PENTING):
   - Gunakan JOIN kalau pengguna meminta kombinasi data dari 2 tabel atau lebih, misalnya "karyawan beserta komputernya", "aset milik departemen X", atau "tiket yang terkait work order tertentu".
   - Selalu gunakan alias tabel pendek (mis. k untuk karyawan, c untuk computer) supaya query rapi dan tidak ambigu saat ada nama kolom yang sama di kedua tabel.
   - Cari kolom penghubung yang masuk akal antar tabel (biasanya Nrp untuk relasi karyawan-aset, atau NoWO untuk relasi tiket-work order) berdasarkan hint relasi di skema di atas.
   - Pola dasar JOIN:
     SELECT k.Nrp, k.Name, k.Dept, c.CodeCpu, c.CPU_Merk, c.CPU_Type
     FROM TD_karyawan k
     JOIN TD_COMPUTER c ON k.Nrp = c.Nrp
     WHERE k.Dept = 'HRD'
   - Kalau relasinya tidak jelas/tidak ada kolom penghubung yang cocok di skema, JANGAN memaksakan JOIN dengan menebak kolom -- balas GENERAL_CHAT dan jelaskan bahwa relasi antar tabel tersebut tidak tersedia di skema.

7. FILTER TAMBAHAN:
   - Kombinasikan multi-filter dengan AND/OR sesuai logika permintaan. Filter beda kategori (mis. departemen DAN status) biasanya AND; pilihan dalam kategori yang sama (mis. beberapa departemen) gunakan IN(...) seperti aturan #4.
   - Jika pengguna meminta list/daftar panjang tanpa COUNT, tampilkan tanpa TOP kecuali tabelnya berpotensi sangat besar (ribuan baris) dan tidak ada filter spesifik -- dalam kasus itu gunakan 'TOP 200' demi keamanan performa.

CONTOH PENANGANAN QUERY (pola, bukan jawaban yang harus ditiru persis):

1) "tampilkan semua data komputer" (permintaan umum/luas, tanpa sebut kolom)
   -> SELECT * FROM TD_computer

2) "tampilkan merk dan tipe komputer IT saja" (spesifik menyebut kolom)
   -> SELECT CPU_Merk, CPU_Type, NameComp FROM TD_computer WHERE Dept = 'IT'

3) "berikan saya karyawan IT, GA, dan HRD" (banyak departemen)
   -> SELECT * FROM TD_karyawan WHERE Dept IN ('IT', 'GA', 'HRD')

4) "berapa jumlah karyawan di departemen marketing"
   -> SELECT COUNT(*) AS Total FROM TD_karyawan WHERE Dept = 'Marketing'

5) "berikan saya data karyawan hrd dan aset komputernya" (JOIN)
   -> SELECT k.Nrp, k.Name, k.Dept, c.CodeCpu, c.CPU_Merk, c.CPU_Type, c.Processor
      FROM TD_karyawan k
      JOIN TD_COMPUTER c ON k.Nrp = c.Nrp
      WHERE k.Dept = 'HRD'

6) "karyawan yang namanya berawalan I di departemen IT" (LIKE untuk nama, bukan Dept)
   -> SELECT * FROM TD_karyawan WHERE Dept = 'IT' AND Name LIKE 'I%'

7) "komputer lenovo yang dipakai anak IT, dibeli tahun 2024" (filter campuran)
   -> SELECT CodeCpu, CPU_Merk, CPU_Type, NameComp, Dept, cpu_rcptdate
      FROM TD_COMPUTER
      WHERE CPU_Merk = 'Lenovo' AND Dept = 'IT' AND YEAR(cpu_rcptdate) = 2024
`;
}

const ANSWER_SYSTEM_PROMPT = `
Kamu adalah Smart IT Assistant PT Voksel Electric Tbk.

Tugasmu adalah menjelaskan hasil query SQL Server kepada pengguna menggunakan Bahasa Indonesia yang profesional.

ATURAN WAJIB:

1. Gunakan HANYA data yang diberikan sistem.

2. DILARANG membuat asumsi.

3. DILARANG memperkirakan kondisi perusahaan.

4. DILARANG menambahkan informasi yang tidak terdapat pada data hasil query.

5. Jika data hanya berupa COUNT atau agregasi, cukup jelaskan nilai tersebut.

6. Jika informasi tidak tersedia pada hasil query, katakan bahwa informasi tersebut memang tidak tersedia.

7. Jangan menyebut kemungkinan, dugaan, asumsi, prediksi ataupun analisis yang tidak dapat dibuktikan dari data.

8. Jika hasil query kosong:
   - katakan bahwa tidak ditemukan data yang sesuai.

9. Jika hasil query berisi beberapa baris:
   - buat ringkasan singkat.
   - tampilkan maksimal 5 insight.

10. Jika hasil query hanya memiliki satu baris:
   - jelaskan isi data tersebut tanpa membuat interpretasi tambahan.

11. Jika hasil query berupa COUNT:

Contoh:

Total tiket terbuka: 1

Insight

• Saat ini terdapat 1 tiket yang masih berstatus terbuka.
• Data yang tersedia hanya menunjukkan jumlah tiket terbuka.
• Informasi mengenai total seluruh tiket ataupun tingkat penyelesaian tidak tersedia pada hasil query.

12. Jangan pernah menggunakan kalimat seperti:

- kemungkinan...
- diperkirakan...
- asumsi...
- dapat diasumsikan...
- tampaknya...
- terlihat bahwa...
- kemungkinan besar...
- tingkat penyelesaian tinggi...
- perusahaan memiliki...

kecuali benar-benar ada pada data.

13. Gunakan format:

Judul hasil

Insight

• ...
• ...
• ...

maksimal 5 poin.
`;

/** Daftar model yang BOLEH dipilih dari frontend — proteksi supaya user tidak bisa kirim model_id sembarangan lewat request langsung ke API. */
const ALLOWED_MODELS = new Set([
    "deepseek/deepseek-chat",
    "deepseek/deepseek-r1",
    "deepseek/deepseek-v4-pro",
    "openai/gpt-4o-mini",
    "openai/gpt-5",
    "google/gemini-3.5-flash",
    "google/gemini-2.5-flash",
    "anthropic/claude-sonnet-4.5",
    "anthropic/claude-3.5-sonnet",
    "deepseek-v4-flash",
    "deepseek-v4-pro",
    "openai",
    "claude",
    "gemini-3.5-flash"
]);

interface HistoryMessage {
    role: string;
    content: string;
}

interface OpenRouterChatMessage {
    role: "system" | "user" | "assistant";
    content: string;
}

interface OpenRouterAPIResponse {
    choices?: Array<{ message?: { role: string; content: string } }>;
    error?: { message: string; code?: number };
}

function normalizeHistoryRole(role: string): "user" | "assistant" {
    if (role === "model" || role === "assistant") return "assistant";
    return "user";
}

export class OpenRouterService {
    private readonly DEFAULT_MODEL = process.env.OPENROUTER_MODEL || "deepseek/deepseek-chat";
    private readonly API_URL = "https://openrouter.ai/api/v1/chat/completions";

    private getGeminiClient(): GoogleGenAI | null {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) return null;
        return new GoogleGenAI({
            apiKey,
            httpOptions: {
                headers: {
                    'User-Agent': 'aistudio-build',
                }
            }
        });
    }

    private isOpenRouterEnabled(): boolean {
        return !!process.env.OPENROUTER_API_KEY;
    }

    private getApiKey(): string {
        const apiKey = process.env.OPENROUTER_API_KEY || process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error("OPENROUTER_API_KEY atau GEMINI_API_KEY belum dikonfigurasi.");
        return apiKey;
    }

    /** Validasi model yang diminta frontend; fallback ke default kalau tidak dikenali/kosong. */
    private resolveModel(requestedModel?: string): string {
        if (!requestedModel) return this.DEFAULT_MODEL;
        
        // Map frontend dropdown IDs to valid OpenRouter model IDs
        if (requestedModel === 'deepseek-v4-flash') return 'deepseek/deepseek-chat';
        if (requestedModel === 'deepseek-v4-pro') return 'deepseek/deepseek-r1'; 
        if (requestedModel === 'openai') return 'openai/gpt-4o-mini';
        if (requestedModel === 'claude') return 'anthropic/claude-3.5-sonnet';
        if (requestedModel === 'gemini-3.5-flash') return 'google/gemini-2.5-flash';

        // Keep legacy mapping
        if (requestedModel === 'deepseek-v3') return 'deepseek/deepseek-chat';
        if (requestedModel === 'gpt-4o') return 'openai/gpt-4o-mini';

        if (ALLOWED_MODELS.has(requestedModel)) return requestedModel;
        return this.DEFAULT_MODEL;
    }

    private async callOpenRouter(
        messages: OpenRouterChatMessage[],
        temperature: number,
        forceJson: boolean,
        model: string
    ): Promise<string> {
        const apiKey = this.getApiKey();

        const body: Record<string, any> = {
            model,
            messages,
            temperature,
            max_tokens: 2048,
        };

        if (forceJson) {
            body.response_format = { type: "json_object" };
        }

        const response = await fetch(this.API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
                "HTTP-Referer": process.env.APP_URL || "http://localhost:5173",
                "X-Title": "Voksel Smart IT Assistant",
            },
            body: JSON.stringify(body),
        });

        const data = (await response.json()) as OpenRouterAPIResponse;

        if (!response.ok || data.error) {
            const errMsg = data.error?.message || `HTTP ${response.status}`;
            throw new Error(`OpenRouter API error (model: ${model}): ${errMsg}`);
        }

        const content = data.choices?.[0]?.message?.content;
        if (!content) throw new Error("OpenRouter tidak mengembalikan konten yang valid.");
        return content;
    }

    private stripJsonFence(text: string): string {
        return text.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();
    }

    private extractJsonBlock(text: string): string | null {
        const match = text.match(/\{[\s\S]*\}/);
        return match ? match[0] : null;
    }

    public tryParseAiJson(rawText: string): any {
        const cleaned = this.stripJsonFence(rawText);
        try {
            return JSON.parse(cleaned);
        } catch {
            const extracted = this.extractJsonBlock(cleaned);
            if (extracted) {
                try {
                    return JSON.parse(extracted);
                } catch {
                    // lanjut ke null
                }
            }
            return null;
        }
    }

    public async generateContent(
        prompt: string,
        systemInstruction?: string,
        responseJson: boolean = false,
        model?: string
    ): Promise<string> {
        if (!this.isOpenRouterEnabled()) {
            const ai = this.getGeminiClient();
            if (!ai) {
                throw new Error("Neither OPENROUTER_API_KEY nor GEMINI_API_KEY is configured.");
            }
            try {
                const response = await ai.models.generateContent({
                    model: "gemini-3.5-flash",
                    contents: prompt,
                    config: {
                        systemInstruction,
                        responseMimeType: responseJson ? "application/json" : undefined,
                        temperature: 0.1,
                    }
                });
                return response.text || "";
            } catch (error: any) {
                console.error('[GeminiService] Native generateContent API Call Error:', error);
                throw error;
            }
        }

        const selectedModel = this.resolveModel(model);
        const messages: OpenRouterChatMessage[] = [];
        if (systemInstruction) {
            messages.push({ role: "system", content: systemInstruction });
        }
        messages.push({ role: "user", content: prompt });
        try {
            return await this.callOpenRouter(messages, 0.1, responseJson, selectedModel);
        } catch (error: any) {
            console.error('[OpenRouterService] generateContent API Call Error:', error);
            throw error;
        }
    }

    async analyzeAndChat(
        question: string,
        schemaText: string,
        history: HistoryMessage[] = [],
        requestedModel?: string
    ): Promise<any> {
        if (!this.isOpenRouterEnabled()) {
            const ai = this.getGeminiClient();
            if (!ai) {
                return {
                    action: "GENERAL_CHAT",
                    sqlQuery: "",
                    content: "Koneksi ke AI belum dikonfigurasi. Harap tentukan GEMINI_API_KEY atau OPENROUTER_API_KEY."
                };
            }

            const systemPrompt = buildRouterSystemPrompt(schemaText);
            
            // Map history to standard contents structure
            const contents: any[] = [];
            for (const h of history) {
                const role = normalizeHistoryRole(h.role);
                contents.push({
                    role,
                    parts: [{ text: h.content }]
                });
            }
            contents.push({
                role: "user",
                parts: [{ text: question }]
            });

            try {
                const response = await ai.models.generateContent({
                    model: "gemini-3.5-flash",
                    contents,
                    config: {
                        systemInstruction: systemPrompt,
                        responseMimeType: "application/json",
                        temperature: 0.1,
                    }
                });

                const rawText = response.text || "";
                const parsed = this.tryParseAiJson(rawText);
                if (parsed) return parsed;

                console.error("[AI LOG] Native Gemini response was not valid JSON, text:", rawText.slice(0, 300));
            } catch (error) {
                console.error("Gagal saat native analyzeAndChat:", error);
            }

            return {
                action: "GENERAL_CHAT",
                sqlQuery: "",
                content: "Maaf, saya kesulitan memproses kueri SQL. Silakan tanyakan hal lain atau sederhanakan pertanyaan Anda."
            };
        }

        const model = this.resolveModel(requestedModel);
        const messages: OpenRouterChatMessage[] = [
            { role: "system", content: buildRouterSystemPrompt(schemaText) },
            ...history.map((h) => ({
                role: normalizeHistoryRole(h.role),
                content: h.content,
            })),
            { role: "user", content: question },
        ];

        // Percobaan 1
        try {
            const rawText = await this.callOpenRouter(messages, 0.1, true, model);
            const parsed = this.tryParseAiJson(rawText);
            if (parsed) return parsed;

            console.error("[AI LOG] Respons bukan JSON valid (percobaan 1), raw text:", rawText.slice(0, 300));
        } catch (error) {
            console.error("Gagal saat analyzeAndChat (percobaan 1):", error);
        }

        // Percobaan 2: tegaskan ulang instruksi format, kadang cukup untuk "menyadarkan" model
        try {
            const retryMessages: OpenRouterChatMessage[] = [
                ...messages,
                {
                    role: "user",
                    content: "PENTING: Balas HANYA dengan JSON murni sesuai format yang diminta di system prompt. Jangan ada teks penjelasan di luar JSON.",
                },
            ];
            const rawText = await this.callOpenRouter(retryMessages, 0.1, true, model);
            const parsed = this.tryParseAiJson(rawText);
            if (parsed) return parsed;

            console.error("[AI LOG] Respons bukan JSON valid (percobaan 2), raw text:", rawText.slice(0, 300));
        } catch (error) {
            console.error("Gagal saat analyzeAndChat (percobaan 2):", error);
        }

        // Kedua percobaan gagal -> balas dengan sopan
        return {
            action: "GENERAL_CHAT",
            sqlQuery: "",
            content: "Maaf, saya kesulitan memahami format jawaban untuk pertanyaan ini. Bisa dicoba tanyakan dengan kalimat yang lebih sederhana?",
        };
    }

    async generateFinalAnswerWithData(
        question: string,
        databaseData: any[],
        history: HistoryMessage[] = [],
        requestedModel?: string
    ): Promise<string> {
        const stringifiedData = JSON.stringify(databaseData.slice(0, 50));
        const promptInsight = `
Pertanyaan pengguna:

${question}

Hasil query SQL:

${stringifiedData}

Jawablah hanya berdasarkan data di atas.

Jangan membuat asumsi.

Jangan menambahkan informasi yang tidak ada.

Jika data berupa COUNT maka jelaskan nilai COUNT tersebut.

Jika data kosong katakan bahwa tidak ditemukan data.

Berikan maksimal 5 insight yang seluruhnya berasal dari data.
`;

        if (!this.isOpenRouterEnabled()) {
            const ai = this.getGeminiClient();
            if (!ai) {
                return "Koneksi ke AI belum dikonfigurasi.";
            }

            try {
                const response = await ai.models.generateContent({
                    model: "gemini-3.5-flash",
                    contents: promptInsight,
                    config: {
                        systemInstruction: ANSWER_SYSTEM_PROMPT,
                        temperature: 0.1,
                    }
                });
                return response.text || "Gagal merumuskan rangkuman data.";
            } catch (error) {
                console.error("Gagal saat native generateFinalAnswerWithData:", error);
                return "Terjadi kesalahan saat merangkum data secara langsung.";
            }
        }

        const model = this.resolveModel(requestedModel);
        try {
            const messages: OpenRouterChatMessage[] = [
                { role: "system", content: ANSWER_SYSTEM_PROMPT },
                { role: "user", content: promptInsight },
            ];

            const rawText = await this.callOpenRouter(messages, 0.1, false, model);
            return rawText.trim();
        } catch (error) {
            console.error("Gagal saat generateFinalAnswer:", error);
            return "Terjadi kesalahan saat merangkum data.";
        }
    }
}

export { OpenRouterService as GeminiService };
