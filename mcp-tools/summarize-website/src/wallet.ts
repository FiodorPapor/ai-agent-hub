import { ethers } from "ethers";

// Avalanche Fuji Testnet
const FUJI_RPC = "https://api.avax-test.network/ext/bc/C/rpc";
const FUJI_CHAIN_ID = 43113;

// USDC contract on Fuji (или native AVAX для простоты)
const USDC_ADDRESS = "0x5425890298aed601595a70AB815c96711a31Bc65"; // Fuji USDC

export interface PaymentResult {
  success: boolean;
  txHash?: string;
  error?: string;
  from?: string;
  to?: string;
  amount?: string;
}

export class X402Wallet {
  private wallet: ethers.Wallet;
  private provider: ethers.JsonRpcProvider;

  constructor(privateKey: string) {
    this.provider = new ethers.JsonRpcProvider(FUJI_RPC);
    this.wallet = new ethers.Wallet(privateKey, this.provider);
  }

  getAddress(): string {
    return this.wallet.address;
  }

  async getBalance(): Promise<string> {
    const balance = await this.provider.getBalance(this.wallet.address);
    return ethers.formatEther(balance);
  }

  // Парсинг цены из строки типа "$0.02"
  parsePrice(priceString: string): bigint {
    // Убираем $ и конвертируем в число
    const price = parseFloat(priceString.replace("$", ""));
    // Конвертируем в wei (предполагаем 1 AVAX ≈ $50 для тестнета)
    // Для демо: $0.02 ≈ 0.0004 AVAX
    const avaxAmount = price / 50;
    return ethers.parseEther(avaxAmount.toFixed(18));
  }

  async pay(to: string, priceString: string): Promise<PaymentResult> {
    try {
      const value = this.parsePrice(priceString);
      
      console.error(`[Wallet] Sending ${ethers.formatEther(value)} AVAX to ${to}`);
      
      const tx = await this.wallet.sendTransaction({
        to: to,
        value: value,
        chainId: FUJI_CHAIN_ID,
      });

      console.error(`[Wallet] Transaction sent: ${tx.hash}`);
      
      // Ждём подтверждения
      const receipt = await tx.wait(1);
      
      if (!receipt) {
        throw new Error("Transaction failed - no receipt");
      }

      console.error(`[Wallet] Transaction confirmed in block ${receipt.blockNumber}`);

      return {
        success: true,
        txHash: tx.hash,
        from: this.wallet.address,
        to: to,
        amount: priceString,
      };
    } catch (error: any) {
      console.error(`[Wallet] Payment error: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Создание подписанного payment header для x402
  async createPaymentHeader(paymentDetails: {
    amount: string;
    receiverAddress: string;
    description?: string;
  }): Promise<string> {
    // Выполняем реальный платёж
    const paymentResult = await this.pay(
      paymentDetails.receiverAddress,
      paymentDetails.amount
    );

    if (!paymentResult.success) {
      throw new Error(`Payment failed: ${paymentResult.error}`);
    }

    // Возвращаем JSON с данными транзакции
    return JSON.stringify({
      txHash: paymentResult.txHash,
      from: paymentResult.from,
      to: paymentResult.to,
      amount: paymentResult.amount,
      network: "avalanche-fuji",
      chainId: FUJI_CHAIN_ID,
      timestamp: Date.now(),
    });
  }
}
