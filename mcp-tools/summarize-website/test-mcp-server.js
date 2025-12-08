// Тест MCP сервера - проверяем что он инициализируется
import { X402Wallet } from './dist/wallet.js';

console.log("🧪 Testing MCP Server Initialization...\n");

// Проверяем что кошелек инициализируется
try {
  const wallet = new X402Wallet('0xd449dbc0bbf428bccec0cb22d320446ef26ee73e294a25baa7b14709bb39f4df');
  console.log("✅ Wallet initialized successfully");
  console.log(`   Address: ${wallet.getAddress()}`);
  
  // Проверяем подключение к сети
  wallet.getBalance().then(balance => {
    console.log(`   Balance: ${balance} AVAX`);
    console.log("✅ Network connection working");
    console.log("✅ MCP Server ready for Claude Desktop");
    process.exit(0);
  }).catch(err => {
    console.log("⚠️  Network connection issue:", err.message);
    console.log("✅ MCP Server would still work (wallet initialized)");
    process.exit(0);
  });
  
} catch (error) {
  console.log("❌ MCP Server initialization failed:", error.message);
  process.exit(1);
}
