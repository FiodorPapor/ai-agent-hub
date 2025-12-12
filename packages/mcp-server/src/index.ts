#!/usr/bin/env node

/**
 * Universal Wallet MCP Server
 * Provides Claude Desktop with x402-enabled tools for autonomous AI payments
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { config } from 'dotenv';
import { ethers } from 'ethers';
import axios from 'axios';

// Load environment variables
config();

interface SummarizeResult {
  url: string;
  summary: string;
  payment: {
    amount: string;
    txHash: string;
    network: string;
    explorerUrl: string;
  };
  metadata: {
    contentLength: number;
    model: string;
    timestamp: string;
  };
}

class UniversalWalletMCPServer {
  private server: Server;
  private wallet: ethers.Wallet | null = null;
  private backendUrl: string;

  constructor() {
    this.server = new Server(
      {
        name: 'universal-wallet',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.backendUrl = process.env.BACKEND_URL || 'http://localhost:3004';
    this.initializeWallet();
    this.setupHandlers();
  }

  private initializeWallet(): void {
    const privateKey = process.env.AGENT_A_PRIVATE_KEY;
    if (!privateKey) {
      console.error('AGENT_A_PRIVATE_KEY environment variable is required');
      process.exit(1);
    }

    try {
      this.wallet = new ethers.Wallet(privateKey);
      console.error(`[MCP] Initialized wallet: ${this.wallet.address}`);
    } catch (error) {
      console.error('Failed to initialize wallet:', error);
      process.exit(1);
    }
  }

  private setupHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'summarize-website',
            description: 'Summarize any website content using AI. Automatically handles payment via x402 protocol on Avalanche Fuji testnet.',
            inputSchema: {
              type: 'object',
              properties: {
                url: {
                  type: 'string',
                  description: 'The URL of the website to summarize',
                },
              },
              required: ['url'],
            },
          },
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      if (request.params.name === 'summarize-website') {
        const { url } = request.params.arguments as { url: string };
        return await this.handleSummarizeWebsite(url);
      }

      throw new Error(`Unknown tool: ${request.params.name}`);
    });
  }

  private async handleSummarizeWebsite(url: string) {
    try {
      console.error(`[MCP] Summarizing website: ${url}`);

      // Step 1: Make initial request to get 402 Payment Required
      const endpoint = `${this.backendUrl}/x402/summarize-website`;
      
      let response = await axios.post(endpoint, { url }, {
        validateStatus: (status) => status === 402 || status === 200
      });

      if (response.status === 200) {
        // No payment required (shouldn't happen with x402 middleware, but handle it)
        const result = response.data as SummarizeResult;
        return {
          content: [
            {
              type: 'text',
              text: this.formatSuccessResponse(result),
            },
          ],
        };
      }

      if (response.status !== 402) {
        throw new Error(`Unexpected response status: ${response.status}`);
      }

      // Step 2: Handle 402 Payment Required
      const paymentInfo = response.data;
      console.error(`[MCP] Payment required: ${JSON.stringify(paymentInfo.payment)}`);

      // Step 3: Create real payment transaction
      console.error(`[MCP] Creating real payment: 0.001 AVAX to ${paymentInfo.payment.receiverAddress}`);
      
      // Check wallet balance
      const provider = new ethers.JsonRpcProvider('https://api.avax-test.network/ext/bc/C/rpc');
      const wallet = this.wallet!.connect(provider);
      const balance = await provider.getBalance(wallet.address);
      const balanceEth = ethers.formatEther(balance);
      
      console.error(`[MCP] Wallet balance: ${balanceEth} AVAX`);
      
      if (parseFloat(balanceEth) < 0.002) { // Need 0.001 + gas
        throw new Error(`Insufficient balance: ${balanceEth} AVAX (need at least 0.002 AVAX)`);
      }

      // Execute real payment
      const tx = await wallet.sendTransaction({
        to: paymentInfo.payment.receiverAddress,
        value: ethers.parseEther('0.001'),
        gasLimit: 21000
      });

      console.error(`[MCP] Payment transaction sent: ${tx.hash}`);
      console.error(`[MCP] Waiting for confirmation...`);
      
      const receipt = await tx.wait();
      console.error(`[MCP] Payment confirmed in block: ${receipt?.blockNumber}`);

      const realPayment = {
        txHash: tx.hash,
        from: this.wallet!.address,
        to: paymentInfo.payment.receiverAddress,
        value: '0.001',
        timestamp: new Date().toISOString(),
        network: 'avalanche-fuji'
      };

      // Step 4: Retry request with payment proof
      response = await axios.post(endpoint, { url }, {
        headers: {
          'x-payment': JSON.stringify(realPayment)
        }
      });

      if (response.status !== 200) {
        throw new Error(`Payment verification failed: ${response.status}`);
      }

      const result = response.data as SummarizeResult;
      console.error(`[MCP] Summary completed successfully`);

      return {
        content: [
          {
            type: 'text',
            text: this.formatSuccessResponse(result),
          },
        ],
      };

    } catch (error) {
      console.error('[MCP] Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      return {
        content: [
          {
            type: 'text',
            text: `❌ **Error summarizing website**\n\n${errorMessage}\n\nPlease check that:\n- The URL is accessible\n- The backend server is running on ${this.backendUrl}\n- Your wallet has sufficient AVAX balance`,
          },
        ],
        isError: true,
      };
    }
  }

  private formatSuccessResponse(result: SummarizeResult): string {
    return `📄 **Summary of ${result.url}**

${result.summary}

---
💰 **REAL Payment Details (Avalanche Fuji)**
• Amount: ${result.payment.amount}
• Transaction: ${result.payment.txHash}
• Network: ${result.payment.network}
• Explorer: ${result.payment.explorerUrl}
• Status: ✅ Verified on blockchain

📊 **Metadata**
• Content Length: ${result.metadata.contentLength} characters
• AI Model: ${result.metadata.model}
• Processed: ${new Date(result.metadata.timestamp).toLocaleString()}`;
  }

  private generateMockTxHash(): string {
    const randomBytes = ethers.randomBytes(32);
    return ethers.hexlify(randomBytes);
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('[MCP] Universal Wallet MCP Server running');
  }
}

// Start the server
const server = new UniversalWalletMCPServer();
server.run().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
