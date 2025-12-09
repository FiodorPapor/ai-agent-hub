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
  enableRealVerification?: boolean;
}

interface PaymentTransaction {
  txHash: string;
  from: string;
  to: string;
  value: string;
  timestamp: string;
  network: string;
}

interface TransactionLog {
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

// Enhanced x402 payment verification with real signature support
export async function verifyX402Payment(
  req: Request,
  config: PaymentConfig,
  options: X402Options
): Promise<{ isValid: boolean; transaction?: PaymentTransaction }> {
  // Check for x402 payment header
  const paymentHeader = req.headers['x-payment'] || req.query.payment;
  
  if (!paymentHeader) {
    return { isValid: false };
  }

  try {
    console.log(`[x402] Verifying payment for ${config.description}`);
    console.log(`[x402] Amount: ${config.price}`);

    // Try to parse as JSON (real transaction) or treat as mock
    let transaction: PaymentTransaction | null = null;
    
    try {
      transaction = JSON.parse(paymentHeader as string);
      console.log(`[x402] Parsed transaction:`, transaction);
    } catch (e) {
      // Not JSON, treat as mock payment
      console.log(`[x402] Using mock payment signature: ${paymentHeader}`);
    }

    if (options.enableRealVerification && transaction) {
      // Real verification: check transaction on blockchain
      try {
        const provider = new ethers.JsonRpcProvider(
          transaction.network === 'avalanche-fuji' 
            ? 'https://api.avax-test.network/ext/bc/C/rpc'
            : 'https://api.avax.network/ext/bc/C/rpc'
        );

        const txReceipt = await provider.getTransactionReceipt(transaction.txHash);
        
        if (!txReceipt) {
          console.log(`[x402] Transaction not found: ${transaction.txHash}`);
          return { isValid: false };
        }

        // Verify transaction details
        const isValidAmount = ethers.parseEther(transaction.value).toString() === 
                             ethers.parseEther(priceToEther(config.price)).toString();
        const isValidReceiver = txReceipt.to?.toLowerCase() === options.walletAddress.toLowerCase();
        const isValidSender = txReceipt.from?.toLowerCase() === transaction.from.toLowerCase();

        if (isValidAmount && isValidReceiver && isValidSender) {
          console.log(`[x402] Real transaction verified: ${transaction.txHash}`);
          
          // Log the transaction
          logTransaction({
            service: config.description,
            amount: config.price,
            txHash: transaction.txHash,
            from: transaction.from,
            to: transaction.to,
            network: transaction.network,
            verified: true
          });

          return { isValid: true, transaction };
        } else {
          console.log(`[x402] Transaction verification failed - invalid details`);
          return { isValid: false };
        }
      } catch (error) {
        console.error(`[x402] Blockchain verification failed:`, error);
        return { isValid: false };
      }
    } else {
      // Mock verification for demo purposes
      console.log(`[x402] Mock payment accepted for demo`);
      
      const mockTransaction: PaymentTransaction = transaction || {
        txHash: generateMockTxHash(),
        from: '0x78b15E52703DD697a021A2AA7F235A41C2279442',
        to: options.walletAddress,
        value: priceToEther(config.price),
        timestamp: new Date().toISOString(),
        network: config.network
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
  } catch (error) {
    console.error('[x402] Payment verification failed:', error);
    return { isValid: false };
  }
}

// Convert price string like "$0.02" to ether amount
function priceToEther(price: string): string {
  const numericPrice = parseFloat(price.replace('$', ''));
  return (numericPrice / 1000).toString(); // Assuming 1 AVAX = $1000 for demo
}

// Log transaction to in-memory store
function logTransaction(details: Omit<TransactionLog, 'id' | 'timestamp'>) {
  const log: TransactionLog = {
    id: generateMockTxHash(),
    timestamp: new Date().toISOString(),
    ...details
  };
  
  transactionLogs.push(log);
  console.log(`[x402] Transaction logged:`, log);
}

// Get transaction logs (for API endpoint)
export function getTransactionLogs(): TransactionLog[] {
  return [...transactionLogs].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

// Check payment status by transaction hash
export function getPaymentStatus(txHash: string): TransactionLog | null {
  return transactionLogs.find(log => log.txHash === txHash) || null;
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
          currency: 'AVAX',
          network: config.network,
          description: config.description,
          facilitator: options.facilitatorUrl,
          receiverAddress: options.walletAddress
        },
        instruction: 'Include x-payment header with signed x402 payment or add ?payment=<signature> to query'
      });
    }

    // Verify payment
    const verification = await verifyX402Payment(req, config, options);
    
    if (!verification.isValid) {
      return res.status(402).json({
        status: 'payment_invalid',
        message: 'Invalid payment signature or transaction',
        payment: {
          amount: config.price,
          currency: 'AVAX',
          network: config.network,
          description: config.description,
          receiverAddress: options.walletAddress
        }
      });
    }

    // Payment verified, continue
    res.locals.x402 = {
      amount: config.price,
      network: config.network,
      timestamp: new Date().toISOString(),
      txHash: verification.transaction?.txHash || generateMockTxHash(),
      transaction: verification.transaction,
      verified: options.enableRealVerification && verification.transaction
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
