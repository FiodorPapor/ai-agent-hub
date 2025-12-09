# Universal Agent Wallet – x402 Payments Demo

**Universal payment infrastructure for AI agents and tools using x402 micropayments on Avalanche.**

## High-Level Overview

**x402** is the HTTP 402 Payment Required standard that enables pay-per-request APIs. Universal Agent Wallet SDK provides seamless payment handling for any system that needs to make paid API calls.

**One API + One Wallet + Three Integrations**: Backend with x402 endpoint, Universal Wallet SDK, and ready-to-use integrations for Claude MCP, Telegram bots, and CLI tools.

## Key Features

- **Pay-per-request API with x402** - HTTP 402 Payment Required standard implementation
- **Universal Agent Wallet SDK** - Handle payments, balance checks, and wallet status
- **Claude MCP tool integration** - Summarize websites directly in Claude Desktop
- **Telegram bot integration** - Interactive bot with payment flow
- **CLI example for developers** - Command-line tool demonstrating x402 payments
- **Real Avalanche Fuji testnet payments** - Actual blockchain transactions

## Architecture Overview

The system consists of five main components:

- **Backend** (`packages/backend`) - Express server with x402 endpoint `/api/summarize`
- **Universal Wallet SDK** - Payment handling library (reused across integrations)
- **Claude MCP Tool** (`mcp-tools/summarize-website`) - Desktop integration for Claude
- **Telegram Bot** (`integrations/telegram-bot`) - Interactive payment bot
- **CLI Example** (`integrations/cli-example`) - Developer demonstration tool

See [Architecture Documentation](docs/architecture.md) for detailed flow diagrams.

## Quickstart (Local Demo)

### Requirements

- Node.js 18+ 
- npm or pnpm
- Avalanche Fuji testnet AVAX ([Get free testnet AVAX](https://faucet.avax.network/))

### Setup Steps

1. **Clone and install dependencies**
   ```bash
   git clone <repository-url>
   cd universal-agent-wallet
   npm install
   ```

2. **Start the backend**
   ```bash
   cd packages/backend
   npm run dev
   ```
   Expected output: `🚀 Universal Agent Wallet Backend running on port 3004`

3. **Test via CLI** (easiest way)
   ```bash
   cd integrations/cli-example
   npm install
   cp .env.example .env
   # Edit .env and add your WALLET_PRIVATE_KEY
   npm start -- https://example.com
   ```

4. **Test via Telegram Bot** (optional)
   ```bash
   cd integrations/telegram-bot
   npm install
   cp .env.example .env
   # Edit .env and add TELEGRAM_BOT_TOKEN and WALLET_PRIVATE_KEY
   npm start
   ```

5. **Test via Claude MCP** (optional)
   ```bash
   # MCP tool is pre-configured in claude_desktop_config.json
   # Just restart Claude Desktop and use: "summarize https://example.com"
   ```

## How to Test the Demo

### Test via CLI (Easiest)

```bash
cd integrations/cli-example
npm start -- https://example.com
```

**Expected output:**
- Wallet status and balance
- Step 1: API call → 402 Payment Required
- Step 2: Payment execution → TX hash and Snowtrace link  
- Step 3: Summary result

### Test via Telegram

1. Create bot with [@BotFather](https://t.me/BotFather)
2. Configure `.env` with `TELEGRAM_BOT_TOKEN`
3. Send commands:
   - `/start` - Welcome message
   - `/balance` - Check wallet status
   - `/summarize https://example.com` - Pay $0.02 and get summary

### Test via Claude MCP (Optional)

1. MCP tool pre-configured in `claude_desktop_config.json`
2. Restart Claude Desktop
3. Use: "summarize https://example.com" in Claude chat

## Repository Structure

```
/packages/backend          - x402 API + Universal Wallet SDK
/mcp-tools/summarize-website - Claude MCP tool integration  
/integrations/telegram-bot - Telegram bot with payment flow
/integrations/cli-example  - CLI demonstration tool
/docs                      - Architecture & additional docs
```

**Integration Documentation:**
- [Telegram Bot Setup](integrations/telegram-bot/README.md)
- [CLI Example Usage](integrations/cli-example/README.md)  
- [MCP Tool Configuration](mcp-tools/summarize-website/README.md)

## Tech Stack

- **Backend**: Express + TypeScript
- **Blockchain**: Avalanche Fuji + ethers.js
- **Payments**: x402 protocol implementation
- **Integrations**: Telegram Bot API, Claude MCP tools
- **Demo**: Real AVAX micropayments ($0.02 per request)

## Hackathon Context

Built for **Avalanche Hack2Build: Payments x402** - demonstrating universal payment infrastructure for AI agents and tools using HTTP 402 Payment Required standard with real Avalanche blockchain transactions.
