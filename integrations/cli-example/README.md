# Universal Agent Wallet CLI Example

A simple command-line tool that demonstrates how to use the Universal Agent Wallet SDK to make x402 payments for paid API endpoints. This example shows the complete payment flow: API call → 402 Payment Required → blockchain payment → retry with proof → receive result.

## What it does

This CLI tool calls the `/api/summarize` endpoint, handles the 402 Payment Required response, executes a real AVAX payment on Avalanche Fuji testnet, and displays the website summary along with transaction details.

## Quick Start

### 1. Install Dependencies

```bash
cd integrations/cli-example
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and add your configuration:

```env
# Your Avalanche Fuji testnet private key (testnet only!)
WALLET_PRIVATE_KEY=0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef

# Backend API URL
API_URL=http://localhost:3004
```

### 3. Get Test AVAX

1. Visit [Avalanche Fuji Faucet](https://faucet.avax.network/)
2. Enter your wallet address
3. Request test AVAX tokens

### 4. Start Backend

Make sure the Universal Agent Wallet backend is running:

```bash
# From project root
cd packages/backend
npm run dev
```

You should see: `🚀 Universal Agent Wallet Backend running on port 3004`

### 5. Run CLI

```bash
npm start -- https://example.com
```

Or use the summarize script:

```bash
npm run summarize -- https://news.ycombinator.com
```

## Example Output

```
🌐 URL: https://example.com

💰 Wallet Status:
   Address: 0x78b15E52703DD697a021A2AA7F235A41C2279442
   Balance: 1.0 AVAX
   Network: Avalanche Fuji
   Ready: ✅ Yes

🔄 Step 1: Calling API endpoint...
   POST http://localhost:3004/api/summarize
✅ Step 1 Complete: 402 Payment Required received
   Payment required: $0.02 to 0x78b15E52703DD697a021A2AA7F235A41C2279442

💳 Step 2: Executing payment...
[Payment] Sending 0.0004 AVAX to 0x78b15E52703DD697a021A2AA7F235A41C2279442...
[Payment] Transaction sent: 0xabc123...
[Payment] Transaction confirmed in block 12345
✅ Step 2 Complete: Payment successful
   Transaction Hash: 0xabc123def456...
   Snowtrace Explorer: https://testnet.snowtrace.io/tx/0xabc123def456...

📄 Step 3: Retrying API with payment proof...
✅ Step 3 Complete: Summary received

📋 Summary Complete
==================================================
This is an example website that demonstrates various
web technologies and serves as a placeholder for
testing and development purposes.
==================================================

💰 Payment Details:
   Amount: $0.02
   TX Hash: 0xabc123def456...
   Network: Avalanche Fuji
   Explorer: https://testnet.snowtrace.io/tx/0xabc123def456...
```

## Usage

### Basic Usage

```bash
npm start -- <url>
```

### Examples

```bash
# Summarize a website
npm start -- https://example.com

# Summarize news article
npm start -- https://news.ycombinator.com

# Show help
npm start
```

## How it Works

1. **Validation**: Checks URL format and wallet configuration
2. **Wallet Status**: Displays wallet address, balance, and readiness
3. **API Call**: Makes POST request to `/api/summarize` endpoint
4. **402 Handling**: Receives Payment Required response with payment details
5. **Payment**: Executes real AVAX transaction on Avalanche Fuji testnet
6. **Retry**: Calls API again with payment proof in `x-payment` header
7. **Result**: Displays website summary and transaction details

## Cost

- **$0.02 per summary** (≈ 0.0004 AVAX at $50/AVAX)
- Payments made in AVAX on Avalanche Fuji testnet
- Gas fees are minimal on testnet

## Troubleshooting

### Common Issues

**"Wallet not configured"**
- Set `WALLET_PRIVATE_KEY` in your `.env` file
- Use a testnet-only private key (64 hex characters)

**"Invalid URL format"**
- URL must start with `http://` or `https://`
- Example: `https://example.com`

**"Insufficient balance"**
- Get test AVAX from https://faucet.avax.network/
- Need at least 0.001 AVAX for transactions

**"API error" or connection refused**
- Make sure backend is running at `http://localhost:3004`
- Start backend with: `cd packages/backend && npm run dev`

**"Transaction failed"**
- Check internet connection
- Ensure sufficient AVAX for gas fees
- Try again in a few minutes

## Security

⚠️ **Important Security Notes:**
- Use ONLY testnet wallets and test funds
- Never use mainnet private keys
- This is for testing and development only
- Keep your private keys secure

## Dependencies

- `ethers` - Ethereum/Avalanche blockchain interaction
- `dotenv` - Environment variable management
- `ts-node` - TypeScript execution
- Universal Agent Wallet SDK - x402 payment handling
