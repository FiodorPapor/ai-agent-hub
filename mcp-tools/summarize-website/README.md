# MCP Summarize Website Tool

Claude MCP Tool that summarizes websites with **real** x402 micropayments on Avalanche Fuji testnet.

## Features

- ✅ Real blockchain transactions (not mocks)
- ✅ Avalanche Fuji testnet integration
- ✅ Automatic wallet validation and balance checking
- ✅ Clear error messages and setup instructions
- ✅ Automatic 402 → payment → retry flow
- ✅ Transaction links to Snowtrace explorer

## Quick Setup Guide

### 1. Get Your Private Key from MetaMask

**⚠️ Important: Use ONLY a testnet wallet! Never use your mainnet wallet!**

1. Open MetaMask browser extension
2. Click the three dots menu → **Account details**
3. Click **"Show private key"**
4. Enter your MetaMask password
5. Copy the private key (starts with `0x...`)

### 2. Get Test AVAX

Visit [Avalanche Fuji Faucet](https://faucet.avax.network/) and request test tokens:
1. Enter your wallet address
2. Complete the captcha
3. Click "Request 2 AVAX"
4. Wait for the transaction to complete

### 3. Configure the Tool

```bash
cd mcp-tools/summarize-website
cp .env.example .env
```

Edit `.env` and add your private key:
```env
WALLET_PRIVATE_KEY=0x1234567890abcdef...your_actual_private_key...
API_URL=http://localhost:3004
```

### 4. Install and Build

```bash
npm install
npm run build
```

### 5. Configure Claude Desktop

Edit `~/Library/Application Support/Claude/claude_desktop_config.json`:
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

### 6. Restart Claude Desktop

## Usage

### Available Tools

1. **`wallet_info`** - Check wallet status and configuration
2. **`summarize_website`** - Summarize websites or text (costs $0.02)
3. **`check_wallet_balance`** - Check balance (deprecated, use wallet_info)

### Example Commands in Claude Desktop

- **"Show my wallet info"** - Check wallet status and balance
- **"Summarize https://x402.org"** - Summarize a website
- **"Summarize this text: [paste text]"** - Summarize provided text

## How it Works

1. You ask Claude to summarize content
2. Tool checks wallet configuration and balance
3. Tool calls `/api/summarize` endpoint
4. API returns `402 Payment Required` with payment details
5. Tool executes **real** AVAX transaction on Fuji testnet
6. Tool retries API with transaction proof in `x-payment` header
7. API verifies payment and returns summary
8. You see summary + transaction link to Snowtrace explorer

## Cost

- **$0.02 per request** (≈ 0.0004 AVAX at $50/AVAX)
- Payments are made in AVAX on Avalanche Fuji testnet
- Gas fees are minimal on testnet

## Troubleshooting

### Common Error Messages

**"Wallet not configured"**
- Set `WALLET_PRIVATE_KEY` in your `.env` file
- Use the `wallet_info` tool for setup instructions

**"Invalid private key format"**
- Private key must be 64 hex characters
- Can include or omit the `0x` prefix
- Example: `0x1234567890abcdef...`

**"Insufficient balance"**
- Get test AVAX from https://faucet.avax.network/
- You need at least 0.001 AVAX for transactions

**"Transaction failed"**
- Check your internet connection
- Ensure you have enough AVAX for gas fees
- Try again in a few minutes

### Testing Your Setup

1. **Check wallet status:**
   ```
   Use the wallet_info tool in Claude
   ```

2. **Test without private key:**
   ```bash
   node dist/index.js
   # Should show "Wallet not configured" error
   ```

3. **Test with valid key:**
   ```bash
   WALLET_PRIVATE_KEY=0x... node dist/index.js
   # Should show wallet address and balance
   ```

## Security

⚠️ **Important Security Notes:**
- Use ONLY a testnet wallet with test funds
- Never use your mainnet wallet or real funds
- Private keys are sensitive - keep them secure
- This tool is for testing and development only
