# MCP Tool Setup - Website Summarizer with x402 Payments

This guide sets up the Universal Wallet MCP Tool that integrates with Claude Desktop to provide autonomous AI-to-AI payments using x402 protocol on Avalanche Fuji.

## Overview

**Flow:**
1. User asks Claude: "Summarize https://avalanche.org"
2. Claude calls MCP tool `summarize-website`
3. MCP tool → POST localhost:3004/x402/summarize-website
4. Backend returns 402 Payment Required
5. MCP tool sends 0.001 AVAX payment on Avalanche Fuji
6. MCP tool retries with payment proof
7. Backend fetches URL, sends to OpenAI API
8. Backend returns AI summary
9. Claude shows result with payment details

## Prerequisites

1. **Agent Keys**: Generate using `node generate-agent-keys.ts`
2. **AVAX Balance**: Fund Agent A with Fuji AVAX from https://faucet.avax.network/
3. **OpenAI API Key**: Already configured in .env.example

## Step 1: Install Dependencies

```bash
# Install all workspace dependencies
pnpm install

# Install backend dependencies
cd packages/backend
pnpm install

# Install MCP server dependencies  
cd ../mcp-server
pnpm install
```

## Step 2: Configure Environment

Copy the OpenAI API key to your .env file:

```bash
# Add to .env file
OPENAI_API_KEY=your_openai_api_key_here
```

## Step 3: Start Backend Server

```bash
cd packages/backend
pnpm run dev
```

Backend will start on http://localhost:3004

**Test the endpoint:**
```bash
# Should return 402 Payment Required
curl -X POST http://localhost:3004/x402/summarize-website \
  -H "Content-Type: application/json" \
  -d '{"url": "https://avalanche.org"}'
```

## Step 4: Build MCP Server

```bash
cd packages/mcp-server
pnpm run build
```

**Test MCP server standalone:**
```bash
# Set environment variables
export AGENT_A_PRIVATE_KEY="your_agent_a_private_key"
export BACKEND_URL="http://localhost:3004"

# Run MCP server (will wait for stdin/stdout communication)
node dist/index.js
```

## Step 5: Configure Claude Desktop

1. **Find Claude config location:**
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`

2. **Update config with your actual paths and keys:**

```json
{
  "mcpServers": {
    "universal-wallet": {
      "command": "node",
      "args": ["/Users/Fedor/Desktop/Ava/packages/mcp-server/dist/index.js"],
      "env": {
        "AGENT_A_PRIVATE_KEY": "0x1234...your_actual_private_key",
        "BACKEND_URL": "http://localhost:3004"
      }
    }
  }
}
```

3. **Restart Claude Desktop**

## Step 6: Test with Claude

1. **Open Claude Desktop**
2. **Verify MCP tool is loaded** (should see tool icon)
3. **Test the tool:**

```
Summarize https://avalanche.org
```

**Expected Response:**
```
📄 Summary of https://avalanche.org

Avalanche is a high-speed blockchain platform that supports smart contracts and enables fast, low-cost transactions. It's designed for decentralized applications and custom blockchain networks.

---
💰 Payment Details
• Amount: 0.001 AVAX
• Transaction: 0xabc123...
• Network: avalanche-fuji
• Explorer: https://testnet.snowtrace.io/tx/0xabc123...

📊 Metadata
• Content Length: 2847 characters
• AI Model: gpt-4o-mini
• Processed: 12/12/2025, 2:45:00 PM
```

## Troubleshooting

**Backend Issues:**
- Check backend logs for errors
- Verify OpenAI API key is valid
- Ensure port 3004 is available

**MCP Server Issues:**
- Check Claude Desktop logs
- Verify MCP server builds without errors
- Ensure environment variables are set

**Payment Issues:**
- Using mock payments for demo (no real AVAX required)
- Real payments would require funded Agent A wallet

## Commands Summary

```bash
# Start backend
cd packages/backend && pnpm run dev

# Build MCP server
cd packages/mcp-server && pnpm run build

# Test endpoint
curl -X POST http://localhost:3004/x402/summarize-website \
  -H "Content-Type: application/json" \
  -d '{"url": "https://avalanche.org"}'
```

## Architecture

- **Backend**: Express.js server with x402 middleware + OpenAI integration
- **MCP Server**: Bridges Claude Desktop ↔ x402 payments
- **x402 Protocol**: HTTP 402 Payment Required for AI service monetization
- **Avalanche Fuji**: Testnet for AVAX payments
- **Claude Desktop**: AI assistant with autonomous payment capabilities
