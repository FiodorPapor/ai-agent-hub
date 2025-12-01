# AI Agent Service Hub

> A marketplace where AI agents sell services to each other and humans via x402 micropayments on Avalanche.

**Network:** Avalanche Fuji Testnet

## 🎯 Problem

In 2025, 79% of companies use AI agents. But agents can't pay each other efficiently:
- Traditional payments cost $25-50 per transaction
- Micropayments ($0.01-$0.10) are economically impossible
- No standardized protocol for agent-to-agent commerce

## 💡 Solution

**AI Agent Service Hub** enables autonomous agent-to-agent commerce through the **x402 protocol**:
- Research Agent finds data for **$0.02**
- Summary Agent summarizes for **$0.01**
- Translation Agent translates for **$0.01**
- Code Review Agent reviews for **$0.05**

All payments are **instant**, **automatic**, and cost **near-zero**.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js + React)               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Agent Catalog → Agent Detail → Payment Flow UI     │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP + x402 Headers
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              Backend (Express + TypeScript)                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  x402 Middleware (Payment Verification)             │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │ Research │ Summary │ Translate │ Code Review  │  │   │
│  │  │  Agent   │  Agent  │  Agent    │   Agent      │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────────┘
                           │ x402 Payment Protocol
                           ▼
┌─────────────────────────────────────────────────────────────┐
│         Ultravioleta DAO x402 Facilitator                   │
│         (https://facilitator.ultravioletadao.xyz)           │
└──────────────────────────┬──────────────────────────────────┘
                           │ Settlement
                           ▼
┌─────────────────────────────────────────────────────────────┐
│    Avalanche C-Chain (Fuji Testnet)                         │
│    - Sub-second finality                                    │
│    - ~$0.001 transaction cost                              │
│    - USDC stablecoin                                        │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ ([download](https://nodejs.org/))
- **pnpm** ([install](https://pnpm.io/installation))
- **Avalanche Fuji testnet AVAX** (get from [faucet](https://faucet.avax.network/) with code `Hack2Build_payments`)

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/ai-agent-hub
cd ai-agent-hub

# Install dependencies
pnpm install

# Create environment file
cp .env.example .env

# Edit .env with your wallet details (testnet only!)
# WALLET_ADDRESS=0x...
# WALLET_PRIVATE_KEY=0x...
```

### Run Locally

```bash
# Terminal 1: Start backend
cd packages/backend
pnpm dev
# Backend running on http://localhost:3001

# Terminal 2: Start frontend
cd packages/frontend
pnpm dev
# Frontend running on http://localhost:3000
```

Open **http://localhost:3000** in your browser.

## 📚 API Documentation

### Base URL
```
http://localhost:3001
```

### Endpoints

#### 1. Research Agent
```bash
GET /agents/research?query=x402+avalanche&payment=<signature>
```

**Response (402 Payment Required):**
```json
{
  "status": "payment_required",
  "message": "Payment required to access this service",
  "payment": {
    "amount": "$0.02",
    "currency": "USDC",
    "network": "avalanche-fuji",
    "description": "AI Research Agent - find relevant articles",
    "facilitator": "https://facilitator.ultravioletadao.xyz",
    "receiverAddress": "0x..."
  }
}
```

**Response (200 with payment):**
```json
{
  "agent": "research",
  "query": "x402 avalanche",
  "results": [
    {
      "title": "What is x402 Protocol",
      "url": "https://build.avax.network/...",
      "summary": "x402 enables instant payments via HTTP 402..."
    }
  ],
  "payment": {
    "amount": "$0.02",
    "currency": "USDC",
    "txHash": "0x...",
    "timestamp": "2025-12-01T17:00:00Z"
  }
}
```

#### 2. Summary Agent
```bash
POST /agents/summary
Content-Type: application/json
x-payment: <signature>

{
  "text": "Long text to summarize..."
}
```

#### 3. Translation Agent
```bash
POST /agents/translate
Content-Type: application/json
x-payment: <signature>

{
  "text": "Hello world",
  "targetLanguage": "Spanish"
}
```

#### 4. Code Review Agent
```bash
POST /agents/code-review
Content-Type: application/json
x-payment: <signature>

{
  "code": "function example() { ... }"
}
```

### x402 Payment Flow

1. **Client requests service without payment**
   ```bash
   GET /agents/research?query=test
   ```

2. **Server responds with 402 Payment Required**
   ```json
   {
     "status": "payment_required",
     "payment": { ... }
   }
   ```

3. **Client signs payment with x402 facilitator**
   - Amount: $0.02
   - Receiver: Agent wallet address
   - Network: Avalanche Fuji

4. **Client retries with payment signature**
   ```bash
   GET /agents/research?query=test&payment=<signature>
   ```

5. **Server verifies payment and executes**
   ```json
   {
     "agent": "research",
     "results": [ ... ],
     "payment": {
       "txHash": "0x...",
       "timestamp": "..."
     }
   }
   ```

## 🔧 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Blockchain** | Avalanche C-Chain (Fuji testnet) |
| **Payment Protocol** | x402 (HTTP 402 status code) |
| **Facilitator** | Ultravioleta DAO |
| **Backend** | Node.js, Express, TypeScript |
| **Frontend** | Next.js 14, React 18, Tailwind CSS |
| **Icons** | Lucide React |
| **HTTP Client** | Axios |

## 📁 Project Structure

```
ai-agent-hub/
├── README.md                          # This file
├── .env.example                       # Environment template
├── package.json                       # Root workspace config
│
├── packages/
│   ├── backend/
│   │   ├── src/
│   │   │   ├── index.ts              # Express server entry
│   │   │   ├── middleware/
│   │   │   │   └── x402.ts           # x402 payment middleware
│   │   │   ├── agents/
│   │   │   │   ├── researchAgent.ts
│   │   │   │   ├── summaryAgent.ts
│   │   │   │   ├── translateAgent.ts
│   │   │   │   └── codeReviewAgent.ts
│   │   │   └── routes/
│   │   │       └── agents.ts         # Agent endpoints
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── frontend/
│       ├── src/
│       │   ├── app/
│       │   │   ├── layout.tsx        # Root layout
│       │   │   ├── page.tsx          # Home / Catalog
│       │   │   ├── globals.css       # Global styles
│       │   │   └── agents/
│       │   │       └── [id]/
│       │   │           └── page.tsx  # Agent detail page
│       │   ├── components/
│       │   │   ├── AgentCard.tsx     # Agent card component
│       │   │   └── PaymentFlow.tsx   # Payment flow UI
│       │   └── lib/
│       │       └── x402Client.ts     # x402 client
│       ├── package.json
│       ├── tsconfig.json
│       ├── next.config.js
│       ├── tailwind.config.js
│       └── postcss.config.js
│
└── docs/
    └── PRESENTATION.md               # Presentation slides
```

## 🧪 Testing

### Test Backend Endpoints

```bash
# Test Research Agent (without payment - should get 402)
curl http://localhost:3001/agents/research?query=test

# Test with mock payment header
curl -H "x-payment: mock" http://localhost:3001/agents/research?query=test

# Test Summary Agent
curl -X POST http://localhost:3001/agents/summary \
  -H "Content-Type: application/json" \
  -H "x-payment: mock" \
  -d '{"text": "Long text here..."}'

# Test Translation Agent
curl -X POST http://localhost:3001/agents/translate \
  -H "Content-Type: application/json" \
  -H "x-payment: mock" \
  -d '{"text": "Hello", "targetLanguage": "Spanish"}'

# Test Code Review Agent
curl -X POST http://localhost:3001/agents/code-review \
  -H "Content-Type: application/json" \
  -H "x-payment: mock" \
  -d '{"code": "function test() {}"}'
```

### Test Frontend

1. Open http://localhost:3000
2. Click on any agent card
3. Enter input and click "Execute & Pay"
4. Watch the payment flow visualization
5. See mock results

## 🎨 UI Features

- **Dark theme** optimized for web3
- **Real-time payment flow** visualization
- **Responsive design** (mobile, tablet, desktop)
- **Smooth animations** and transitions
- **Loading states** and error handling
- **Transaction details** display

## 🔐 Security Notes

⚠️ **TESTNET ONLY**: This prototype uses testnet AVAX. Never use mainnet private keys!

For production:
- Use hardware wallets (Ledger, Trezor)
- Implement proper key management
- Verify x402 signatures with facilitator
- Add rate limiting and authentication
- Implement proper error handling

## 🛣️ Roadmap

### ✅ Prototype (Dec 1)
- [x] x402 integration
- [x] 4 mock AI agents
- [x] Basic UI
- [x] Payment flow visualization

### 📋 MVP (Dec 8)
- [ ] Real AI integration (Claude API)
- [ ] Agent-to-agent calls
- [ ] Transaction history
- [ ] Wallet integration (RainbowKit)

### 🚀 Future
- [ ] Agent registration system
- [ ] Reputation/ratings
- [ ] Multi-chain support
- [ ] Open marketplace
- [ ] Advanced analytics

## 📊 Metrics

- **Settlement time**: ~2 seconds
- **Transaction cost**: ~$0.001
- **Supported agents**: 4
- **Price range**: $0.01-$0.05 per request

## 🔗 Resources

- **Avalanche Build**: https://build.avax.network
- **x402 Protocol**: https://x402.org
- **Ultravioleta DAO**: https://ultravioletadao.xyz
- **Fuji Faucet**: https://faucet.avax.network
## 👥 Team

Fedor Papor

## 📄 License

MIT License - See LICENSE file for details

## 🙋 Support

For questions or issues:
1. Check the [API Documentation](#-api-documentation)
2. Review [Quick Start](#-quick-start)
3. Open an issue on GitHub

---

**Made with ❤️ for the future of agent-to-agent commerce**
