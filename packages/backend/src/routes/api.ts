import { Router, Request, Response } from 'express';
import { x402Middleware, getTransactionLogs, getPaymentStatus } from '../middleware/x402';

const router: Router = Router();

// x402 configuration
const X402_CONFIG = {
  facilitatorUrl: process.env.FACILITATOR_URL || 'https://facilitator.universal-wallet.dev',
  walletAddress: process.env.WALLET_ADDRESS || '0x78b15E52703DD697a021A2AA7F235A41C2279442',
  enableRealVerification: process.env.NODE_ENV === 'production'
};

/**
 * POST /api/agent-call
 * Generic agent-to-agent call endpoint (paid endpoint - configurable price)
 */
router.post('/agent-call', 
  x402Middleware(
    {
      price: '$0.01',
      network: 'avalanche-fuji',
      description: 'Agent-to-Agent Service Call'
    },
    X402_CONFIG
  ),
  async (req: Request, res: Response) => {
    try {
      const { action, payload } = req.body;
      
      console.log(`[API] Agent call - Action: ${action}`);

      // This is where agents would implement their logic
      // For now, return a success response with payment info
      const response = {
        success: true,
        data: {
          action,
          payload,
          result: 'Agent service executed successfully',
          timestamp: new Date().toISOString()
        },
        payment: res.locals.x402,
        service: 'Universal Agent Wallet - Agent Service'
      };

      res.json(response);
    } catch (error: any) {
      console.error('[API] Agent call failed:', error);
      res.status(400).json({
        success: false,
        error: error.message,
        service: 'Universal Agent Wallet - Agent Service'
      });
    }
  }
);

/**
 * GET /api/info
 * Get service information (free endpoint)
 */
router.get('/info', (req: Request, res: Response) => {
  res.json({
    service: 'Universal Agent Wallet',
    version: '1.0.0',
    description: 'Universal payment infrastructure for AI agents using x402 micropayments on Avalanche',
    network: 'avalanche-fuji',
    concept: 'Enables agents to charge for services, pay other agents, and create autonomous economic interactions',
    endpoints: [
      {
        path: '/api/agent-call',
        method: 'POST',
        price: '$0.01',
        description: 'Generic agent-to-agent service call with x402 payment',
        parameters: {
          action: 'string - Action to perform',
          payload: 'object - Data for the action'
        }
      }
    ],
    payment: {
      currency: 'AVAX',
      network: 'avalanche-fuji',
      receiverAddress: X402_CONFIG.walletAddress,
      protocol: 'x402 (HTTP 402 Payment Required)'
    },
    examples: {
      curl: `curl -X POST ${req.protocol}://${req.get('host')}/api/agent-call \\
  -H "Content-Type: application/json" \\
  -d '{"action": "process_data", "payload": {"data": "example"}}'`,
      
      javascript: `const wallet = new UniversalWallet();
const response = await wallet.callPaidAPI('${req.protocol}://${req.get('host')}/api/agent-call', {
  method: 'POST',
  body: JSON.stringify({ action: 'process_data', payload: { data: 'example' } })
});`,
      
      python: `import requests
response = requests.post('${req.protocol}://${req.get('host')}/api/agent-call', 
  json={'action': 'process_data', 'payload': {'data': 'example'}})`
    }
  });
});

/**
 * GET /api/transactions
 * Get transaction logs (free endpoint for debugging)
 */
router.get('/transactions', (req: Request, res: Response) => {
  const logs = getTransactionLogs();
  res.json({
    success: true,
    count: logs.length,
    transactions: logs
  });
});

/**
 * GET /api/payment-status/:txHash
 * Check payment status by transaction hash
 */
router.get('/payment-status/:txHash', (req: Request, res: Response) => {
  const { txHash } = req.params;
  const status = getPaymentStatus(txHash);
  
  if (status) {
    res.json({
      success: true,
      status: 'found',
      transaction: status
    });
  } else {
    res.status(404).json({
      success: false,
      status: 'not_found',
      message: 'Transaction not found in payment logs'
    });
  }
});

/**
 * GET /api/health
 * Health check endpoint
 */
router.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Universal Agent Wallet',
    version: '1.0.0'
  });
});

export default router;
