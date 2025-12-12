# @universal-agent-wallet/core

Universal Agent Wallet SDK for x402 micropayments on Avalanche blockchain.

## Installation

```bash
npm install @universal-agent-wallet/core
```

## Quick Start

### Client-side Usage

```typescript
import { UniversalWallet } from '@universal-agent-wallet/core';

// Create wallet instance
const wallet = UniversalWallet.connect('your-private-key');

// Call paid API
const response = await wallet.callPaidAPI('https://api.example.com/premium', {
  method: 'POST',
  body: JSON.stringify({ query: 'analyze this' })
});

const result = await response.json();
console.log(result);
```

### Server-side Usage

```typescript
import express from 'express';
import { x402Middleware } from '@universal-agent-wallet/core';

const app = express();

// Add x402 payment requirement
app.use('/api/premium', x402Middleware({
  price: '$0.02',
  network: 'avalanche-fuji',
  description: 'Premium AI Service'
}, {
  facilitatorUrl: 'https://facilitator.example.com',
  walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f5bB0e'
}));

app.post('/api/premium/analyze', (req, res) => {
  res.json({ analysis: 'Your premium analysis result' });
});
```

### X402 Client Usage

```typescript
import { X402Client, UniversalWallet } from '@universal-agent-wallet/core';

const wallet = UniversalWallet.connect('your-private-key');
const client = new X402Client({ 
  wallet,
  baseURL: 'https://api.example.com' 
});

// Automatic payment handling
const response = await client.post('/premium/analyze', {
  text: 'Analyze this content'
});
```

## Features

- ✅ **HTTP 402 Payment Required** standard implementation
- ✅ **Avalanche blockchain** integration (Fuji testnet & Mainnet)
- ✅ **Automatic payment handling** - no manual transaction signing
- ✅ **Express.js middleware** for servers
- ✅ **TypeScript support** with full type definitions
- ✅ **Mock payments** for testing and development

## API Reference

### UniversalWallet

Main class for handling x402 payments.

#### Methods

- `static connect(privateKey?: string, config?: WalletConfig): UniversalWallet`
- `getAddress(): string`
- `getBalance(): Promise<string>`
- `callPaidAPI(url: string, options?: RequestInit, onStatusChange?: Function): Promise<Response>`
- `pay(to: string, amount: string): Promise<TransactionResult>`

### X402Client

HTTP client with built-in x402 support.

#### Methods

- `get(url: string, onStatusChange?: Function): Promise<Response>`
- `post(url: string, data?: any, onStatusChange?: Function): Promise<Response>`
- `checkPaymentRequired(url: string): Promise<PaymentDetails | null>`

### x402Middleware

Express.js middleware for payment-protected routes.

```typescript
x402Middleware(config: PaymentConfig, options: X402Config)
```

## Configuration

### Network Support

- **avalanche-fuji** - Testnet (default)
- **avalanche-mainnet** - Production network

### Environment Variables

```bash
# Wallet configuration
WALLET_PRIVATE_KEY=0x...
WALLET_ADDRESS=0x...

# Network configuration  
NETWORK=avalanche-fuji
RPC_URL=https://api.avax-test.network/ext/bc/C/rpc

# x402 configuration
FACILITATOR_URL=https://facilitator.example.com
```

## Examples

See the [examples directory](./examples) for complete integration examples:

- Express.js server with x402 endpoints
- CLI tool with payment handling
- Browser application with MetaMask integration

## License

MIT
