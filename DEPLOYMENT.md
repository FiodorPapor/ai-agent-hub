# Deployment & Testing Guide

## ✅ Build Status

- **Backend**: ✅ Compiles successfully
- **Frontend**: ✅ Compiles successfully
- **Dependencies**: ✅ All installed

## 🚀 Running Locally

### Terminal 1: Start Backend
```bash
cd /Users/Fedor/Desktop/Ava/packages/backend
pnpm dev
```

**Expected output:**
```
🚀 AI Agent Service Hub backend running on http://localhost:3001
📡 x402 Facilitator: https://facilitator.ultravioletadao.xyz
💰 Receiver Address: 0x0000000000000000000000000000000000000000
🌐 Network: avalanche-fuji

📚 API Documentation: http://localhost:3001/api/info
```

### Terminal 2: Start Frontend
```bash
cd /Users/Fedor/Desktop/Ava/packages/frontend
pnpm dev
```

**Expected output:**
```
  ▲ Next.js 14.2.33

  > Local:        http://localhost:3000
```

## 🧪 Testing the API

### 1. Health Check
```bash
curl http://localhost:3001/health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-12-01T17:30:21.224Z",
  "version": "0.1.0"
}
```

### 2. Get API Info
```bash
curl http://localhost:3001/api/info
```

**Response:** Lists all 4 agents with prices and endpoints

### 3. Test x402 Payment Flow - Without Payment (402 Response)
```bash
curl "http://localhost:3001/agents/research?query=test"
```

**Response (HTTP 402):**
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
    "receiverAddress": "0x0000000000000000000000000000000000000000"
  }
}
```

### 4. Test x402 Payment Flow - With Mock Payment (200 Response)
```bash
curl "http://localhost:3001/agents/research?query=test&payment=mock"
```

**Response (HTTP 200):**
```json
{
  "agent": "research",
  "query": "test",
  "results": [
    {
      "title": "What is x402 Protocol - HTTP-Native Payments",
      "url": "https://build.avax.network/integrations/x402",
      "summary": "x402 enables instant micropayments via HTTP 402 status code..."
    },
    ...
  ],
  "payment": {
    "amount": "$0.02",
    "currency": "USDC",
    "txHash": "0x0feff3ad471c6...",
    "timestamp": "2025-12-01T17:30:47.783Z"
  }
}
```

### 5. Test Summary Agent
```bash
curl -X POST http://localhost:3001/agents/summary \
  -H "Content-Type: application/json" \
  -H "x-payment: mock" \
  -d '{"text": "Artificial intelligence is transforming the world. Agents can now pay for services."}'
```

### 6. Test Translation Agent
```bash
curl -X POST http://localhost:3001/agents/translate \
  -H "Content-Type: application/json" \
  -H "x-payment: mock" \
  -d '{"text": "Hello world", "targetLanguage": "Spanish"}'
```

### 7. Test Code Review Agent
```bash
curl -X POST http://localhost:3001/agents/code-review \
  -H "Content-Type: application/json" \
  -H "x-payment: mock" \
  -d '{"code": "function test() { console.log(\"hello\"); }"}'
```

## 🌐 Testing the Frontend

1. Open http://localhost:3000 in your browser
2. You should see:
   - Navigation bar with "AI Agent Hub" title
   - Hero section with "Where AI agents hire each other"
   - 3 stat boxes (4 Agents, $0.01-$0.05, 2s Settlement)
   - 4 agent cards loading (with skeleton loaders)
   - Footer with links

3. Click on any agent card (e.g., "Research Agent")
4. You should see:
   - Agent name and description
   - Input field for the agent
   - "Execute & Pay" button
   - Payment flow visualization area

5. Enter input and click "Execute & Pay":
   - Status changes to "Requesting..."
   - Then "Payment Required: $0.02"
   - Then "Signing Transaction..."
   - Then "Payment Confirmed!"
   - Then "Result Received"
   - Result JSON displayed

## 📊 Project Structure Verification

```
✅ /Users/Fedor/Desktop/Ava/
├── ✅ README.md (comprehensive documentation)
├── ✅ .env.example (environment template)
├── ✅ .gitignore (git ignore rules)
├── ✅ pnpm-workspace.yaml (workspace config)
├── ✅ package.json (root workspace)
│
├── ✅ packages/
│   ├── ✅ backend/
│   │   ├── ✅ src/
│   │   │   ├── ✅ index.ts (Express server)
│   │   │   ├── ✅ middleware/x402.ts (payment middleware)
│   │   │   ├── ✅ agents/ (4 agents)
│   │   │   └── ✅ routes/agents.ts (endpoints)
│   │   ├── ✅ dist/ (compiled JS)
│   │   ├── ✅ package.json
│   │   └── ✅ tsconfig.json
│   │
│   └── ✅ frontend/
│       ├── ✅ src/
│       │   ├── ✅ app/ (Next.js app)
│       │   ├── ✅ components/ (React components)
│       │   └── ✅ lib/ (x402 client)
│       ├── ✅ .next/ (compiled Next.js)
│       ├── ✅ package.json
│       └── ✅ tsconfig.json
│
└── ✅ docs/
    └── ✅ PRESENTATION.md (presentation slides)
```

## 🔧 Troubleshooting

### Backend won't start
```bash
# Check if port 3001 is in use
lsof -i :3001

# Kill process if needed
kill -9 <PID>

# Try again
cd packages/backend && pnpm dev
```

### Frontend won't start
```bash
# Check if port 3000 is in use
lsof -i :3000

# Kill process if needed
kill -9 <PID>

# Try again
cd packages/frontend && pnpm dev
```

### API returns 404
```bash
# Make sure backend is running on port 3001
curl http://localhost:3001/health

# Check backend logs for errors
# Look for "🚀 AI Agent Service Hub backend running"
```

### Frontend shows loading indefinitely
```bash
# Check browser console for errors (F12)
# Make sure backend is running
# Check NEXT_PUBLIC_BACKEND_URL in .env (should be http://localhost:3001)
```

## 📝 Environment Setup

Create `.env` file in root:
```bash
# Backend Configuration
BACKEND_PORT=3001
NODE_ENV=development

# Wallet Configuration (Testnet only!)
WALLET_ADDRESS=0x0000000000000000000000000000000000000000
WALLET_PRIVATE_KEY=0x0000000000000000000000000000000000000000000000000000000000000000

# x402 Configuration
X402_FACILITATOR_URL=https://facilitator.ultravioletadao.xyz
X402_NETWORK=avalanche-fuji

# Frontend Configuration
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
NEXT_PUBLIC_NETWORK=avalanche-fuji
```

## 🎯 Demo Walkthrough

### For Judges/Reviewers:

1. **Start both servers** (as shown above)

2. **Show Backend x402 Flow:**
   ```bash
   # Show payment required (402)
   curl "http://localhost:3001/agents/research?query=x402"
   
   # Show successful payment (200)
   curl "http://localhost:3001/agents/research?query=x402&payment=mock"
   ```

3. **Show Frontend:**
   - Open http://localhost:3000
   - Click on "Research Agent"
   - Enter "x402 avalanche" as query
   - Click "Execute & Pay"
   - Show payment flow visualization
   - Show result with transaction hash

4. **Show Code:**
   - Open `/packages/backend/src/middleware/x402.ts` - payment middleware
   - Open `/packages/backend/src/routes/agents.ts` - agent endpoints
   - Open `/packages/frontend/src/lib/x402Client.ts` - client implementation

5. **Explain Architecture:**
   - Frontend sends request to backend
   - Backend checks for x402 payment header
   - If missing, returns HTTP 402 with payment details
   - Frontend simulates payment signing
   - Frontend retries with payment header
   - Backend verifies and executes agent
   - Returns result with transaction hash

## ✨ Key Features Demonstrated

- ✅ **x402 Protocol Integration**: HTTP 402 status code for payment requests
- ✅ **4 Mock AI Agents**: Research, Summary, Translation, Code Review
- ✅ **Payment Flow Visualization**: Real-time UI showing payment steps
- ✅ **Mock Payment Simulation**: Demonstrates full payment flow without real blockchain
- ✅ **Beautiful Dark Theme UI**: Web3-optimized design
- ✅ **Responsive Design**: Works on mobile, tablet, desktop
- ✅ **TypeScript**: Full type safety in backend and frontend
- ✅ **Avalanche Integration**: Fuji testnet configuration ready

## 📚 Documentation Files

- **README.md** - Main documentation with architecture, quick start, API docs
- **PRESENTATION.md** - Presentation slides for judges
- **DEPLOYMENT.md** - This file, deployment and testing guide

## 🎓 Learning Resources

- **x402 Protocol**: https://x402.org
- **Avalanche Build**: https://build.avax.network
- **Ultravioleta DAO**: https://ultravioletadao.xyz
- **HTTP 402 Status Code**: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/402

---

**Built for Hack2Build x402 Payments Hackathon**  
**Deadline: December 1, 2025, 17:00 Argentina Time**
