// Type declarations for local modules

declare module '../../../../../wallet-service' {
  export class AvalancheWallet {
    constructor(privateKey: string);
    static createRandom(): AvalancheWallet;
    getAddress(): string;
    getBalance(): Promise<string>;
    sendNative(to: string, amount: string): Promise<string>;
    getPrivateKey(): string;
  }
}

declare module '../../../../../agents/agent-a' {
  export class AgentA {
    constructor();
    getName(): string;
    getAddress(): Promise<string>;
    getBalance(): Promise<string>;
    pay(toAddress: string, amount: string): Promise<string>;
  }
}

declare module '../../../../../agents/agent-b' {
  export class AgentB {
    constructor();
    getName(): string;
    getAddress(): Promise<string>;
    getBalance(): Promise<string>;
  }
}

declare module '../../../../../demo/config' {
  export const DEFAULT_PAYMENT_AMOUNT: string;
  export function formatAvaxDisplay(amount: string): string;
  export function getExplorerUrl(txHash: string): string;
}
