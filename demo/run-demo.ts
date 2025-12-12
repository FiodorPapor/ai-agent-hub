#!/usr/bin/env node

/**
 * Agent-to-Agent Avalanche Payment Demo
 * Demonstrates Agent A paying Agent B using Avalanche Fuji testnet
 */

import { config } from 'dotenv';
import { AgentA } from '../agents/agent-a';
import { AgentB } from '../agents/agent-b';
import { DEFAULT_PAYMENT_AMOUNT, formatAvaxDisplay, createSeparator, getExplorerUrl } from './config';

// Load environment variables
config({ path: '../.env' }); // Try parent directory first
config(); // Fallback to current directory

async function runDemo(): Promise<void> {
  console.log(createSeparator());
  console.log('🚀 Starting Agent-to-Agent Avalanche Payment Demo...');
  console.log(createSeparator());

  try {
    // Initialize agents
    console.log('\n📋 Initializing agents...');
    const agentA = new AgentA();
    const agentB = new AgentB();

    // Get agent addresses
    const agentAAddress = await agentA.getAddress();
    const agentBAddress = await agentB.getAddress();

    console.log(`✅ ${agentA.getName()} initialized`);
    console.log(`   Address: ${agentAAddress}`);
    console.log(`✅ ${agentB.getName()} initialized`);
    console.log(`   Address: ${agentBAddress}`);

    // Check initial balances
    console.log('\n💰 Checking initial balances...');
    const agentABalanceBefore = await agentA.getBalance();
    const agentBBalanceBefore = await agentB.getBalance();

    console.log(`${agentA.getName()} balance: ${formatAvaxDisplay(agentABalanceBefore)}`);
    console.log(`${agentB.getName()} balance: ${formatAvaxDisplay(agentBBalanceBefore)}`);

    // Validate Agent A has sufficient balance (payment + gas fees)
    const paymentAmount = parseFloat(DEFAULT_PAYMENT_AMOUNT);
    const agentABalance = parseFloat(agentABalanceBefore);
    const estimatedGasFee = 0.001; // Conservative estimate for gas fees
    const totalRequired = paymentAmount + estimatedGasFee;
    
    if (agentABalance < totalRequired) {
      throw new Error(
        `Insufficient balance! ${agentA.getName()} has ${formatAvaxDisplay(agentABalanceBefore)} ` +
        `but needs at least ${formatAvaxDisplay(totalRequired.toString())} ` +
        `(${formatAvaxDisplay(DEFAULT_PAYMENT_AMOUNT)} payment + ~${formatAvaxDisplay(estimatedGasFee.toString())} gas fees).\n\n` +
        `💡 Fund Agent A with Fuji AVAX from: https://faucet.avax.network/\n` +
        `   Agent A address: ${agentAAddress}`
      );
    }

    // Execute payment
    console.log('\n💸 Executing payment...');
    console.log(`${agentA.getName()} paying ${formatAvaxDisplay(DEFAULT_PAYMENT_AMOUNT)} to ${agentB.getName()}...`);
    
    const txHash = await agentA.pay(agentBAddress, DEFAULT_PAYMENT_AMOUNT);
    
    console.log(`✅ Payment sent successfully!`);
    console.log(`   Transaction hash: ${txHash}`);
    console.log(`   View on explorer: ${getExplorerUrl(txHash)}`);

    // Wait a moment for transaction to be processed
    console.log('\n⏳ Waiting for transaction to be processed...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Check final balances
    console.log('\n💰 Checking final balances...');
    const agentABalanceAfter = await agentA.getBalance();
    const agentBBalanceAfter = await agentB.getBalance();

    console.log(`${agentA.getName()} balance: ${formatAvaxDisplay(agentABalanceAfter)}`);
    console.log(`${agentB.getName()} balance: ${formatAvaxDisplay(agentBBalanceAfter)}`);

    // Summary
    console.log('\n' + createSeparator());
    console.log('🎉 Demo finished successfully!');
    console.log(createSeparator());
    
    console.log('\n📊 Transaction Summary:');
    console.log(`Payment Amount: ${formatAvaxDisplay(DEFAULT_PAYMENT_AMOUNT)}`);
    console.log(`Transaction: ${txHash}`);
    
    console.log('\n📈 Balance Changes:');
    console.log(`${agentA.getName()}: ${formatAvaxDisplay(agentABalanceBefore)} → ${formatAvaxDisplay(agentABalanceAfter)}`);
    console.log(`${agentB.getName()}: ${formatAvaxDisplay(agentBBalanceBefore)} → ${formatAvaxDisplay(agentBBalanceAfter)}`);

    const agentAChange = parseFloat(agentABalanceAfter) - parseFloat(agentABalanceBefore);
    const agentBChange = parseFloat(agentBBalanceAfter) - parseFloat(agentBBalanceBefore);
    
    console.log(`\n💹 Net Changes:`);
    console.log(`${agentA.getName()}: ${agentAChange >= 0 ? '+' : ''}${agentAChange.toFixed(6)} AVAX`);
    console.log(`${agentB.getName()}: ${agentBChange >= 0 ? '+' : ''}${agentBChange.toFixed(6)} AVAX`);

  } catch (error) {
    console.error('\n❌ Demo failed:', error instanceof Error ? error.message : error);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure AGENT_A_PRIVATE_KEY and AGENT_B_PRIVATE_KEY are set in .env');
    console.log('2. Ensure Agent A has sufficient AVAX balance (get testnet AVAX from https://faucet.avax.network/)');
    console.log('3. Check that private keys are valid 64-character hex strings starting with 0x');
    process.exit(1);
  }
}

// Run the demo
if (require.main === module) {
  runDemo().catch(console.error);
}
