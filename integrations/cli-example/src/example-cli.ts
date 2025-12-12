#!/usr/bin/env node

import { config } from 'dotenv';
import { UniversalWallet } from './wallet';

// Load environment variables
config();

// Configuration from environment
const WALLET_PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY;
const API_URL = process.env.API_URL || 'http://localhost:3004';

/**
 * Universal Agent Wallet CLI Example
 * Demonstrates x402 payment flow for paid API calls
 */
class UniversalWalletCLI {
  private wallet: UniversalWallet | null = null;
  private walletError: string | null = null;

  constructor() {
    this.initializeWallet();
  }

  /**
   * Initialize wallet with validation
   */
  private initializeWallet(): void {
    if (!WALLET_PRIVATE_KEY) {
      this.walletError = "Wallet not configured. Please set WALLET_PRIVATE_KEY in .env file";
      return;
    }

    try {
      this.wallet = new UniversalWallet(WALLET_PRIVATE_KEY);
    } catch (error: any) {
      this.walletError = error.message;
    }
  }

  /**
   * Display help message
   */
  private showHelp(): void {
    console.log(`
Universal Agent Wallet CLI Example

Usage: npm start -- <url>
Example: npm start -- https://example.com

This CLI demonstrates the x402 payment flow:
1. Call paid API endpoint
2. Receive 402 Payment Required
3. Execute payment via Universal Wallet SDK
4. Retry API call with payment proof
5. Display result

Requirements:
- Backend must be running at ${API_URL}
- Wallet must have AVAX balance on Avalanche Fuji
- Get test AVAX: https://faucet.avax.network/
    `);
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

  /**
   * Main CLI execution
   */
  async run(): Promise<void> {
    const args = process.argv.slice(2);
    
    // Show help if no arguments
    if (args.length === 0) {
      this.showHelp();
      return;
    }

    const url = args[0];

    // Validate URL
    if (!this.isValidUrl(url)) {
      console.error('❌ Error: Invalid URL format');
      console.error('   URL must start with http:// or https://');
      console.error('   Example: https://example.com');
      process.exit(1);
    }

    console.log(`🌐 URL: ${url}`);
    console.log('');

    // Check wallet configuration
    if (!this.wallet) {
      console.error('❌ Wallet Error:');
      console.error(`   ${this.walletError}`);
      console.error('');
      console.error('Setup Instructions:');
      console.error('1. Copy .env.example to .env');
      console.error('2. Add your WALLET_PRIVATE_KEY');
      console.error('3. Get test AVAX from https://faucet.avax.network/');
      process.exit(1);
    }

    // Display wallet status
    try {
      const status = await this.wallet.getWalletStatus();
      console.log('💰 Wallet Status:');
      console.log(`   Address: ${status.address}`);
      console.log(`   Balance: ${status.balance} AVAX`);
      console.log(`   Network: ${status.network}`);
      console.log(`   Ready: ${status.ready ? '✅ Yes' : '⚠️ No (insufficient balance)'}`);
      console.log('');

      if (!status.ready) {
        console.error('❌ Error: Insufficient wallet balance');
        console.error('   Get test AVAX: https://faucet.avax.network/');
        process.exit(1);
      }
    } catch (error: any) {
      console.error('❌ Error checking wallet status:', error.message);
      process.exit(1);
    }

    // Execute x402 payment flow
    await this.executePaymentFlow(url);
  }

  /**
   * Execute the complete x402 payment flow
   */
  private async executePaymentFlow(url: string): Promise<void> {
    try {
      const apiEndpoint = `${API_URL}/api/summarize`;
      
      // Step 1: Call API without payment (expect 402)
      console.log('🔄 Step 1: Calling API endpoint...');
      console.log(`   POST ${apiEndpoint}`);
      
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
        
        console.log('✅ Step 1 Complete: 402 Payment Required received');
        console.log(`   Payment required: ${amount} to ${receiverAddress}`);
        console.log('');

        if (!receiverAddress) {
          throw new Error('No receiver address in payment info');
        }

        // Step 3: Execute payment
        console.log('💳 Step 2: Executing payment...');
        
        const paymentHeader = await this.wallet!.createPaymentHeader({
          amount: amount,
          receiverAddress: receiverAddress,
          description: 'website_summarization',
        });

        const paymentData = JSON.parse(paymentHeader);
        
        console.log('✅ Step 2 Complete: Payment successful');
        console.log(`   Transaction Hash: ${paymentData.txHash}`);
        console.log(`   Snowtrace Explorer: https://testnet.snowtrace.io/tx/${paymentData.txHash}`);
        console.log('');

        // Step 4: Retry API call with payment proof
        console.log('📄 Step 3: Retrying API with payment proof...');
        
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
        
        console.log('✅ Step 3 Complete: Summary received');
        console.log('');
        
        // Display results
        console.log('📋 Summary Complete');
        console.log('='.repeat(50));
        console.log(result.data.summary);
        console.log('='.repeat(50));
        console.log('');
        
        console.log('💰 Payment Details:');
        console.log(`   Amount: ${amount}`);
        console.log(`   TX Hash: ${paymentData.txHash}`);
        console.log(`   Network: Avalanche Fuji`);
        console.log(`   Explorer: https://testnet.snowtrace.io/tx/${paymentData.txHash}`);

      } else if (firstResponse.ok) {
        // Unexpected: got result without payment
        const result = await firstResponse.json();
        console.log('✅ Summary (no payment required):');
        console.log(result.data.summary);
      } else {
        throw new Error(`API error ${firstResponse.status}: ${await firstResponse.text()}`);
      }

    } catch (error: any) {
      console.error('');
      console.error('❌ Error:', error.message);
      console.error('');
      console.error('Troubleshooting:');
      console.error('• Make sure the URL is accessible');
      console.error(`• Check that backend is running at ${API_URL}`);
      console.error('• Ensure wallet has AVAX balance on Fuji testnet');
      console.error('• Get test AVAX: https://faucet.avax.network/');
      process.exit(1);
    }
  }
}

// Run CLI
async function main() {
  const cli = new UniversalWalletCLI();
  await cli.run();
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});

// Run the CLI
main().catch((error) => {
  console.error('CLI error:', error.message);
  process.exit(1);
});
