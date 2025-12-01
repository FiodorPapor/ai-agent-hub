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

## 👥 Team

**Fiodor Papor** — Full-stack Developer & Founder
- Experience in Web3, blockchain, and AI integration
- GitHub: https://github.com/FiodorPapor
- Passionate about building infrastructure for autonomous agent economies

## 👤 User Persona

### Primary User: AI/Web3 Developer
- **Age/Role**: 25-40, Software Engineer or AI Engineer
- **Goals**: 
  - Build AI-powered applications with monetization
  - Integrate AI agents into existing systems
  - Reduce payment processing overhead
- **Pain Points**:
  - High payment processing fees ($25-50 per transaction)
  - Micropayments economically impossible with traditional systems
  - No standardized protocol for agent-to-agent commerce
  - Complex integration with multiple payment providers
- **Tech Stack**: Node.js, Python, TypeScript, Web3 libraries
- **Motivation**: Save costs, enable new business models, simplify integration

### Secondary User: Enterprise with AI Agents
- **Organization**: Mid-to-large company deploying autonomous AI systems
- **Goals**:
  - Deploy autonomous agent networks
  - Enable agent-to-agent collaboration
  - Maintain audit trail of all transactions
- **Pain Points**:
  - Lack of infrastructure for agent payments
  - Regulatory compliance requirements
  - Need for instant settlement
- **Requirements**: Scalability, security, auditability, compliance

## 🚶 User Journey

### Developer Onboarding (5 minutes)
1. **Discover**: Developer finds AI Agent Service Hub on GitHub
2. **Understand**: Reads README and understands x402 protocol
3. **Setup**: Clones repo, runs `pnpm install`
4. **Test**: Starts backend and frontend locally
5. **Explore**: Opens http://localhost:3000, clicks on agents

### Using an Agent (2 minutes)
1. **Browse**: Views agent catalog with prices and descriptions
2. **Select**: Clicks on desired agent (e.g., "Research Agent")
3. **Input**: Enters query or data
4. **Payment**: Clicks "Execute & Pay"
5. **Verify**: Sees HTTP 402 payment requirement
6. **Sign**: Signs payment with wallet (or uses mock in demo)
7. **Execute**: Receives agent response
8. **Confirm**: Sees transaction hash and payment confirmation

### Building with Agents (10 minutes)
1. **Integrate**: Adds x402 client to their application
2. **Configure**: Sets up agent endpoints and prices
3. **Deploy**: Deploys their own agent to the hub
4. **Monetize**: Receives payments for agent services
5. **Monitor**: Views transaction history and earnings

## 📋 Feature Analysis (MoSCoW)

### ✅ MUST HAVE (Prototype - Delivered)
- [x] x402 payment middleware integration
- [x] 4 AI agents (Research, Summary, Translate, Code Review)
- [x] HTTP 402 payment flow implementation
- [x] Agent catalog UI with pricing
- [x] Payment visualization and flow display
- [x] Mock payment support for testing
- [x] Responsive design (mobile, tablet, desktop)
- [x] Dark theme optimized for Web3
- [x] Error handling and user feedback

### 📌 SHOULD HAVE (MVP - Target Dec 8)
- [ ] Real AI integration (Claude/GPT API)
- [ ] Agent-to-agent calls demonstration
- [ ] Transaction history page
- [ ] Wallet connection (MetaMask/RainbowKit)
- [ ] Payment signature verification
- [ ] Rate limiting and authentication
- [ ] Testnet USDC integration
- [ ] Agent registration system

### 💭 COULD HAVE (Future Enhancements)
- [ ] Reputation and ratings system
- [ ] Multi-chain support (Base, Polygon)
- [ ] Advanced analytics dashboard
- [ ] Agent marketplace with discovery
- [ ] Custom agent deployment
- [ ] Batch payment processing
- [ ] Webhook notifications

### ❌ WON'T HAVE (Out of Scope)
- Mobile native applications
- Fiat on/off ramps
- Complex governance/DAO structures
- Token economics and staking
- Mainnet deployment (testnet only)

## 💼 Business Impact

### Market Opportunity
- **AI Agent Market**: Expected to reach $500B+ by 2030 (McKinsey)
- **Micropayment Gap**: $0.01-$0.10 transactions currently impossible with traditional systems
- **Target Users**: 1M+ AI developers building autonomous systems
- **Revenue Model**: 1-2% transaction fee on agent services

### Key Metrics
- **Settlement Time**: ~2 seconds (vs 3-5 days for traditional payments)
- **Transaction Cost**: ~$0.001 (vs $25-50 for wire transfers)
- **Scalability**: Supports 1000s of concurrent agents
- **Adoption Barrier**: Low (simple API, 5-minute setup)

### Competitive Advantage
- **First-mover**: Only x402 + AI agent marketplace
- **Developer-friendly**: Works with existing Web3 wallets
- **Avalanche-native**: Leverages sub-second finality
- **Open-source**: Community-driven development

## 🚀 Innovation

### Technical Innovation
1. **x402 Protocol Integration**: First production use of HTTP 402 for AI services
2. **Autonomous Payments**: Agents can pay each other without human intervention
3. **Micropayment Economics**: Makes sub-cent transactions economically viable
4. **Instant Settlement**: Avalanche's 2-second finality enables real-time agent commerce

### Business Model Innovation
1. **Agent-to-Agent Marketplace**: New economic model for autonomous systems
2. **Service-Based Pricing**: Pay-per-use model for AI capabilities
3. **Decentralized Monetization**: Agents earn directly, no intermediaries
4. **Composable AI**: Agents can chain services together

### User Experience Innovation
1. **One-Click Payment**: Simplified x402 flow for non-technical users
2. **Mock Testing**: Test payment flows without real transactions
3. **Visual Payment Flow**: Real-time visualization of x402 protocol
4. **Developer-First Design**: API-first with beautiful UI

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

## 📄 License

MIT License - See LICENSE file for details

## 🙋 Support

For questions or issues:
1. Check the [API Documentation](#-api-documentation)
2. Review [Quick Start](#-quick-start)
3. Open an issue on GitHub

---

**Made with ❤️ for the future of agent-to-agent commerce**
