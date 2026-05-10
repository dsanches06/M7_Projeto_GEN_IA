import dotenv from "dotenv";

// Force MySQL mode before importing anything else
process.env.FORCE_MYSQL = 'true';

import { getLocalApp, closeLocalApp } from "./appLocal.js";

// Load local environment variables, overriding production ones
dotenv.config({ path: '.env', override: true });
dotenv.config({ path: '.env.local', override: true });

// Ensure FORCE_MYSQL remains set after dotenv
process.env.FORCE_MYSQL = 'true';

const PORT = process.env.PORT || 3001;

async function startLocalServer() {
  try {
    const app = await getLocalApp();

    const server = app.listen(PORT, () => {
      console.log(`🚀 ClickUp Local Server (@mysql) running on http://localhost:${PORT}`);
      console.log(`📊 Environment: LOCAL DEVELOPMENT`);
      console.log(`🗄️  Database: MySQL`);
      console.log(`🌐 Frontend: http://localhost:5173 (if running)`);
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n🛑 Received SIGINT. Gracefully shutting down...');
      server.close(async () => {
        await closeLocalApp();
        console.log('✅ Local server closed');
        process.exit(0);
      });
    });

    process.on('SIGTERM', async () => {
      console.log('\n🛑 Received SIGTERM. Gracefully shutting down...');
      server.close(async () => {
        await closeLocalApp();
        console.log('✅ Local server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('❌ Failed to start local server:', error);
    process.exit(1);
  }
}

// Start server if called directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  startLocalServer();
}

export { startLocalServer };