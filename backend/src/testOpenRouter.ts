import { OpenRouterService } from './ai/openrouter.service';

async function testConnection() {
  console.log('Testing LLM adapter connection with Gemini SDK...');
  const openRouter = new OpenRouterService();
  
  try {
    const result = await openRouter.generateContent(
      'Katakan "Koneksi berhasil!" jika kamu mendengar pesan ini.',
      'Kamu adalah asisten tes sederhana.'
    );
    console.log('\n--- LLM RESPON ---');
    console.log(result);
    console.log('------------------');
    console.log('Hasil Tes: Sukses!');
  } catch (error: any) {
    console.error('Hasil Tes: Gagal!', error.message);
  }
}

testConnection();
