import { Router, Request, Response } from 'express';
import { UniversalWallet } from '../sdk/UniversalWallet';

const router: Router = Router();

// Demo wallet instance (in production, use user-specific wallets)
let demoWallet: UniversalWallet | null = null;

/**
 * POST /wallet/connect
 * Connect or create a wallet
 */
router.post('/connect', async (req: Request, res: Response) => {
  try {
    const { privateKey } = req.body;
    
    if (privateKey) {
      // Connect with existing private key
      demoWallet = UniversalWallet.connect(privateKey);
    } else {
      // Create new demo wallet
      demoWallet = UniversalWallet.connect();
    }

    const address = demoWallet.getAddress();
    const balance = await demoWallet.getBalance();

    res.json({
      success: true,
      wallet: {
        address,
        balance,
        network: demoWallet.getNetwork()
      },
      message: privateKey ? 'Wallet connected' : 'Demo wallet created'
    });
  } catch (error: any) {
    console.error('[Wallet API] Connection failed:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /wallet/balance
 * Get wallet balance
 */
router.get('/balance', async (req: Request, res: Response) => {
  try {
    if (!demoWallet) {
      return res.status(400).json({
        success: false,
        error: 'No wallet connected. Use POST /wallet/connect first.'
      });
    }

    const balance = await demoWallet.getBalance();
    const address = demoWallet.getAddress();

    res.json({
      success: true,
      wallet: {
        address,
        balance,
        network: demoWallet.getNetwork()
      }
    });
  } catch (error: any) {
    console.error('[Wallet API] Balance check failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /wallet/pay
 * Send payment to address
 */
router.post('/pay', async (req: Request, res: Response) => {
  try {
    if (!demoWallet) {
      return res.status(400).json({
        success: false,
        error: 'No wallet connected. Use POST /wallet/connect first.'
      });
    }

    const { to, amount } = req.body;

    if (!to || !amount) {
      return res.status(400).json({
        success: false,
        error: 'Both "to" address and "amount" are required'
      });
    }

    // Check if wallet can afford the payment
    const canAfford = await demoWallet.canAfford(amount);
    if (!canAfford) {
      const balance = await demoWallet.getBalance();
      return res.status(400).json({
        success: false,
        error: `Insufficient balance. Available: ${balance} AVAX, Required: ${amount} AVAX`
      });
    }

    // Send payment
    const transaction = await demoWallet.pay(to, amount);

    res.json({
      success: true,
      transaction,
      message: `Payment of ${amount} AVAX sent to ${to}`
    });
  } catch (error: any) {
    console.error('[Wallet API] Payment failed:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /wallet/call-paid-api
 * Call a paid API using the wallet
 */
router.post('/call-paid-api', async (req: Request, res: Response) => {
  try {
    if (!demoWallet) {
      return res.status(400).json({
        success: false,
        error: 'No wallet connected. Use POST /wallet/connect first.'
      });
    }

    const { url, method = 'GET', body } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'URL is required'
      });
    }

    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (body && method !== 'GET') {
      options.body = JSON.stringify(body);
    }

    // Call the paid API
    const response = await demoWallet.callPaidAPI(url, options);
    const result = await response.json();

    res.json({
      success: true,
      status: response.status,
      data: result,
      message: 'Paid API call completed'
    });
  } catch (error: any) {
    console.error('[Wallet API] Paid API call failed:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /wallet/estimate-gas
 * Estimate gas cost for a transaction
 */
router.post('/estimate-gas', async (req: Request, res: Response) => {
  try {
    if (!demoWallet) {
      return res.status(400).json({
        success: false,
        error: 'No wallet connected. Use POST /wallet/connect first.'
      });
    }

    const { to, amount } = req.body;

    if (!to || !amount) {
      return res.status(400).json({
        success: false,
        error: 'Both "to" address and "amount" are required'
      });
    }

    const gasCost = await demoWallet.estimateGasCost(to, amount);

    res.json({
      success: true,
      estimate: {
        gasCost,
        totalCost: (parseFloat(amount) + parseFloat(gasCost)).toString(),
        currency: 'AVAX'
      }
    });
  } catch (error: any) {
    console.error('[Wallet API] Gas estimation failed:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /wallet/info
 * Get wallet information
 */
router.get('/info', async (req: Request, res: Response) => {
  try {
    if (!demoWallet) {
      return res.json({
        success: true,
        connected: false,
        message: 'No wallet connected'
      });
    }

    const address = demoWallet.getAddress();
    const balance = await demoWallet.getBalance();
    const network = demoWallet.getNetwork();

    res.json({
      success: true,
      connected: true,
      wallet: {
        address,
        balance,
        network
      }
    });
  } catch (error: any) {
    console.error('[Wallet API] Info retrieval failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
