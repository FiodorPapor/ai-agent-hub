# Universal Agent Wallet Telegram Bot

A Telegram bot that integrates with the Universal Agent Wallet SDK to provide paid website summarization services using x402 micropayments on Avalanche Fuji testnet.

## What it does

This bot allows users to summarize websites through Telegram by:
1. Sending a `/summarize <url>` command
2. Automatically handling x402 payment ($0.02 in AVAX)
3. Returning the website summary
4. Providing transaction details on Avalanche Fuji

## Features

- ✅ **Website Summarization** - Summarize any public website
- ✅ **x402 Micropayments** - Automatic AVAX payments on Avalanche Fuji
- ✅ **Wallet Integration** - Built-in Universal Agent Wallet SDK
- ✅ **Balance Checking** - Check wallet balance and status
- ✅ **Error Handling** - Comprehensive error messages and troubleshooting
- ✅ **Transaction Tracking** - Links to Snowtrace explorer for verification

## Installation

### 1. Install Dependencies

```bash
cd integrations/telegram-bot
npm install
```

### 2. Create Telegram Bot

1. Message [@BotFather](https://t.me/BotFather) on Telegram
2. Send `/newbot` and follow the instructions
3. Copy the bot token you receive

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and add your configuration:

```env
# Get from @BotFather
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here

# Your Avalanche Fuji testnet private key (testnet only!)
WALLET_PRIVATE_KEY=0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef

# Backend API URL
API_URL=http://localhost:3004
```

### 4. Get Test AVAX

1. Visit [Avalanche Fuji Faucet](https://faucet.avax.network/)
2. Enter your wallet address
3. Request test AVAX tokens

## Running the Bot

### Start the bot:

```bash
npm start
```

### Development mode:

```bash
npm run dev
```

## Usage

### Available Commands

- `/start` - Welcome message and bot introduction
- `/summarize <url>` - Summarize a website ($0.02 in AVAX)
- `/balance` - Check wallet balance and status
- `/help` - Show help and usage instructions

### Example Commands

```
/summarize https://example.com
/summarize https://news.ycombinator.com
/summarize https://github.com/ethereum/EIPs
/balance
```

## How it Works

1. **User sends command**: `/summarize https://example.com`
2. **Bot validates**: URL format and wallet balance
3. **API call**: POST to `/api/summarize` (receives 402 Payment Required)
4. **Payment**: Bot automatically pays $0.02 in AVAX using Universal Wallet SDK
5. **Retry API**: Same call with payment proof in `x-payment` header
6. **Result**: Bot returns summary with transaction details

## Cost

- **$0.02 per summary** (≈ 0.0004 AVAX at $50/AVAX)
- Payments made in AVAX on Avalanche Fuji testnet
- Gas fees are minimal on testnet

## Troubleshooting

### Common Issues

**"Wallet not configured"**
- Set `WALLET_PRIVATE_KEY` in your `.env` file
- Use `/balance` command to check wallet status

**"Insufficient balance"**
- Get test AVAX from https://faucet.avax.network/
- Need at least 0.001 AVAX for transactions

**"Bot not responding"**
- Check `TELEGRAM_BOT_TOKEN` is correct
- Ensure backend is running at `API_URL`
- Check bot logs for errors

**"Invalid URL"**
- URL must start with `http://` or `https://`
- Website must be publicly accessible

### Testing

1. **Check bot status**: `/start`
2. **Check wallet**: `/balance`
3. **Test summarization**: `/summarize https://example.com`

## Security

⚠️ **Important Security Notes:**
- Use ONLY testnet wallets and test funds
- Never use mainnet private keys
- Keep your bot token secure
- This is for testing and development only

## Dependencies

- `node-telegram-bot-api` - Telegram Bot API wrapper
- `ethers` - Ethereum/Avalanche blockchain interaction
- `dotenv` - Environment variable management
- Universal Agent Wallet SDK - x402 payment handling

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Verify your `.env` configuration
3. Ensure backend is running and accessible
4. Check wallet has sufficient AVAX balance
