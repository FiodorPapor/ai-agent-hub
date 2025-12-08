// Тестовый скрипт для проверки MCP tool логики
import { X402Wallet } from './dist/wallet.js';

const API_URL = "http://localhost:3004";

async function testMCPFlow() {
  console.log("🧪 Testing MCP Tool Flow...\n");

  // 1. Инициализация кошелька
  console.log("1️⃣ Initializing wallet...");
  const wallet = new X402Wallet('0xd449dbc0bbf428bccec0cb22d320446ef26ee73e294a25baa7b14709bb39f4df');
  console.log(`   Wallet: ${wallet.getAddress()}`);
  
  try {
    const balance = await wallet.getBalance();
    console.log(`   Balance: ${balance} AVAX`);
  } catch (error) {
    console.log(`   ⚠️  Could not check balance: ${error.message}`);
  }

  // 2. Тестируем API вызов (должен вернуть 402)
  console.log("\n2️⃣ Testing API call (expecting 402)...");
  
  try {
    const response = await fetch(`${API_URL}/api/summarize`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: "Test text for MCP summarization" }),
    });

    console.log(`   Status: ${response.status}`);
    
    if (response.status === 402) {
      const paymentInfo = await response.json();
      console.log(`   ✅ Got 402 Payment Required`);
      console.log(`   Amount: ${paymentInfo.payment?.amount}`);
      console.log(`   Receiver: ${paymentInfo.payment?.receiverAddress}`);
      
      // 3. Симулируем создание payment header (без реального платежа)
      console.log("\n3️⃣ Simulating payment header creation...");
      console.log(`   Would send ${paymentInfo.payment?.amount} to ${paymentInfo.payment?.receiverAddress}`);
      console.log(`   ⚠️  Skipping real payment for test`);
      
      // 4. Тестируем с mock payment header
      console.log("\n4️⃣ Testing with mock payment...");
      const mockResponse = await fetch(`${API_URL}/api/summarize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-payment": "mock-payment-for-test",
        },
        body: JSON.stringify({ text: "Test text for MCP summarization" }),
      });
      
      console.log(`   Status: ${mockResponse.status}`);
      
      if (mockResponse.ok) {
        const result = await mockResponse.json();
        console.log(`   ✅ Got summary: ${result.data?.summary?.substring(0, 100)}...`);
      } else {
        const errorText = await mockResponse.text();
        console.log(`   ❌ Error: ${errorText}`);
      }
      
    } else {
      console.log(`   ❌ Expected 402, got ${response.status}`);
    }
    
  } catch (error) {
    console.log(`   ❌ API Error: ${error.message}`);
    console.log(`   Make sure backend is running on ${API_URL}`);
  }

  console.log("\n🏁 Test completed!");
}

testMCPFlow().catch(console.error);
