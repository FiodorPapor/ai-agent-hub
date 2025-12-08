import { Router, Request, Response } from 'express';
import { x402Middleware, getTransactionLogs, getPaymentStatus } from '../middleware/x402';
import { summarizeContent, validateSummarizeRequest } from '../services/summarizer';

const router: Router = Router();

// x402 configuration
const X402_CONFIG = {
  facilitatorUrl: process.env.FACILITATOR_URL || 'https://facilitator.universal-wallet.dev',
  walletAddress: process.env.WALLET_ADDRESS || '0x742d35Cc6634C0532925a3b8D0C9e0C0C0C0C0C0',
  enableRealVerification: process.env.NODE_ENV === 'production'
};

/**
 * POST /api/summarize
 * Summarize URL content or text (paid endpoint - $0.02)
 */
router.post('/summarize', 
  x402Middleware(
    {
      price: '$0.02',
      network: 'avalanche-fuji',
      description: 'Text/URL Summarization Service'
    },
    X402_CONFIG
  ),
  async (req: Request, res: Response) => {
    try {
      // Validate request
      const request = validateSummarizeRequest(req.body);
      
      console.log(`[API] Summarizing ${request.url ? 'URL' : 'text'}:`, 
        request.url || `${request.text?.substring(0, 100)}...`);

      // Perform summarization
      const result = await summarizeContent(request);

      // Include payment info in response
      const response = {
        success: true,
        data: result,
        payment: res.locals.x402,
        service: 'Universal Agent Wallet - Summarization'
      };

      res.json(response);
    } catch (error: any) {
      console.error('[API] Summarization failed:', error);
      res.status(400).json({
        success: false,
        error: error.message,
        service: 'Universal Agent Wallet - Summarization'
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
    description: 'Universal payment layer for AI agents and tools',
    network: 'avalanche-fuji',
    endpoints: [
      {
        path: '/api/summarize',
        method: 'POST',
        price: '$0.02',
        description: 'Summarize URL content or text',
        parameters: {
          url: 'string (optional) - URL to summarize',
          text: 'string (optional) - Text to summarize'
        }
      }
    ],
    payment: {
      currency: 'AVAX',
      network: 'avalanche-fuji',
      receiverAddress: X402_CONFIG.walletAddress
    },
    examples: {
      curl: `curl -X POST ${req.protocol}://${req.get('host')}/api/summarize \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://example.com"}'`,
      
      javascript: `const wallet = new UniversalWallet();
const response = await wallet.callPaidAPI('${req.protocol}://${req.get('host')}/api/summarize', {
  method: 'POST',
  body: JSON.stringify({ url: 'https://example.com' })
});`,
      
      python: `import requests
response = requests.post('${req.protocol}://${req.get('host')}/api/summarize', 
  json={'url': 'https://example.com'})`
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
