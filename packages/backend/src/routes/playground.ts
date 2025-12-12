import { Router, Request, Response } from 'express';
import { config } from 'dotenv';
import path from 'path';
import { ethers } from 'ethers';

// Load environment variables
config({ path: path.resolve(__dirname, '../../../../../.env') });

const router: Router = Router();

// Avalanche Fuji constants
const AVALANCHE_FUJI_RPC = 'https://api.avax-test.network/ext/bc/C/rpc';
const DEFAULT_PAYMENT_AMOUNT = '0.001';

// Helper functions
function formatAvaxDisplay(amount: string): string {
  const num = parseFloat(amount);
  if (isNaN(num)) return '0.000000 AVAX';
  return `${num.toFixed(6)} AVAX`;
}

function getExplorerUrl(txHash: string): string {
  return `https://testnet.snowtrace.io/tx/${txHash}`;
}

// Simple AvalancheWallet class
class AvalancheWallet {
  private wallet: ethers.Wallet;
  private provider: ethers.JsonRpcProvider;

  constructor(privateKey: string) {
    this.provider = new ethers.JsonRpcProvider(AVALANCHE_FUJI_RPC);
    this.wallet = new ethers.Wallet(privateKey, this.provider);
  }

  static createRandom(): AvalancheWallet {
    const randomWallet = ethers.Wallet.createRandom();
    return new AvalancheWallet(randomWallet.privateKey);
  }

  getAddress(): string {
    return this.wallet.address;
  }

  getPrivateKey(): string {
    return this.wallet.privateKey;
  }

  async getBalance(): Promise<string> {
    try {
      const balance = await this.provider.getBalance(this.wallet.address);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Failed to get balance:', error);
      throw new Error('Failed to fetch wallet balance');
    }
  }

  async sendNative(to: string, amountInAvax: string): Promise<string> {
    try {
      if (!ethers.isAddress(to)) {
        throw new Error('Invalid recipient address');
      }

      const amountInWei = ethers.parseEther(amountInAvax);
      const tx = await this.wallet.sendTransaction({
        to,
        value: amountInWei,
        gasLimit: 21000
      });

      console.log(`Transaction sent: ${tx.hash}`);
      return tx.hash;
    } catch (error) {
      console.error('Failed to send transaction:', error);
      throw new Error(`Transaction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

/**
 * GET /playground/health
 * Health check for playground functionality
 */
router.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'Universal Agent Wallet Playground',
    timestamp: new Date().toISOString(),
    network: 'avalanche-fuji'
  });
});

/**
 * POST /playground/generate-keys
 * Generate new Agent A and Agent B wallets for testing
 */
router.post('/generate-keys', async (req: Request, res: Response) => {
  try {
    console.log('[Playground] Generating new agent keys...');

    // Generate random wallets for both agents
    const agentA = AvalancheWallet.createRandom();
    const agentB = AvalancheWallet.createRandom();

    const response = {
      agentA: {
        address: agentA.getAddress(),
        privateKey: agentA.getPrivateKey()
      },
      agentB: {
        address: agentB.getAddress(),
        privateKey: agentB.getPrivateKey()
      },
      envExamples: {
        AGENT_A_PRIVATE_KEY: agentA.getPrivateKey(),
        AGENT_B_PRIVATE_KEY: agentB.getPrivateKey()
      },
      instructions: [
        '1. Copy these private keys to your .env file',
        '2. Restart the backend to load new keys',
        '3. Fund Agent A with Fuji AVAX from: https://faucet.avax.network/',
        '4. Use only for Avalanche Fuji testnet - never mainnet!'
      ]
    };

    console.log(`[Playground] Generated Agent A: ${agentA.getAddress()}`);
    console.log(`[Playground] Generated Agent B: ${agentB.getAddress()}`);

    res.json(response);
  } catch (error) {
    console.error('[Playground] Key generation failed:', error);
    res.status(500).json({
      error: 'Key generation failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to generate agent wallets. Check server logs for details.'
    });
  }
});

/**
 * GET /playground/balances
 * Check current balances of Agent A and Agent B
 */
router.get('/balances', async (req: Request, res: Response) => {
  try {
    console.log('[Playground] Checking agent balances...');

    // Check for required environment variables
    const agentAKey = process.env.AGENT_A_PRIVATE_KEY;
    const agentBKey = process.env.AGENT_B_PRIVATE_KEY;
    
    console.log('[Playground] AGENT_A_PRIVATE_KEY exists:', !!agentAKey);
    console.log('[Playground] AGENT_B_PRIVATE_KEY exists:', !!agentBKey);
    if (agentAKey) console.log('[Playground] AGENT_A_PRIVATE_KEY length:', agentAKey.length);
    if (agentBKey) console.log('[Playground] AGENT_B_PRIVATE_KEY length:', agentBKey.length);

    if (!agentAKey) {
      return res.status(400).json({
        error: 'Missing AGENT_A_PRIVATE_KEY',
        message: 'No agent keys found. Generate keys first using the playground.',
        instructions: [
          '1. Click "Generate Agent Keys" to create new wallets',
          '2. Copy the private keys to your .env file',
          '3. Restart the backend',
          '4. Try checking balances again'
        ]
      });
    }

    if (!agentBKey) {
      return res.status(400).json({
        error: 'Missing AGENT_B_PRIVATE_KEY',
        message: 'No agent keys found. Generate keys first using the playground.'
      });
    }

    // Create wallet instances
    const agentAWallet = new AvalancheWallet(agentAKey);
    const agentBWallet = new AvalancheWallet(agentBKey);

    // Fetch balances
    const agentABalance = await agentAWallet.getBalance();
    const agentBBalance = await agentBWallet.getBalance();

    const response = {
      agentA: {
        address: agentAWallet.getAddress(),
        balanceAvax: agentABalance
      },
      agentB: {
        address: agentBWallet.getAddress(),
        balanceAvax: agentBBalance
      },
      network: 'avalanche-fuji',
      timestamp: new Date().toISOString()
    };

    console.log(`[Playground] Agent A (${agentAWallet.getAddress()}): ${formatAvaxDisplay(agentABalance)}`);
    console.log(`[Playground] Agent B (${agentBWallet.getAddress()}): ${formatAvaxDisplay(agentBBalance)}`);

    res.json(response);
  } catch (error) {
    console.error('[Playground] Balance check failed:', error);
    res.status(500).json({
      error: 'Balance check failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to fetch agent balances. Check that private keys are valid and network is accessible.'
    });
  }
});


/**
 * POST /playground/make-payment
 * Execute real AVAX payment for x402 services
 */
router.post('/make-payment', async (req: Request, res: Response) => {
  const { to, amount, description } = req.body;
  
  try {
    console.log(`[Playground] Making real payment: ${amount} AVAX to ${to}`);

    // Check for required environment variables
    const agentAKey = process.env.AGENT_A_PRIVATE_KEY;
    if (!agentAKey) {
      return res.status(400).json({
        error: 'Missing Agent A private key',
        message: 'AGENT_A_PRIVATE_KEY not set in environment variables'
      });
    }

    // Initialize Agent A wallet (payer)
    const agentA = new AvalancheWallet(agentAKey);
    const agentAAddress = agentA.getAddress();
    
    console.log(`[Playground] Agent A address: ${agentAAddress}`);
    console.log(`[Playground] Payment recipient: ${to}`);

    // Check Agent A balance
    const balance = await agentA.getBalance();
    const balanceNum = parseFloat(balance);
    const amountNum = parseFloat(amount);
    const estimatedGas = 0.001; // Conservative gas estimate

    if (balanceNum < (amountNum + estimatedGas)) {
      return res.status(400).json({
        error: 'Insufficient balance',
        message: `Agent A has ${balance} AVAX but needs ${amountNum + estimatedGas} AVAX (${amount} payment + ${estimatedGas} gas)`,
        instructions: [
          '1. Fund Agent A with Fuji AVAX from: https://faucet.avax.network/',
          `2. Agent A address: ${agentAAddress}`,
          '3. Wait for transaction confirmation',
          '4. Try the payment again'
        ]
      });
    }

    // Execute payment
    console.log(`[Playground] Executing payment: ${amount} AVAX`);
    const txHash = await agentA.sendNative(to, amount);
    
    const result = {
      txHash,
      from: agentAAddress,
      to,
      amount,
      timestamp: new Date().toISOString(),
      network: 'avalanche-fuji',
      explorerUrl: getExplorerUrl(txHash),
      description
    };

    console.log(`[Playground] Payment successful: ${txHash}`);
    res.json(result);

  } catch (error) {
    console.error('[Playground] Payment failed:', error);
    res.status(500).json({
      error: 'Payment failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      details: 'Failed to execute blockchain payment'
    });
  }
});

/**
 * POST /playground/restart
 * Provide restart instructions for manual backend restart
 */
router.post('/restart', (req: Request, res: Response) => {
  try {
    console.log('[Playground] Manual restart instructions requested by user');
    
    res.json({
      message: 'Manual restart required',
      instructions: [
        'Go to your terminal where backend is running',
        'Press Ctrl+C to stop the backend',
        'Run: pnpm run dev (to restart)',
        'Come back and refresh this page'
      ],
      commands: [
        'cd /Users/Fedor/Desktop/Ava/packages/backend',
        'pnpm run dev'
      ],
      note: 'This ensures .env variables are properly reloaded'
    });

  } catch (error) {
    console.error('[Playground] Restart instructions failed:', error);
    res.status(500).json({
      error: 'Failed to provide restart instructions',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /playground/x402-ai-demo
 * Orchestrate the full x402 AI demo flow: request → 402 → payment → retry → answer
 */
router.post('/x402-ai-demo', async (req: Request, res: Response) => {
  const logs: string[] = [];
  
  try {
    console.log('[Playground] Starting x402 AI demo...');
    logs.push('🤖 Starting x402 AI microservice demo...');

    // Check for required environment variables
    const agentAKey = process.env.AGENT_A_PRIVATE_KEY;
    const agentBKey = process.env.AGENT_B_PRIVATE_KEY;

    if (!agentAKey || !agentBKey) {
      return res.status(400).json({
        error: 'Missing environment variables',
        message: 'AGENT_A_PRIVATE_KEY and/or AGENT_B_PRIVATE_KEY not set. Generate keys and update .env first.',
        details: `Missing: ${!agentAKey ? 'AGENT_A_PRIVATE_KEY' : ''} ${!agentBKey ? 'AGENT_B_PRIVATE_KEY' : ''}`.trim(),
        logs
      });
    }

    // Get question from request
    const question = req.body.question || '¿Qué es la economía de agentes en Avalanche?';
    logs.push(`📝 Question: ${question}`);

    // Initialize Agent A wallet (payer)
    const { UniversalWallet } = require('../sdk/UniversalWallet');
    const agentAWallet = new UniversalWallet({
      privateKey: agentAKey,
      network: 'avalanche-fuji'
    });

    logs.push(`💰 Agent A wallet: ${agentAWallet.getAddress()}`);

    // Check Agent A balance
    const balance = await agentAWallet.getBalance();
    logs.push(`💳 Agent A balance: ${parseFloat(balance).toFixed(6)} AVAX`);

    if (parseFloat(balance) < 0.002) {
      return res.status(400).json({
        error: 'Insufficient funds',
        message: 'Agent A needs at least 0.002 AVAX for the demo (0.001 for payment + gas fees)',
        details: `Current balance: ${balance} AVAX`,
        logs
      });
    }

    // Construct the AI endpoint URL
    const aiEndpointUrl = `http://localhost:${process.env.BACKEND_PORT || 3004}/x402/agent-b/ai-answer?question=${encodeURIComponent(question)}`;
    
    logs.push('🔄 Step 1: Requesting AI answer from Agent B...');
    logs.push('📡 Making initial request to AI service...');

    let paymentResult: any = null;
    let aiResponse: any = null;

    // Use UniversalWallet's callPaidAPI to handle the full x402 flow
    const response = await agentAWallet.callPaidAPI(aiEndpointUrl, { method: 'GET' });

    if (!response.ok) {
      throw new Error(`AI service returned ${response.status}: ${response.statusText}`);
    }

    aiResponse = await response.json();
    logs.push('🎉 AI answer received successfully!');
    logs.push('📋 AI processing completed');

    // Get payment info from response metadata if available
    if (aiResponse.metadata && aiResponse.metadata.payment) {
      paymentResult = {
        hash: aiResponse.metadata.payment.txHash,
        from: agentAWallet.getAddress(),
        to: aiResponse.metadata.payment.to || 'Agent B',
        value: '0.001',
        network: 'avalanche-fuji'
      };
      logs.push(`✅ Payment confirmed: ${paymentResult.hash}`);
      logs.push(`🔗 Explorer: https://testnet.snowtrace.io/tx/${paymentResult.hash}`);
    }

    // Return comprehensive result
    const result = {
      question: question,
      answer: aiResponse.answer,
      payment: paymentResult ? {
        amountAvax: paymentResult.value,
        txHash: paymentResult.hash,
        explorerUrl: `https://testnet.snowtrace.io/tx/${paymentResult.hash}`,
        from: paymentResult.from,
        to: paymentResult.to,
        network: paymentResult.network
      } : null,
      metadata: aiResponse.metadata,
      logs: logs
    };

    console.log('[Playground] x402 AI demo completed successfully');
    res.json(result);

  } catch (error) {
    console.error('[Playground] x402 AI demo failed:', error);
    logs.push(`❌ Demo failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    
    res.status(500).json({
      error: 'x402 AI demo failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      logs: logs
    });
  }
});

export default router;
