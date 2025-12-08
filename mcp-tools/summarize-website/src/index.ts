#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { config } from "dotenv";
import { X402Wallet } from "./wallet.js";

// Загрузить .env
config();

const API_URL = process.env.API_URL || "http://localhost:3004";
const PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY;

if (!PRIVATE_KEY) {
  console.error("[MCP] ERROR: WALLET_PRIVATE_KEY not set in environment");
  process.exit(1);
}

// Инициализируем кошелёк
const wallet = new X402Wallet(PRIVATE_KEY);
console.error(`[MCP] Wallet initialized: ${wallet.getAddress()}`);

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
  return {
    tools: [
      {
        name: "summarize_website",
        description: `Summarize a website or text content. Costs $0.02 per request via REAL x402 micropayment on Avalanche Fuji. Wallet: ${wallet.getAddress()}`,
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
        description: "Check the current wallet balance for x402 payments",
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

  // Check balance tool
  if (toolName === "check_wallet_balance") {
    try {
      const balance = await wallet.getBalance();
      return {
        content: [
          {
            type: "text",
            text: `**Wallet Balance**\n\nAddress: \`${wallet.getAddress()}\`\nBalance: ${balance} AVAX\nNetwork: Avalanche Fuji Testnet`,
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
  
  const balance = await wallet.getBalance();
  console.error(`[MCP] Summarize Website tool started`);
  console.error(`[MCP] Wallet: ${wallet.getAddress()}`);
  console.error(`[MCP] Balance: ${balance} AVAX`);
  console.error(`[MCP] API: ${API_URL}`);
}

main().catch(console.error);
