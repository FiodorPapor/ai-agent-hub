import TelegramBot from 'node-telegram-bot-api';
import { config } from 'dotenv';
import { UniversalWallet } from './wallet';

// Load environment variables
config();

// Configuration from environment
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const WALLET_PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY;
const API_URL = process.env.API_URL || 'http://localhost:3004';

/**
 * Universal Agent Wallet Telegram Bot
 * Integrates with x402 payment system for paid API calls
 */
class UniversalWalletBot {
  private bot: TelegramBot;
  private wallet: UniversalWallet | null = null;
  private walletError: string | null = null;

  constructor() {
    // Validate required environment variables
    if (!TELEGRAM_BOT_TOKEN) {
      throw new Error('TELEGRAM_BOT_TOKEN is required in environment variables');
    }

    // Initialize Telegram bot
    this.bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });
    
    // Initialize wallet if private key is provided
    this.initializeWallet();
    
    // Set up bot commands and handlers
    this.setupCommands();
    
    console.log('🤖 Universal Agent Wallet Telegram Bot started');
    console.log(`💰 Wallet: ${this.wallet ? this.wallet.getAddress() : 'Not configured'}`);
    console.log(`🌐 API: ${API_URL}`);
  }

  /**
   * Initialize wallet with validation and error handling
   */
  private initializeWallet(): void {
    if (!WALLET_PRIVATE_KEY) {
      this.walletError = "Wallet not configured. Please set WALLET_PRIVATE_KEY in environment";
      console.error('[Bot] ERROR: Wallet not configured');
      return;
    }

    try {
      this.wallet = new UniversalWallet(WALLET_PRIVATE_KEY);
      console.log(`[Bot] Wallet connected: ${this.wallet.getAddress()}`);
    } catch (error: any) {
      this.walletError = error.message;
      console.error(`[Bot] Wallet initialization failed: ${error.message}`);
    }
  }

  /**
   * Set up bot commands and message handlers
   */
  private setupCommands(): void {
    // Handle /start command
    this.bot.onText(/\/start/, (msg) => {
      const chatId = msg.chat.id;
      const welcomeMessage = `
🤖 *Universal Agent Wallet Bot*

This bot can summarize websites using paid x402 micropayments on Avalanche Fuji.

*Available Commands:*
/summarize <url> - Summarize a website ($0.02 in AVAX)
/balance - Check wallet balance
/help - Show this help message

*Example:*
\`/summarize https://example.com\`

*Note:* Each summary costs $0.02 paid in AVAX on Avalanche Fuji testnet.
      `;
      
      this.bot.sendMessage(chatId, welcomeMessage, { parse_mode: 'Markdown' });
    });

    // Handle /help command
    this.bot.onText(/\/help/, (msg) => {
      const chatId = msg.chat.id;
      const helpMessage = `
*Universal Agent Wallet Bot Help*

*Commands:*
/summarize <url> - Summarize any website
/balance - Check wallet balance
/start - Show welcome message

*Example Usage:*
\`/summarize https://news.ycombinator.com\`
\`/summarize https://github.com/ethereum/EIPs\`

*Payment:* Each summary costs $0.02 in AVAX on Avalanche Fuji testnet.

*Need help?* Make sure the bot wallet has AVAX balance for payments.
      `;
      
      this.bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
    });

    // Handle /balance command
    this.bot.onText(/\/balance/, async (msg) => {
      const chatId = msg.chat.id;
      await this.handleBalanceCommand(chatId);
    });

    // Handle /summarize command
    this.bot.onText(/\/summarize (.+)/, async (msg, match) => {
      const chatId = msg.chat.id;
      const url = match?.[1]?.trim();
      
      if (!url) {
        this.bot.sendMessage(chatId, 'Please send a valid URL, for example: /summarize https://example.com');
        return;
      }

      await this.handleSummarizeCommand(chatId, url);
    });

    // Handle /summarize without URL
    this.bot.onText(/\/summarize$/, (msg) => {
      const chatId = msg.chat.id;
      this.bot.sendMessage(chatId, 'Please send a valid URL, for example: /summarize https://example.com');
    });

    // Handle unknown commands
    this.bot.on('message', (msg) => {
      const chatId = msg.chat.id;
      const text = msg.text;
      
      // Ignore if it's a known command or not a command
      if (!text?.startsWith('/') || 
          text.startsWith('/start') || 
          text.startsWith('/help') || 
          text.startsWith('/balance') || 
          text.startsWith('/summarize')) {
        return;
      }
      
      this.bot.sendMessage(chatId, 
        'Unknown command. Use /help to see available commands or /summarize <url> to summarize a website.'
      );
    });

    // Handle polling errors
    this.bot.on('polling_error', (error) => {
      console.error('[Bot] Polling error:', error.message);
    });
  }

  /**
   * Handle balance check command
   */
  private async handleBalanceCommand(chatId: number): Promise<void> {
    try {
      if (!this.wallet) {
        this.bot.sendMessage(chatId, 
          `❌ *Wallet Error*\n\n${this.walletError}\n\nPlease configure WALLET_PRIVATE_KEY in the bot environment.`,
          { parse_mode: 'Markdown' }
        );
        return;
      }

      const status = await this.wallet.getWalletStatus();
      const statusIcon = status.ready ? '✅' : '⚠️';
      const readyText = status.ready ? 'Ready for payments' : 'Insufficient balance (need > 0.001 AVAX)';
      
      const balanceMessage = `
${statusIcon} *Wallet Status*

*Address:* \`${status.address}\`
*Balance:* ${status.balance} AVAX
*Network:* ${status.network}
*Status:* ${readyText}

${!status.ready ? '*Get test AVAX:* https://faucet.avax.network/' : ''}
      `;
      
      this.bot.sendMessage(chatId, balanceMessage, { parse_mode: 'Markdown' });
    } catch (error: any) {
      console.error('[Bot] Balance check error:', error.message);
      this.bot.sendMessage(chatId, `❌ Error checking wallet balance: ${error.message}`);
    }
  }

  /**
   * Handle summarize command with x402 payment flow
   */
  private async handleSummarizeCommand(chatId: number, url: string): Promise<void> {
    try {
      // Validate wallet configuration
      if (!this.wallet) {
        this.bot.sendMessage(chatId, 
          `❌ *Cannot summarize: Wallet not configured*\n\n${this.walletError}\n\nPlease configure WALLET_PRIVATE_KEY in the bot environment.`,
          { parse_mode: 'Markdown' }
        );
        return;
      }

      // Validate URL format
      if (!this.isValidUrl(url)) {
        this.bot.sendMessage(chatId, 'Please send a valid URL, for example: /summarize https://example.com');
        return;
      }

      // Check wallet balance before attempting payment
      const balanceCheck = await this.wallet.checkSufficientBalance('$0.02');
      if (!balanceCheck.sufficient) {
        this.bot.sendMessage(chatId, 
          `❌ *Insufficient Balance*\n\n${balanceCheck.message}`,
          { parse_mode: 'Markdown' }
        );
        return;
      }

      // Send processing message
      const processingMsg = await this.bot.sendMessage(chatId, '🔄 Processing your request...');

      // Step 1: Call API without payment (expect 402)
      console.log(`[Bot] Step 1: Calling API for ${url}`);
      
      const apiEndpoint = `${API_URL}/api/summarize`;
      const firstResponse = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (firstResponse.status === 402) {
        // Step 2: Handle payment required
        const paymentInfo = await firstResponse.json();
        const amount = paymentInfo.payment?.amount || '$0.02';
        const receiverAddress = paymentInfo.payment?.receiverAddress;
        
        console.log(`[Bot] Step 2: Payment required - ${amount} to ${receiverAddress}`);

        if (!receiverAddress) {
          throw new Error('No receiver address in payment info');
        }

        // Update status message
        await this.bot.editMessageText('💰 Processing payment...', {
          chat_id: chatId,
          message_id: processingMsg.message_id
        });

        // Step 3: Execute payment
        console.log('[Bot] Step 3: Executing blockchain payment...');
        
        const paymentHeader = await this.wallet.createPaymentHeader({
          amount: amount,
          receiverAddress: receiverAddress,
          description: 'website_summarization',
        });

        // Step 4: Retry API call with payment proof
        console.log('[Bot] Step 4: Retrying API call with payment...');
        
        await this.bot.editMessageText('📄 Generating summary...', {
          chat_id: chatId,
          message_id: processingMsg.message_id
        });

        const paidResponse = await fetch(apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-payment': paymentHeader,
          },
          body: JSON.stringify({ url }),
        });

        if (!paidResponse.ok) {
          const errorText = await paidResponse.text();
          throw new Error(`API error ${paidResponse.status}: ${errorText}`);
        }

        const result = await paidResponse.json();
        const paymentData = JSON.parse(paymentHeader);
        
        // Send successful result
        const successMessage = `✅ Summary Complete

${result.data.summary}

Payment Details:
Amount: ${amount}
TX Hash: ${paymentData.txHash}
Network: Avalanche Fuji
Explorer: https://testnet.snowtrace.io/tx/${paymentData.txHash}`;
        
        await this.bot.editMessageText(successMessage, {
          chat_id: chatId,
          message_id: processingMsg.message_id
        });

      } else if (firstResponse.ok) {
        // Unexpected: got result without payment
        const result = await firstResponse.json();
        await this.bot.editMessageText(`✅ Summary\n\n${result.data.summary}`, {
          chat_id: chatId,
          message_id: processingMsg.message_id
        });
      } else {
        throw new Error(`API error ${firstResponse.status}: ${await firstResponse.text()}`);
      }

    } catch (error: any) {
      console.error('[Bot] Summarize error:', error.message);
      
      const errorMessage = `❌ Error

${error.message}

Troubleshooting:
• Make sure the URL is accessible
• Check that the backend is running at ${API_URL}
• Ensure wallet has AVAX balance on Fuji testnet
• Get test AVAX: https://faucet.avax.network/`;
      
      this.bot.sendMessage(chatId, errorMessage);
    }
  }

  /**
   * Validate URL format
   */
  private isValidUrl(string: string): boolean {
    try {
      const url = new URL(string);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  }
}

// Start the bot
try {
  new UniversalWalletBot();
} catch (error: any) {
  console.error('Failed to start bot:', error.message);
  process.exit(1);
}
