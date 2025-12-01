# Quick Start - AI Agent Service Hub

## 🎯 5-Minute Setup

### 1. Install Dependencies
```bash
cd /Users/Fedor/Desktop/Ava
pnpm install
```

### 2. Start Backend (Terminal 1)
```bash
cd packages/backend
pnpm dev
```

Wait for: `🚀 AI Agent Service Hub backend running on http://localhost:3001`

### 3. Start Frontend (Terminal 2)
```bash
cd packages/frontend
pnpm dev
```

Wait for: `> Local: http://localhost:3000`

### 4. Open Browser
Visit: **http://localhost:3000**

## 🧪 Test the x402 Payment Flow

### Without Payment (HTTP 402)
```bash
curl "http://localhost:3001/agents/research?query=test"
```

### With Mock Payment (HTTP 200)
```bash
curl "http://localhost:3001/agents/research?query=test&payment=mock"
```

## 🎨 What You'll See

### Home Page
- 4 AI Agent cards with prices
- Beautiful dark theme UI
- Responsive design

### Agent Detail Page
- Input form for agent
- "Execute & Pay" button
- Real-time payment flow visualization
- Result display with transaction hash

## 📊 Agents Available

| Agent | Price | Input | Output |
|-------|-------|-------|--------|
| **Research** | $0.02 | Search query | Articles |
| **Summary** | $0.01 | Text | Summary |
| **Translate** | $0.01 | Text + Language | Translation |
| **Code Review** | $0.05 | Code | Review |

## 🔑 Key Features

✅ **x402 Protocol** - HTTP 402 payment requests  
✅ **Mock Agents** - No external API calls needed  
✅ **Payment Flow UI** - Visual payment steps  
✅ **Avalanche Ready** - Fuji testnet configured  
✅ **TypeScript** - Full type safety  
✅ **Beautiful UI** - Dark theme, responsive  

## 📚 Documentation

- **README.md** - Full documentation
- **PRESENTATION.md** - Presentation slides
- **DEPLOYMENT.md** - Testing guide

## 🚀 Next Steps

1. **Explore the code:**
   - Backend: `packages/backend/src/`
   - Frontend: `packages/frontend/src/`

2. **Test all agents:**
   - Click each agent card
   - Enter different inputs
   - Watch payment flow

3. **Review architecture:**
   - See `README.md` for diagrams
   - Check `DEPLOYMENT.md` for API details

## ⚡ Commands

```bash
# Install dependencies
pnpm install

# Start backend dev server
cd packages/backend && pnpm dev

# Start frontend dev server
cd packages/frontend && pnpm dev

# Build backend
cd packages/backend && pnpm build

# Build frontend
cd packages/frontend && pnpm build

# Run backend production
cd packages/backend && node dist/index.js
```

## 🔗 URLs

- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:3001
- **API Info:** http://localhost:3001/api/info
- **Health:** http://localhost:3001/health

## 💡 Pro Tips

1. **Open DevTools** (F12) to see network requests
2. **Check Console** for payment flow logs
3. **Try different queries** for each agent
4. **Watch the payment flow** - it shows all 5 steps
5. **Copy transaction hash** - it's a mock but shows the format

## ❓ Troubleshooting

**Backend won't start?**
```bash
# Check if port 3001 is in use
lsof -i :3001
# Kill if needed: kill -9 <PID>
```

**Frontend won't load?**
```bash
# Check if port 3000 is in use
lsof -i :3000
# Kill if needed: kill -9 <PID>
```

**API returns 404?**
```bash
# Make sure backend is running
curl http://localhost:3001/health
```

## 📞 Support

See **DEPLOYMENT.md** for detailed testing guide and troubleshooting.

---

**Built for Hack2Build x402 Payments Hackathon**  
**Ready to demo!** 🚀
