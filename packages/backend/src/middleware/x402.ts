import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { ethers } from 'ethers';

interface PaymentConfig {
  price: string; // e.g., "$0.02"
  network: string;
  description: string;
}

interface X402Options {
  facilitatorUrl: string;
  walletAddress: string;
  walletPrivateKey?: string;
}

// Mock x402 payment verification
// In production, this would verify signatures with the facilitator
export async function verifyX402Payment(
  req: Request,
  config: PaymentConfig,
  options: X402Options
): Promise<boolean> {
  // Check for x402 payment header
  const paymentHeader = req.headers['x-payment'] || req.query.payment;
  
  if (!paymentHeader) {
    return false;
  }

  // In a real implementation, verify the payment signature with the facilitator
  // For now, we'll accept any payment header as valid for demo purposes
  try {
    // Simulate payment verification
    console.log(`[x402] Verifying payment for ${config.description}`);
    console.log(`[x402] Amount: ${config.price}`);
    
    // In production:
    // const verified = await axios.post(`${options.facilitatorUrl}/verify`, {
    //   signature: paymentHeader,
    //   amount: config.price,
    //   network: config.network
    // });
    
    return true;
  } catch (error) {
    console.error('[x402] Payment verification failed:', error);
    return false;
  }
}

// Middleware factory for x402 payment protection
export function x402Middleware(
  config: PaymentConfig,
  options: X402Options
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const paymentHeader = req.headers['x-payment'] || req.query.payment;
    
    if (!paymentHeader) {
      // Return 402 Payment Required with payment details
      return res.status(402).json({
        status: 'payment_required',
        message: 'Payment required to access this service',
        payment: {
          amount: config.price,
          currency: 'USDC',
          network: config.network,
          description: config.description,
          facilitator: options.facilitatorUrl,
          receiverAddress: options.walletAddress
        },
        instruction: 'Include x-payment header with signed x402 payment or add ?payment=<signature> to query'
      });
    }

    // Verify payment
    const isValid = await verifyX402Payment(req, config, options);
    
    if (!isValid) {
      return res.status(402).json({
        status: 'payment_invalid',
        message: 'Invalid payment signature',
        payment: {
          amount: config.price,
          currency: 'USDC',
          network: config.network
        }
      });
    }

    // Payment verified, continue
    res.locals.x402 = {
      amount: config.price,
      network: config.network,
      timestamp: new Date().toISOString(),
      txHash: `0x${Math.random().toString(16).slice(2)}` // Mock tx hash
    };

    next();
  };
}

// Generate mock transaction hash for demo
export function generateMockTxHash(): string {
  return '0x' + Array.from({ length: 64 }, () => 
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
}
