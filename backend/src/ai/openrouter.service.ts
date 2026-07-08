// backend/src/ai/openrouter.service.ts
import { loadEnv } from "../utils/env";
import OpenAI from "openai";

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
   - DILARANG KERAS menggunakan klausul \`SELECT TOP\` (misal: \`TOP 10\`, \`TOP 200\`, dll) dalam kondisi apapun. Jika pengguna tidak menggunakan COUNT, selalu tampilkan seluruh baris data tanpa dibatasi oleh TOP. Sistem frontend akan menangani paginasi secara otomatis.

8. KECERDASAN INTERPRETASI PERTANYAAN (SANGAT PENTING):
   Sistem frontend akan merender TABEL dan GRAFIK secara otomatis berdasarkan hasil SQL yang kamu berikan. Oleh karena itu, ikuti instruksi ketat ini:
   
   ATURAN MUTLAK:
   a) ATURAN KATA "GRAFIK" / "CHART":
      JIKA input pengguna MENGANDUNG kata "grafik" atau "chart" (contoh: "buatkan grafik karyawan voksel", "grafik hrd"), KAMU DILARANG KERAS menjawab GENERAL_CHAT atau meminta detail lebih lanjut. KAMU WAJIB mengeksekusi EXECUTE_SQL menggunakan kueri agregasi (COUNT GROUP BY).
      - Contoh umum: SELECT Dept, COUNT(*) AS Total FROM TD_karyawan GROUP BY Dept
      - Contoh departemen spesifik: SELECT Dept, COUNT(*) AS Total FROM TD_karyawan WHERE Dept IN ('IT', 'HRD') GROUP BY Dept
      - Contoh aset: SELECT Dept, COUNT(*) AS Total FROM TD_computer GROUP BY Dept
   
   b) ATURAN KATA "DATA" ATAU PENYEBUTAN DEPARTEMEN:
      JIKA input pengguna MENGANDUNG kata "data" (misal: "berikan data karyawan it", "berikan saja tabel data nya") ATAU menyebut nama departemen (misal: "arti hrd", "penjelasan marketing"), KAMU WAJIB mengeksekusi EXECUTE_SQL. DILARANG KERAS menjawab GENERAL_CHAT.
      - "arti HRD" -> SELECT * FROM TD_karyawan WHERE Dept = 'HRD'
      - "data karyawan IT" -> SELECT * FROM TD_karyawan WHERE Dept = 'IT'
      - "tabel data semua" -> SELECT * FROM TD_karyawan
   
   c) ATURAN KATA ASET / KOMPUTER / TIKET:
      - "komputer", "PC", "laptop" -> kaitkan ke TD_computer. (Contoh: "tampilkan komputer lenovo" -> SELECT * FROM TD_computer WHERE CPU_Merk LIKE '%Lenovo%')
      - "tiket", "masalah" -> kaitkan ke TD_TICKET
      - "work order", "WO" -> kaitkan ke TD_WO
   
   d) SELAIN KATA KUNCI DI ATAS (SAPAAN & PENGETAHUAN UMUM):
      JIKA pengguna HANYA menyapa ("halo") atau bertanya hal di luar database ("siapa penemu listrik"), pelajari input dan balas dengan GENERAL_CHAT yang ramah dan suportif. Tapi jika sekecil apapun ada indikasi meminta data/tabel/grafik, kembali ke aturan a, b, atau c.

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

8) "berikan penjelasan marketing" (menyebut departemen → EXECUTE_SQL)
   -> SELECT * FROM TD_karyawan WHERE Dept = 'Marketing'

9) "grafik perbandingan IT, HRD, Marketing" (perbandingan → COUNT GROUP BY)
   -> SELECT Dept, COUNT(*) AS Total FROM TD_karyawan WHERE Dept IN ('IT', 'HRD', 'Marketing') GROUP BY Dept

10) "halo" (sapaan)
   -> GENERAL_CHAT: "Halo! Saya Smart IT Assistant PT Voksel Electric Tbk. Ada yang bisa saya bantu hari ini?"
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

9. PROAKTIF MENAWARKAN VISUALISASI GRAFIK (SANGAT PENTING):
   - Jika pengguna belum meminta grafik namun hasil tabulasi data terlihat cocok untuk divisualisasikan (contoh: mengandung perbandingan antar departemen atau tipe barang), sisipkan satu kalimat proaktif di akhir penjelasan Anda.
   - Contoh kalimat: "Anda juga dapat melihat representasi visual dari data ini secara langsung dengan berpindah ke tab **Grafik Interaktif**, atau cukup minta saya membuatkan grafiknya."

9. Jika hasil query berisi beberapa baris:
   - buat ringkasan singkat berupa jumlah total baris dan deskripsi naratif umum.
   - tampilkan maksimal 5 insight naratif.
   - DILARANG KERAS menulis daftar data baris per baris (seperti "1. Nrp: 00020, Name: FUTTUH", "2. Nrp: 007060..."). DILARANG membuat tabel Markdown dari data. DILARANG membuat daftar bernomor dari data mentah.
   - Sistem frontend sudah OTOMATIS merender tabel interaktif dan grafik dari data SQL. Kamu HANYA perlu menulis insight naratif saja.
   - Contoh yang BENAR: "Ditemukan 200 karyawan dari database. Mayoritas berasal dari departemen Production dan IT."
   - Contoh yang SALAH: "Berikut data karyawan: 1. Nrp: 00020, Name: FUTTUH, Dept: IT..."

10. Jika hasil query hanya memiliki satu baris:
    - jelaskan isi data tersebut tanpa membuat interpretasi tambahan.

11. Jika hasil query berupa COUNT:
    Contoh:
    Total tiket terbuka: 1
    Insight
    • Saat ini terdapat 1 tiket yang masih berstatus terbuka.

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

**Judul hasil**

Insight
• ... (naratif, bukan data mentah)
• ...
• ...

maksimal 5 poin.
`;

interface HistoryMessage {
    role: string;
    content: string;
}

interface OpenRouterChatMessage {
    role: "system" | "user" | "assistant";
    content: string;
}

function normalizeHistoryRole(role: string): "user" | "assistant" {
    if (role === "model" || role === "assistant") return "assistant";
    return "user";
}

export class OpenRouterService {
    private readonly DEFAULT_MODEL = "deepseek-ai/DeepSeek-V4-Flash";

    private getClientForModel(modelName: string): OpenAI | null {
        let baseURL = "";
        let apiKey = "";

        if (modelName.startsWith("anthropic/") || modelName.startsWith("google-ai-studio/") || modelName.startsWith("openai/") || modelName.startsWith("groq/")) {
            const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
            if (!accountId) throw new Error("CLOUDFLARE_ACCOUNT_ID is not configured in .env");
            baseURL = `https://gateway.ai.cloudflare.com/v1/${accountId}/default/compat`;
            
            const token = process.env.CLOUDFLARE_API_TOKEN;
            if (!token) throw new Error("CLOUDFLARE_API_TOKEN is not configured in .env");
            
            let providerKey = "";
            if (modelName.startsWith("google-ai-studio/")) {
                providerKey = process.env.GOOGLE_API_KEY || "";
            } else if (modelName.startsWith("anthropic/")) {
                providerKey = process.env.ANTHROPIC_API_KEY || "";
            } else if (modelName.startsWith("openai/")) {
                providerKey = process.env.OPENAI_API_KEY || "";
            } else if (modelName.startsWith("groq/")) {
                providerKey = process.env.GROQ_API_KEY || "";
            }
            
            return new OpenAI({
                baseURL,
                apiKey: providerKey,
                defaultHeaders: {
                    "cf-aig-authorization": `Bearer ${token}`
                }
            });
        } else if (modelName.startsWith("@cf/") || modelName === "Mistral 7B") {
            const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
            if (!accountId) throw new Error("CLOUDFLARE_ACCOUNT_ID is not configured in .env");
            baseURL = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/v1`;
            
            const token = process.env.CLOUDFLARE_API_TOKEN;
            if (!token) throw new Error("CLOUDFLARE_API_TOKEN is not configured in .env");
            apiKey = token;
        } else if (modelName.includes("/") && !modelName.startsWith("@cf/")) {
            baseURL = "https://api.siliconflow.com/v1";
            const token = process.env.SILICONFLOW_TOKEN;
            if (!token) throw new Error("SILICONFLOW_TOKEN is not configured in .env");
            apiKey = token;
        } else {
            // Default fallback to GitHub Models for standard short string IDs (gpt-4o, claude-3-5-sonnet, gemini-1.5-flash)
            baseURL = "https://models.inference.ai.azure.com";
            const token = process.env.GITHUB_MODELS_TOKEN;
            if (!token) throw new Error("GITHUB_MODELS_TOKEN is not configured in .env");
            apiKey = token;
        }
        
        return new OpenAI({ baseURL, apiKey });
    }

    private resolveModel(requestedModel?: string): string {
        if (!requestedModel) return this.DEFAULT_MODEL;
        return requestedModel;
    }

    private calculateDynamicTokens(
        type: 'router' | 'sql' | 'summary',
        inputLength: number = 0,
        resultSize: number = 0
    ): number {
        if (type === 'router') {
            return 300;
        }
        if (type === 'sql') {
            return 300;
        }
        if (type === 'summary') {
            if (resultSize === 0) {
                return 250;
            }
            const budget = 250 + (resultSize * 5);
            return Math.min(500, budget);
        }
        return 300;
    }

    private async callOpenAI(
        messages: OpenRouterChatMessage[],
        temperature: number,
        forceJson: boolean,
        model: string,
        maxTokens?: number
    ): Promise<string> {
        const client = this.getClientForModel(model);
        if (!client) throw new Error("Failed to initialize OpenAI client for model: " + model);

        const currentMaxTokens = maxTokens ?? 150;

        let finalModel = model;
        if (model === "google-ai-studio/gemini-3.5-flash") finalModel = "google-ai-studio/gemini-2.5-flash";
        if (model === "openai/gpt-4.0") finalModel = "openai/gpt-4o";
        if (model === "openai/gpt-4.5") finalModel = "openai/gpt-4-turbo";
        if (model === "openai/gpt-5.0") finalModel = "openai/gpt-4o";

        const requestParams: any = {
            model: finalModel,
            messages,
            temperature,
            max_tokens: currentMaxTokens,
        };

        if (forceJson) {
            // Claude via AI gateway OpenAI compatibility does not support json_object format flag yet.
            if (!finalModel.startsWith("anthropic/")) {
                requestParams.response_format = { type: "json_object" };
            }
        }

        const response = await client.chat.completions.create(requestParams);
        const content = response.choices?.[0]?.message?.content;
        
        if (!content) throw new Error("OpenAI API did not return valid content.");
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
        model?: string,
        maxTokens: number = 150
    ): Promise<string> {
        const selectedModel = this.resolveModel(model);
        const messages: OpenRouterChatMessage[] = [];
        if (systemInstruction) {
            messages.push({ role: "system", content: systemInstruction });
        }
        messages.push({ role: "user", content: prompt });
        try {
            return await this.callOpenAI(messages, 0.1, responseJson, selectedModel, maxTokens);
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
        const model = this.resolveModel(requestedModel);
        const messages: OpenRouterChatMessage[] = [
            { role: "system", content: buildRouterSystemPrompt(schemaText) },
            ...history.map((h) => ({
                role: normalizeHistoryRole(h.role),
                content: h.content,
            })),
            { role: "user", content: question },
        ];

        const dynamicLimit = this.calculateDynamicTokens('router', question.length);

        try {
            const rawText = await this.callOpenAI(messages, 0.1, true, model, dynamicLimit);
            const parsed = this.tryParseAiJson(rawText);
            if (parsed) return parsed;

            console.error("[AI LOG] Respons bukan JSON valid (percobaan 1), raw text:", rawText.slice(0, 300));
        } catch (error) {
            console.error("Gagal saat analyzeAndChat (percobaan 1):", error);
        }

        try {
            const retryMessages: OpenRouterChatMessage[] = [
                ...messages,
                {
                    role: "user",
                    content: "PENTING: Balas HANYA dengan JSON murni sesuai format yang diminta di system prompt. Jangan ada teks penjelasan di luar JSON.",
                },
            ];
            const rawText = await this.callOpenAI(retryMessages, 0.1, true, model, dynamicLimit);
            const parsed = this.tryParseAiJson(rawText);
            if (parsed) return parsed;

            console.error("[AI LOG] Respons bukan JSON valid (percobaan 2), raw text:", rawText.slice(0, 300));
        } catch (error) {
            console.error("Gagal saat analyzeAndChat (percobaan 2):", error);
        }

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

        const dynamicLimit = this.calculateDynamicTokens('summary', question.length, databaseData.length);
        const model = this.resolveModel(requestedModel);

        try {
            const messages: OpenRouterChatMessage[] = [
                { role: "system", content: ANSWER_SYSTEM_PROMPT },
                { role: "user", content: promptInsight },
            ];

            const rawText = await this.callOpenAI(messages, 0.1, false, model, dynamicLimit);
            return rawText.trim();
        } catch (error) {
            console.error("Gagal saat generateFinalAnswer:", error);
            return "Terjadi kesalahan saat merangkum data.";
        }
    }
}

export { OpenRouterService as GeminiService };
