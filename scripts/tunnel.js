const fs = require('fs');
const path = require('path');

// Parse simple dotenv format manually to avoid extra dependencies in the root script
function loadEnv(envPath) {
  if (!fs.existsSync(envPath)) return {};
  const content = fs.readFileSync(envPath, 'utf8');
  const env = {};
  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const match = trimmed.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();
      // Remove surrounding quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.substring(1, value.length - 1);
      }
      env[key] = value;
    }
  });
  return env;
}

const args = process.argv.slice(2);
const isDev = args.includes('--dev');

const envPath = path.join(__dirname, '../backend/.env');
const env = loadEnv(envPath);

const backendPort = parseInt(env.PORT || '5000', 10);
const port = isDev ? 5173 : backendPort;
const authToken = env.NGROK_AUTHTOKEN || process.env.NGROK_AUTHTOKEN;
const domain = env.NGROK_DOMAIN || process.env.NGROK_DOMAIN;

async function waitForService(url, label, timeoutMs = 30000) {
  const deadline = Date.now() + timeoutMs;
  process.stdout.write(`Menunggu ${label}`);

  while (Date.now() < deadline) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(3000) });
      if (response.ok) {
        console.log(' siap.');
        return;
      }
    } catch (_) {
      // Layanan mungkin masih dalam proses startup.
    }

    process.stdout.write('.');
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('');
  throw new Error(`${label} tidak siap setelah ${Math.round(timeoutMs / 1000)} detik (${url}).`);
}

// Lazy load ngrok so we can give a clean error message if npm install hasn't finished
let ngrok;
try {
  ngrok = require('@ngrok/ngrok');
} catch (err) {
  console.error('\n✖ Error: "@ngrok/ngrok" package is not installed.');
  console.error('Please run "npm install" in the root directory first.\n');
  process.exit(1);
}

(async () => {
  console.log('=========================================');
  console.log('       STARTING NGROK TUNNEL');
  console.log('=========================================');
  console.log(`Targeting Port: ${port} (${isDev ? 'Development/Frontend' : 'Production/Unified Server'})`);

  const config = { addr: port };
  if (!authToken) {
    console.error('\n✖ Error: NGROK_AUTHTOKEN tidak ditemukan di backend/.env atau environment.');
    console.error('Mulai versi terbaru, Ngrok mewajibkan autentikasi akun untuk menjalankan tunnel.');
    console.error('Silakan ikuti langkah berikut:');
    console.error('1. Daftar / login di https://dashboard.ngrok.com/');
    console.error('2. Dapatkan authtoken Anda di menu "Your Authtoken"');
    console.error('3. Buka file backend/.env dan tambahkan token Anda:');
    console.error('   NGROK_AUTHTOKEN="token_ngrok_anda_di_sini"\n');
    process.exit(1);
  }

  config.authtoken = authToken;
  console.log('Auth Token: Loaded from backend/.env');

  if (domain) {
    config.domain = domain;
    console.log(`Custom Domain: ${domain}`);
  }


  try {
    if (isDev) {
      await waitForService(`http://localhost:${backendPort}/api/health`, 'Backend API');
    }
    await waitForService(`http://localhost:${port}`, isDev ? 'Frontend Vite' : 'Server aplikasi');

    const listener = await ngrok.forward(config);
    
    console.log('=========================================');
    console.log('✔ TUNNEL ESTABLISHED SUCCESSFULLY');
    console.log('=========================================');
    console.log(`Public URL:   \x1b[36m${listener.url()}\x1b[0m`);
    console.log(`Local URL:    http://localhost:${port}`);
    console.log('=========================================');
    console.log('Press Ctrl+C to stop the tunnel.');
    console.log('=========================================');

    // Keep process alive and clean up on exit
    process.on('SIGINT', async () => {
      console.log('\nClosing ngrok tunnel...');
      await listener.close();
      process.exit(0);
    });

    // Keep the Node.js event loop active
    const keepAlive = setInterval(() => {}, 1000 * 60 * 60);

    // Also handle SIGTERM
    process.on('SIGTERM', async () => {
      clearInterval(keepAlive);
      await listener.close();
      process.exit(0);
    });
  } catch (error) {
    console.error('\n✖ Failed to start ngrok tunnel:', error.message);
    process.exit(1);
  }
})();
