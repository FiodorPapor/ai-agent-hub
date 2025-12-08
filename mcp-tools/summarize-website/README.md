# MCP Summarize Website Tool

Claude MCP Tool that summarizes websites with **real** x402 micropayments on Avalanche Fuji.

## Features

- ✅ Real blockchain transactions (not mocks)
- ✅ Avalanche Fuji testnet
- ✅ Automatic 402 → payment → retry flow
- ✅ Transaction links to Snowtrace explorer

## Setup

### 1. Get test AVAX

Go to https://faucet.avax.network/ and get Fuji testnet AVAX for your wallet.

### 2. Create .env file
```bash
cd mcp-tools/summarize-website
cp .env.example .env
```

Edit `.env`  and add your private key:
```
WALLET_PRIVATE_KEY=0x...your_private_key...
API_URL=http://localhost:3004
```

### 3. Build the tool
```bash
npm install
npm run build
```

### 4. Configure Claude Desktop

Edit `~/Library/Application Support/Claude/claude_desktop_config.json` :
```json
{
  "mcpServers": {
    "summarize-website": {
      "command": "node",
      "args": ["/FULL/PATH/TO/mcp-tools/summarize-website/dist/index.js"],
      "env": {
        "API_URL": "http://localhost:3004",
        "WALLET_PRIVATE_KEY": "0x...your_key..."
      }
    }
  }
}
```

### 5. Restart Claude Desktop

## Usage

In Claude Desktop, say:

- "Check my wallet balance"
- "Summarize https://x402.org"
- "Summarize this text: [paste text]"

## How it works

1. You ask Claude to summarize a website
2. Tool calls `/api/summarize` endpoint
3. API returns `402 Payment Required` with payment details
4. Tool executes **real** AVAX transaction on Fuji
5. Tool retries API with transaction proof in `x-payment` header
6. API verifies payment and returns summary
7. You see summary + transaction link to Snowtrace

## Cost

$0.02 per request (≈ 0.0004 AVAX at $50/AVAX)

## Security

⚠️ Use only testnet wallet with test funds!
Never put real funds in this wallet.
