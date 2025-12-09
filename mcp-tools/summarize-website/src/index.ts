#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { config } from "dotenv";
import { X402Wallet } from "./wallet.js";

// Load .env
config();

const API_URL = process.env.API_URL || "http://localhost:3004";
const PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY;

// Wallet validation and initialization
let wallet: X402Wallet | null = null;
let walletError: string | null = null;

if (!PRIVATE_KEY) {
  walletError = "Wallet not configured. Please set WALLET_PRIVATE_KEY in .env file";
  console.error("[MCP] ERROR: Wallet not configured");
  console.error("[MCP] Please set WALLET_PRIVATE_KEY in environment");
  console.error("[MCP] See README.md for setup instructions");
} else {
  try {
    wallet = new X402Wallet(PRIVATE_KEY);
    console.error(`[MCP] Wallet connected: ${wallet.getAddress()}`);
  } catch (error: any) {
    walletError = error.message;
    console.error(`[MCP] ERROR: ${error.message}`);
    console.error("[MCP] See README.md for setup instructions");
  }
}

// Create MCP server
const server = new Server(
  {
    name: "summarize-website",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  const walletInfo = wallet ? `Wallet: ${wallet.getAddress()}` : "Wallet: Not configured";
  
  return {
    tools: [
      {
        name: "wallet_info",
        description: "Show current wallet status, balance, and configuration",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "summarize_website",
        description: `Summarize a website or text content. Costs $0.02 per request via REAL x402 micropayment on Avalanche Fuji. ${walletInfo}`,
        inputSchema: {
          type: "object",
          properties: {
            url: {
              type: "string",
              description: "URL of the website to summarize",
            },
            text: {
              type: "string",
              description: "Text content to summarize (alternative to URL)",
            },
          },
        },
      },
      {
        name: "check_wallet_balance",
        description: "Check the current wallet balance for x402 payments (deprecated - use wallet_info instead)",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const toolName = request.params.name;

  // Wallet info tool
  if (toolName === "wallet_info") {
    if (!wallet) {
      return {
        content: [
          {
            type: "text",
            text: `**❌ Wallet Not Configured**\n\n**Error:** ${walletError}\n\n**Setup Instructions:**\n1. Create a \`.env\` file in the project directory\n2. Add your private key: \`WALLET_PRIVATE_KEY=0x...\`\n3. Get test AVAX from: https://faucet.avax.network/\n4. See README.md for detailed setup guide\n\n**Private Key Format:**\n- Must be 64 hex characters\n- Can include or omit '0x' prefix\n- Example: \`0x1234567890abcdef...\``,
          },
        ],
      };
    }

    try {
      const status = await wallet.getWalletStatus();
      const statusIcon = status.ready ? "✅" : "⚠️";
      const readyText = status.ready ? "Ready for payments" : "Insufficient balance (need > 0.001 AVAX)";
      
      return {
        content: [
          {
            type: "text",
            text: `**${statusIcon} Wallet Status**\n\n**Address:** \`${status.address}\`\n**Balance:** ${status.balance} AVAX\n**Network:** ${status.network}\n**Status:** ${readyText}\n\n${!status.ready ? "**Get test AVAX:** https://faucet.avax.network/" : ""}`,
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: "text",
            text: `**Error checking wallet status:** ${error.message}`,
          },
        ],
      };
    }
  }

  // Check balance tool (deprecated)
  if (toolName === "check_wallet_balance") {
    if (!wallet) {
      return {
        content: [
          {
            type: "text",
            text: `**Error:** ${walletError}\n\nPlease use the \`wallet_info\` tool for detailed setup instructions.`,
          },
        ],
      };
    }

    try {
      const balance = await wallet.getBalance();
      return {
        content: [
          {
            type: "text",
            text: `**Wallet Balance**\n\nAddress: \`${wallet.getAddress()}\`\nBalance: ${balance} AVAX\nNetwork: Avalanche Fuji Testnet\n\n*Note: This tool is deprecated. Use \`wallet_info\` for more detailed information.*`,
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: "text",
            text: `Error checking balance: ${error.message}`,
          },
        ],
      };
    }
  }

  // Summarize tool
  if (toolName === "summarize_website") {
    // Check if wallet is configured
    if (!wallet) {
      return {
        content: [
          {
            type: "text",
            text: `**❌ Cannot summarize: Wallet not configured**\n\n**Error:** ${walletError}\n\nThe summarize tool requires a configured wallet for x402 payments.\n\nUse the \`wallet_info\` tool for setup instructions.`,
          },
        ],
      };
    }

    const { url, text } = request.params.arguments as { url?: string; text?: string };

    if (!url && !text) {
      return {
        content: [
          {
            type: "text",
            text: "Error: Please provide either a URL or text to summarize.",
          },
        ],
      };
    }

    // Check wallet balance before attempting payment
    try {
      const balanceCheck = await wallet.checkSufficientBalance("$0.02");
      if (!balanceCheck.sufficient) {
        return {
          content: [
            {
              type: "text",
              text: `**❌ Insufficient Balance**\n\n${balanceCheck.message}\n\n**Current Status:**\n- Required: ${balanceCheck.required} AVAX\n- Available: ${balanceCheck.available} AVAX\n\nGet test AVAX from: https://faucet.avax.network/`,
            },
          ],
        };
      }
    } catch (error: any) {
      return {
        content: [
          {
            type: "text",
            text: `**Error checking wallet balance:** ${error.message}\n\nPlease check your wallet configuration and network connection.`,
          },
        ],
      };
    }

    try {
      // Step 1: Call API without payment (will get 402)
      console.error("[MCP] Step 1: Calling API...");
      
      const firstResponse = await fetch(`${API_URL}/api/summarize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(url ? { url } : { text }),
      });

      if (firstResponse.status === 402) {
        // Step 2: Get payment details
        const paymentInfo = await firstResponse.json();
        const amount = paymentInfo.payment?.amount || "$0.02";
        const receiverAddress = paymentInfo.payment?.receiverAddress;
        
        console.error(`[MCP] Step 2: Payment required - ${amount} to ${receiverAddress}`);

        if (!receiverAddress) {
          throw new Error("No receiver address in payment info");
        }

        // Step 3: Execute real payment and create header
        console.error("[MCP] Step 3: Executing real blockchain payment...");
        
        const paymentHeader = await wallet.createPaymentHeader({
          amount: amount,
          receiverAddress: receiverAddress,
          description: "summarize_website",
        });

        console.error("[MCP] Step 4: Payment successful, retrying API call...");

        // Step 4: Retry with payment header
        const paidResponse = await fetch(`${API_URL}/api/summarize`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-payment": paymentHeader,
          },
          body: JSON.stringify(url ? { url } : { text }),
        });

        if (!paidResponse.ok) {
          const errorText = await paidResponse.text();
          throw new Error(`API error ${paidResponse.status}: ${errorText}`);
        }

        const result = await paidResponse.json();
        const paymentData = JSON.parse(paymentHeader);
        
        return {
          content: [
            {
              type: "text",
              text: `**Summary** ✅\n\n${result.data.summary}\n\n---\n**Payment Details:**\n- Amount: ${amount}\n- TX Hash: \`${paymentData.txHash}\`\n- Network: Avalanche Fuji\n- Explorer: https://testnet.snowtrace.io/tx/${paymentData.txHash}`,
            },
          ],
        };
      }

      // If we got 200 directly (shouldn't happen without payment)
      const result = await firstResponse.json();
      return {
        content: [
          {
            type: "text",
            text: result.data.summary,
          },
        ],
      };

    } catch (error: any) {
      console.error("[MCP] Error:", error.message);
      return {
        content: [
          {
            type: "text",
            text: `**Error:** ${error.message}\n\nMake sure:\n1. Backend is running at ${API_URL}\n2. Wallet has AVAX balance on Fuji\n3. Get test AVAX from https://faucet.avax.network/`,
          },
        ],
      };
    }
  }

  throw new Error(`Unknown tool: ${toolName}`);
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  console.error(`[MCP] Summarize Website tool started`);
  
  if (wallet) {
    try {
      const balance = await wallet.getBalance();
      console.error(`[MCP] Balance: ${balance} AVAX`);
      console.error(`[MCP] Ready for payments`);
    } catch (error: any) {
      console.error(`[MCP] Warning: Could not check balance - ${error.message}`);
    }
  } else {
    console.error(`[MCP] Wallet: Not configured`);
    console.error(`[MCP] Payments disabled - configure WALLET_PRIVATE_KEY`);
  }
  
  console.error(`[MCP] API: ${API_URL}`);
}

main().catch(console.error);
