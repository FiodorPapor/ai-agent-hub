/**
 * Simple test to verify SDK functionality
 */

const { UniversalWallet, X402Client, x402Middleware } = require('./dist/index.js');

console.log('🧪 Testing Universal Agent Wallet SDK...\n');

// Test 1: Check exports
console.log('✅ Test 1: Exports');
console.log('- UniversalWallet:', typeof UniversalWallet);
console.log('- X402Client:', typeof X402Client);
console.log('- x402Middleware:', typeof x402Middleware);

// Test 2: Create wallet instance
console.log('\n✅ Test 2: Wallet Creation');
try {
  const wallet = UniversalWallet.connect();
  console.log('- Wallet address:', wallet.getAddress());
  console.log('- Network:', wallet.getNetwork());
} catch (error) {
  console.error('- Error:', error.message);
}

// Test 3: Create X402 client
console.log('\n✅ Test 3: X402 Client');
try {
  const client = new X402Client({
    baseURL: 'https://api.example.com'
  });
  console.log('- X402Client created successfully');
} catch (error) {
  console.error('- Error:', error.message);
}

// Test 4: Middleware configuration
console.log('\n✅ Test 4: Middleware');
try {
  const middleware = x402Middleware({
    price: '$0.02',
    network: 'avalanche-fuji',
    description: 'Test Service'
  }, {
    facilitatorUrl: 'https://facilitator.example.com',
    walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f5bB0e'
  });
  console.log('- Middleware created successfully');
  console.log('- Type:', typeof middleware);
} catch (error) {
  console.error('- Error:', error.message);
}

console.log('\n🎉 SDK test completed!');
