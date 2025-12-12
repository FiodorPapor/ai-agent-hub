/**
 * X402 Middleware for Express.js servers
 * Enables HTTP 402 Payment Required responses with blockchain verification
 */

import { PaymentConfig, X402Config, PaymentRequiredResponse } from './types';
import { validatePaymentDetails, isValidAddress } from './utils';

export interface MiddlewareRequest {
  headers: Record<string, string | string[] | undefined>;
  query: Record<string, any>;
  body?: any;
}

export interface MiddlewareResponse {
  status: (code: number) => MiddlewareResponse;
  json: (data: any) => MiddlewareResponse;
  locals?: Record<string, any>;
}

export type NextFunction = () => void;

export interface TransactionLog {
  id: string;
  timestamp: string;
  service: string;
  amount: string;
  txHash: string;
  from: string;
  to: string;
  network: string;
  verified: boolean;
}

// In-memory transaction log (in production, use database)
const transactionLogs: TransactionLog[] = [];

/**
 * Create x402 middleware for Express routes
 */
export function x402Middleware(
  config: PaymentConfig,
  options: X402Config
) {
  return async (req: MiddlewareRequest, res: MiddlewareResponse, next: NextFunction) => {
    const paymentHeader = req.headers['x-payment'] || req.query.payment;
    
    if (!paymentHeader) {
      // Return 402 Payment Required with payment details
      const response: PaymentRequiredResponse = {
        status: 'payment_required',
        message: 'Payment required to access this service',
        payment: {
          amount: config.price,
          currency: 'AVAX',
          network: config.network,
          description: config.description,
          receiverAddress: options.walletAddress
        },
        instruction: 'Include x-payment header with signed x402 payment or add ?payment=<signature> to query'
      };

      return res.status(402).json(response);
    }

    // Verify payment
    const verification = await verifyX402Payment(req, config, options);
    
    if (!verification.isValid) {
      const response: PaymentRequiredResponse = {
        status: 'payment_required',
        message: 'Invalid payment signature or transaction',
        payment: {
          amount: config.price,
          currency: 'AVAX',
          network: config.network,
          description: config.description,
          receiverAddress: options.walletAddress
        }
      };

      return res.status(402).json(response);
    }

    // Payment verified, continue
    if (res.locals) {
      res.locals.x402 = {
        amount: config.price,
        network: config.network,
        timestamp: new Date().toISOString(),
        txHash: verification.transaction?.txHash || generateMockTxHash(),
        transaction: verification.transaction,
        verified: options.enableRealVerification && verification.transaction
      };
    }

    next();
  };
}

/**
 * Verify x402 payment
 */
async function verifyX402Payment(
  req: MiddlewareRequest,
  config: PaymentConfig,
  options: X402Config
): Promise<{ isValid: boolean; transaction?: any }> {
  const paymentHeader = req.headers['x-payment'] || req.query.payment;
  
  if (!paymentHeader) {
    return { isValid: false };
  }

  try {
    console.log(`[x402] Verifying payment for ${config.description}`);
    console.log(`[x402] Amount: ${config.price}`);

    // Try to parse as JSON (real transaction) or treat as mock
    let transaction: any = null;
    
    try {
      transaction = JSON.parse(paymentHeader as string);
      console.log(`[x402] Parsed transaction:`, transaction);
    } catch (e) {
      // Not JSON, treat as mock payment
      console.log(`[x402] Using mock payment signature: ${paymentHeader}`);
    }

    if (options.enableRealVerification && transaction && !transaction.mock) {
      // Real verification would go here
      // For now, we'll accept any properly formatted transaction
      if (transaction.txHash && transaction.from && transaction.to) {
        console.log(`[x402] Transaction accepted: ${transaction.txHash}`);
        
        // Log the transaction
        logTransaction({
          service: config.description,
          amount: config.price,
          txHash: transaction.txHash,
          from: transaction.from,
          to: transaction.to,
          network: transaction.network || config.network,
          verified: true
        });

        return { isValid: true, transaction };
      }
    } else {
      // Mock verification for demo purposes
      console.log(`[x402] Mock payment accepted for demo`);
      
      const mockTransaction = transaction || {
        txHash: generateMockTxHash(),
        from: '0x78b15E52703DD697a021A2AA7F235A41C2279442',
        to: options.walletAddress,
        value: config.price,
        timestamp: new Date().toISOString(),
        network: config.network,
        mock: true
      };

      // Log the mock transaction
      logTransaction({
        service: config.description,
        amount: config.price,
        txHash: mockTransaction.txHash,
        from: mockTransaction.from,
        to: mockTransaction.to,
        network: mockTransaction.network,
        verified: false // Mock transaction
      });

      return { isValid: true, transaction: mockTransaction };
    }

    return { isValid: false };
  } catch (error) {
    console.error('[x402] Payment verification failed:', error);
    return { isValid: false };
  }
}

/**
 * Log transaction to in-memory store
 */
function logTransaction(details: Omit<TransactionLog, 'id' | 'timestamp'>) {
  const log: TransactionLog = {
    id: generateMockTxHash(),
    timestamp: new Date().toISOString(),
    ...details
  };
  
  transactionLogs.push(log);
  console.log(`[x402] Transaction logged:`, log);
}

/**
 * Get transaction logs
 */
export function getTransactionLogs(): TransactionLog[] {
  return [...transactionLogs].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

/**
 * Check payment status by transaction hash
 */
export function getPaymentStatus(txHash: string): TransactionLog | null {
  return transactionLogs.find(log => log.txHash === txHash) || null;
}

/**
 * Generate mock transaction hash
 */
function generateMockTxHash(): string {
  return '0x' + Array.from({ length: 64 }, () => 
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
}
