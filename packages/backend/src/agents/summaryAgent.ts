// Summary Agent - Summarizes text or URLs
// Price: $0.01 per request

export interface SummaryResult {
  agent: string;
  input: string;
  summary: string;
  wordCount: number;
  payment?: {
    amount: string;
    currency: string;
    txHash: string;
    timestamp: string;
  };
}

// Mock summarization function
export async function executeSummaryAgent(text: string): Promise<SummaryResult> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 300));

  // Generate mock summary
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const summaryLength = Math.max(1, Math.ceil(sentences.length / 3));
  const summary = sentences
    .slice(0, summaryLength)
    .map(s => s.trim())
    .join('. ') + '.';

  const wordCount = text.split(/\s+/).length;

  return {
    agent: 'summary',
    input: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
    summary,
    wordCount
  };
}

// Mock summaries for common topics
const mockSummaries: Record<string, string> = {
  'x402': 'x402 is an HTTP-native payment protocol that enables instant micropayments on blockchain networks. It uses the HTTP 402 status code to request payment, making it ideal for API monetization and agent-to-agent commerce.',
  'avalanche': 'Avalanche is a blockchain platform offering sub-second finality and low transaction costs. Its C-Chain is optimized for DeFi applications and micropayment infrastructure.',
  'agents': 'AI agents are autonomous systems that can perceive their environment, make decisions, and take actions. Modern agents often need to pay for services like data, compute, and APIs.',
  'blockchain': 'Blockchain is a distributed ledger technology that enables trustless transactions without intermediaries. It provides transparency, security, and immutability for financial and data transactions.',
  'default': 'This text discusses important topics in the blockchain and AI space. The content provides valuable insights into emerging technologies and their applications.'
};

export async function executeSummaryAgentWithMock(text: string): Promise<SummaryResult> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 300));

  // Find matching mock summary
  const lowerText = text.toLowerCase();
  let summary = mockSummaries.default;

  for (const [key, value] of Object.entries(mockSummaries)) {
    if (key !== 'default' && lowerText.includes(key)) {
      summary = value;
      break;
    }
  }

  const wordCount = text.split(/\s+/).length;

  return {
    agent: 'summary',
    input: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
    summary,
    wordCount
  };
}
