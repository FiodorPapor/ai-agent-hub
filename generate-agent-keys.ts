#!/usr/bin/env node

/**
 * Generate Agent Keys for Avalanche Fuji Demo
 * Creates random wallets for Agent A and Agent B
 * 
 * IMPORTANT: Use ONLY for testnet (Fuji) - never for mainnet!
 */

import { AvalancheWallet } from "./wallet-service";

async function main(): Promise<void> {
  console.log("=== Generated agent wallets (USE ONLY FOR TESTNET) ===\n");

  try {
    // Generate random wallets for both agents
    const agentA = AvalancheWallet.createRandom();
    const agentB = AvalancheWallet.createRandom();

    // Display Agent A details
    console.log("🤖 Agent A (Payment Sender):");
    console.log(`   Address:     ${agentA.getAddress()}`);
    console.log(`   Private Key: ${agentA.getPrivateKey()}`);
    console.log("");

    // Display Agent B details
    console.log("🤖 Agent B (Payment Receiver):");
    console.log(`   Address:     ${agentB.getAddress()}`);
    console.log(`   Private Key: ${agentB.getPrivateKey()}`);
    console.log("");

    // Show ready-to-paste .env content
    console.log("📋 Copy these lines to your .env file:");
    console.log("=" .repeat(50));
    console.log(`AGENT_A_PRIVATE_KEY=${agentA.getPrivateKey()}`);
    console.log(`AGENT_B_PRIVATE_KEY=${agentB.getPrivateKey()}`);
    console.log("=" .repeat(50));
    console.log("");

    // Important reminders
    console.log("⚠️  IMPORTANT REMINDERS:");
    console.log("   1. These keys are for TESTNET ONLY (Avalanche Fuji)");
    console.log("   2. Fund Agent A with Fuji AVAX from: https://faucet.avax.network/");
    console.log(`   3. Agent A address to fund: ${agentA.getAddress()}`);
    console.log("   4. You need at least 0.1 AVAX for the demo (payment + gas fees)");
    console.log("");

    console.log("✅ Key generation completed successfully!");
    console.log("   Next step: Copy the private keys to your .env file and fund Agent A");

  } catch (error) {
    console.error("❌ Failed to generate agent keys:", error);
    console.log("\n🔧 Troubleshooting:");
    console.log("   1. Make sure wallet-service dependencies are installed:");
    console.log("      cd wallet-service && npm install");
    console.log("   2. Ensure ethers.js is properly installed");
    console.log("   3. Check that wallet-service module exports are correct");
    throw error;
  }
}

// Run the key generation
if (require.main === module) {
  main().catch((error) => {
    console.error("\n💥 Key generation failed:", error.message);
    process.exit(1);
  });
}
