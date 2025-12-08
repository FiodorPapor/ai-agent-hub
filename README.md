# Universal Agent Wallet

> **🔄 Pivot Notice:** This project evolved from "AI Agent Service Hub" (closed marketplace) 
> to "Universal Agent Wallet" (open payment infrastructure) during Hack2Build x402.

## Why the Pivot?

| Before | After |
|--------|-------|
| Marketplace where our agents pay our agents | SDK that ANY system can use |
| Limited to 4 built-in agents | Works with Claude MCP, Telegram, Python, etc. |
| Closed ecosystem | Universal infrastructure |

**The real gap isn't another agent marketplace — it's payment infrastructure for the entire AI ecosystem.**

---

**Universal payment layer for any AI system** — Claude MCP, Telegram bots, Python scripts, n8n workflows, and more.

Transform any HTTP API into a paid service with x402 micropayments on Avalanche. One SDK works everywhere.

## 🚀 Quick Start

```bash
# Install the SDK
npm install universal-agent-wallet
# or
pip install universal-agent-wallet
```

```javascript
// JavaScript/TypeScript
import { UniversalWallet } from 'universal-agent-wallet';

const wallet = UniversalWallet.connect();
const response = await wallet.callPaidAPI('http://localhost:3004/api/summarize', {
  method: 'POST',
  body: JSON.stringify({ url: 'https://example.com' })
});
```

```python
# Python
from universal_agent_wallet import UniversalWallet

wallet = UniversalWallet.connect()
result = wallet.call_paid_api('http://localhost:3004/api/summarize', 
                             json={'url': 'https://example.com'})
```

## 🎯 What It Does

Universal Agent Wallet provides **automatic x402 payment handling** for any HTTP API:

1. **Call any API** → Get 402 Payment Required
2. **SDK automatically signs payment** → Sends transaction on Avalanche
3. **Retries request with payment proof** → Get your result

**No complex integration. No payment forms. Just call APIs and pay automatically.**

## 🌟 Features

- **🔌 Universal Compatibility** — Works with JavaScript, Python, cURL, any HTTP client
- **⚡ Automatic Payments** — SDK handles 402 responses, signs payments, retries requests
- **💰 True Micropayments** — Pay $0.01-$0.05 per API call with Avalanche's low fees
- **🔗 Blockchain Verified** — Real on-chain payments with transaction proofs
- **🎭 Mock Mode** — Test integration without real payments
- **📱 Multi-Platform** — Browser, Node.js, Python, command line

## 🏗️ Architecture

```
┌─────────────────┐    HTTP + x402    ┌─────────────────┐
│   Your App      │ ──────────────── │  Paid API       │
│                 │                   │                 │
│ UniversalWallet │ ←── 402 ────────  │ x402 Middleware │
│ SDK             │                   │                 │
│                 │ ── Payment ────→  │                 │
│                 │ ← Result ────────  │                 │
└─────────────────┘                   └─────────────────┘
         │                                     │
         │                                     │
    ┌────▼────┐                          ┌────▼────┐
    │ Wallet  │                          │ Service │
    │ (AVAX)  │                          │ Logic   │
    └─────────┘                          └─────────┘
```

## 📚 Integration Examples

### 🟨 JavaScript/TypeScript (Browser)

```javascript
import { UniversalWallet } from 'universal-agent-wallet';

const wallet = UniversalWallet.connect();

// Automatic payment handling
async function summarizeUrl(url) {
  const response = await wallet.callPaidAPI('http://localhost:3004/api/summarize', {
    method: 'POST',
    body: JSON.stringify({ url })
  });
  
  const result = await response.json();
  return result.data.summary;
}

// With payment flow monitoring
const result = await wallet.summarize({ url }, (flow) => {
  console.log(`Status: ${flow.status} - ${flow.message}`);
});
```

### 🟢 Node.js (Server-side)

```javascript
const { UniversalWallet } = require('universal-agent-wallet');

// Initialize with private key for server use
const wallet = UniversalWallet.connect(process.env.PRIVATE_KEY);

async function callPaidService() {
  const response = await wallet.callPaidAPI('http://localhost:3004/api/summarize', {
    method: 'POST',
    body: JSON.stringify({ text: 'Long article content...' })
  });
  
  return await response.json();
}
```

### 🐍 Python

```python
import requests
from universal_agent_wallet import UniversalWallet

wallet = UniversalWallet.connect(private_key=os.getenv('PRIVATE_KEY'))

def call_paid_api(data):
    # SDK handles 402 responses automatically
    response = wallet.call_paid_api(
        'http://localhost:3004/api/summarize',
        json=data
    )
    return response.json()

result = call_paid_api({'url': 'https://example.com'})
```

### 🌐 cURL (Command Line)

```bash
# Step 1: Try API (gets 402 Payment Required)
curl -X POST http://localhost:3004/api/summarize \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'

# Step 2: Send payment and retry with signature
curl -X POST http://localhost:3004/api/summarize \
  -H "Content-Type: application/json" \
  -H "x-payment: {\"txHash\":\"0x123...\",\"from\":\"0xabc...\",\"to\":\"0x742d35...\",\"value\":\"$0.02\"}" \
  -d '{"url": "https://example.com"}'
```

### 🤖 Telegram Bot

```javascript
const TelegramBot = require('node-telegram-bot-api');
const { UniversalWallet } = require('universal-agent-wallet');

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
const wallet = UniversalWallet.connect(process.env.BOT_PRIVATE_KEY);

bot.onText(/\/summarize (.+)/, async (msg, match) => {
  const url = match[1];
  
  try {
    const response = await wallet.callPaidAPI('http://localhost:3004/api/summarize', {
      method: 'POST',
      body: JSON.stringify({ url })
    });
    
    const result = await response.json();
    await bot.sendMessage(msg.chat.id, `📄 Summary: ${result.data.summary}`);
  } catch (error) {
    await bot.sendMessage(msg.chat.id, `❌ Error: ${error.message}`);
  }
});
```

### 🧠 Claude MCP Server

```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { UniversalWallet } from 'universal-agent-wallet';

const wallet = UniversalWallet.connect(process.env.MCP_PRIVATE_KEY);
const server = new Server({ name: 'x402-summarizer', version: '1.0.0' }, { capabilities: { tools: {} } });

server.setRequestHandler('tools/call', async (request) => {
  if (request.params.name === 'summarize_url') {
    const { url } = request.params.arguments;
    
    const response = await wallet.callPaidAPI('http://localhost:3004/api/summarize', {
      method: 'POST',
      body: JSON.stringify({ url })
    });
    
    const result = await response.json();
    return { content: [{ type: 'text', text: result.data.summary }] };
  }
});
```

## 🏃‍♂️ Running the Demo

```bash
# Clone and install
git clone <repository>
cd universal-agent-wallet
pnpm install

# Start backend (API server)
cd packages/backend
pnpm dev
# → http://localhost:3004

# Start frontend (demo interface)
cd packages/frontend  
pnpm dev
# → http://localhost:3000
```

### Demo Endpoints

- **Frontend Demo**: http://localhost:3000 — Interactive wallet demo
- **API Info**: http://localhost:3004/api/info — Service documentation
- **Paid Endpoint**: `POST http://localhost:3004/api/summarize` — $0.02 per request
- **Health Check**: http://localhost:3004/api/health — Service status

## 🔧 Building Your Own Paid API

### 1. Add x402 Middleware

```javascript
import { x402Middleware } from './middleware/x402';

app.post('/api/my-service', 
  x402Middleware({
    price: '$0.05',
    network: 'avalanche-fuji',
    description: 'My AI Service'
  }, {
    facilitatorUrl: 'https://facilitator.universal-wallet.dev',
    walletAddress: process.env.WALLET_ADDRESS
  }),
  (req, res) => {
    // Your service logic here
    res.json({ result: 'Service completed!', payment: res.locals.x402 });
  }
);
```

### 2. Client Integration

```javascript
const wallet = UniversalWallet.connect();
const response = await wallet.callPaidAPI('http://your-api.com/api/my-service', {
  method: 'POST',
  body: JSON.stringify({ input: 'data' })
});
```

That's it! The SDK handles all payment logic automatically.

## 🌐 Use Cases

- **🤖 AI Agents** — Claude MCP servers, OpenAI plugins, custom AI tools
- **📱 Telegram Bots** — Add paid features instantly
- **🔧 Automation** — n8n workflows, Zapier, Python scripts, cron jobs  
- **🌐 Web Apps** — React, Vue, Angular apps with pay-per-use APIs
- **📊 Data APIs** — Weather, stocks, analytics with micropayments
- **🎨 Content APIs** — Image generation, text processing, file conversion

## 💰 Economics

- **Payment Network**: Avalanche (ultra-low fees ~$0.001)
- **Typical API Price**: $0.01 - $0.05 per request
- **Payment Currency**: AVAX
- **Settlement**: Instant (2-3 seconds)
- **No Subscriptions**: True pay-per-use model

## 🛠️ Development

```bash
# Install dependencies
pnpm install

# Run both frontend and backend
pnpm dev

# Build for production
pnpm build

# Run tests
pnpm test
```

### Project Structure

```
universal-agent-wallet/
├── packages/
│   ├── backend/           # Express API server
│   │   ├── src/
│   │   │   ├── middleware/x402.ts    # x402 payment middleware
│   │   │   ├── services/summarizer.ts # Demo service
│   │   │   ├── sdk/UniversalWallet.ts # Server-side SDK
│   │   │   └── routes/               # API routes
│   │   └── package.json
│   └── frontend/          # Next.js demo interface  
│       ├── src/
│       │   ├── lib/universalWallet.ts # Client-side SDK
│       │   ├── components/           # React components
│       │   └── app/                  # Next.js pages
│       └── package.json
└── README.md
```

## 🔐 Security

- **Private Keys**: Never expose private keys in frontend code
- **Server-Side**: Use environment variables for production keys
- **Mock Mode**: Available for testing without real payments
- **Transaction Verification**: Real blockchain verification in production
- **Rate Limiting**: Implement on your APIs as needed

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

- **Documentation**: See `/api/info` endpoint for live API docs
- **Issues**: GitHub Issues
- **Discord**: [Join our community]
- **Email**: support@universal-wallet.dev

---

**Universal Agent Wallet** — Making AI services accessible through seamless micropayments. One SDK, any platform, instant payments.

*Powered by Avalanche • x402 Protocol • Universal Payments*
