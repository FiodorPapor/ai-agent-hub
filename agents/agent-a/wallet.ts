/**
 * Agent A Wallet Helper
 */

import { AvalancheWallet } from '../../wallet-service';

/**
 * Create Agent A's wallet using environment variable
 */
export function createAgentAWallet(): AvalancheWallet {
  const privateKey = process.env.AGENT_A_PRIVATE_KEY;
  
  if (!privateKey) {
    throw new Error(
      'AGENT_A_PRIVATE_KEY is not set. Please add it to your .env file.\n' +
      'Example: AGENT_A_PRIVATE_KEY=0x1234567890abcdef...'
    );
  }

  if (!privateKey.startsWith('0x') || privateKey.length !== 66) {
    throw new Error(
      'AGENT_A_PRIVATE_KEY must be a valid 64-character hex string starting with 0x.\n' +
      'Example: AGENT_A_PRIVATE_KEY=0x1234567890abcdef...'
    );
  }

  try {
    return new AvalancheWallet(privateKey);
  } catch (error) {
    throw new Error(
      `Failed to create Agent A wallet: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
