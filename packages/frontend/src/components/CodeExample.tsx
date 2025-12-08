'use client';

import React, { useState } from 'react';

interface CodeExampleProps {
  title: string;
  language: string;
  code: string;
  description?: string;
}

function CodeBlock({ title, language, code, description }: CodeExampleProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-gray-50 px-4 py-3 border-b flex items-center justify-between">
        <div>
          <h4 className="font-medium text-gray-900">{title}</h4>
          {description && (
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          )}
        </div>
        <button
          onClick={copyToClipboard}
          className="flex items-center space-x-2 px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded-md text-sm font-medium transition-colors"
        >
          {copied ? (
            <>
              <span>✅</span>
              <span>Copied!</span>
            </>
          ) : (
            <>
              <span>📋</span>
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="relative">
        <pre className="p-4 overflow-x-auto text-sm bg-gray-900 text-gray-100">
          <code className={`language-${language}`}>{code}</code>
        </pre>
      </div>
    </div>
  );
}

export function CodeExample() {
  const [activeTab, setActiveTab] = useState('javascript');

  const examples = {
    javascript: {
      title: '🟨 JavaScript/TypeScript (Browser)',
      language: 'javascript',
      description: 'Use in React, Vue, Angular, or vanilla JavaScript applications',
      code: `// Install: npm install universal-agent-wallet
import { UniversalWallet } from 'universal-agent-wallet';

// Initialize wallet
const wallet = UniversalWallet.connect();

// Call any paid API with automatic payment handling
async function summarizeUrl(url) {
  try {
    const response = await wallet.callPaidAPI('http://localhost:3004/api/summarize', {
      method: 'POST',
      body: JSON.stringify({ url }),
      headers: { 'Content-Type': 'application/json' }
    });
    
    const result = await response.json();
    console.log('Summary:', result.data.summary);
    return result;
  } catch (error) {
    console.error('Payment or API call failed:', error);
  }
}

// With payment flow monitoring
async function summarizeWithStatus(text) {
  const result = await wallet.summarize(
    { text },
    (flow) => {
      console.log(\`Status: \${flow.status} - \${flow.message}\`);
      
      if (flow.status === 'payment_required') {
        console.log(\`Payment needed: \${flow.paymentDetails.amount}\`);
      }
      
      if (flow.status === 'completed') {
        console.log('Service completed successfully!');
      }
    },
    true // Use real payments
  );
  
  return result;
}

// Check wallet balance
const balance = await wallet.getBalance();
console.log(\`Wallet balance: \${balance} AVAX\`);`
    },

    nodejs: {
      title: '🟢 Node.js (Server-side)',
      language: 'javascript',
      description: 'Use in Express, Next.js API routes, or standalone Node.js scripts',
      code: `// Install: npm install universal-agent-wallet
const { UniversalWallet } = require('universal-agent-wallet');

// Initialize with private key (server-side)
const wallet = UniversalWallet.connect(process.env.PRIVATE_KEY);

async function callPaidService() {
  try {
    // Call paid API
    const response = await wallet.callPaidAPI('http://localhost:3004/api/summarize', {
      method: 'POST',
      body: JSON.stringify({
        url: 'https://en.wikipedia.org/wiki/Artificial_intelligence'
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('Summary received:', result.data.summary);
      return result;
    } else {
      console.error('API call failed:', response.status);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Direct payment
async function sendPayment() {
  const transaction = await wallet.pay(
    '0x742d35Cc6634C0532925a3b8D0C9e0C0C0C0C0C0', // receiver
    '0.001' // amount in AVAX
  );
  
  console.log('Payment sent:', transaction.hash);
  return transaction;
}

callPaidService();`
    },

    python: {
      title: '🐍 Python',
      language: 'python',
      description: 'Use with requests library for Python scripts and applications',
      code: `# Install: pip install universal-agent-wallet requests
import requests
import json
from universal_agent_wallet import UniversalWallet

# Initialize wallet
wallet = UniversalWallet.connect(private_key=os.getenv('PRIVATE_KEY'))

def call_paid_api(url, data=None):
    """Call a paid API with automatic x402 payment handling"""
    api_url = 'http://localhost:3004/api/summarize'
    
    # First request - will get 402 Payment Required
    response = requests.post(api_url, json=data or {'url': url})
    
    if response.status_code == 402:
        payment_info = response.json()
        print(f"Payment required: {payment_info['payment']['amount']}")
        
        # Sign payment
        payment_header = wallet.sign_payment(payment_info['payment'])
        
        # Retry with payment
        response = requests.post(
            api_url,
            json=data or {'url': url},
            headers={'x-payment': payment_header}
        )
    
    if response.status_code == 200:
        result = response.json()
        print(f"Summary: {result['data']['summary']}")
        return result
    else:
        print(f"Error: {response.status_code} - {response.text}")
        return None

# Example usage
result = call_paid_api('https://en.wikipedia.org/wiki/Machine_learning')

# Direct text summarization
result = call_paid_api(None, {
    'text': 'Your long text content here...'
})

# Check wallet balance
balance = wallet.get_balance()
print(f"Wallet balance: {balance} AVAX")`
    },

    curl: {
      title: '🌐 cURL (Command Line)',
      language: 'bash',
      description: 'Use from command line, shell scripts, or any HTTP client',
      code: `# Step 1: Try the API (will get 402 Payment Required)
curl -X POST http://localhost:3004/api/summarize \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://en.wikipedia.org/wiki/Artificial_intelligence"}'

# Response: 402 Payment Required
# {
#   "status": "payment_required",
#   "message": "Payment required to access this service",
#   "payment": {
#     "amount": "$0.02",
#     "currency": "AVAX",
#     "network": "avalanche-fuji",
#     "receiverAddress": "0x742d35Cc6634C0532925a3b8D0C9e0C0C0C0C0C0"
#   }
# }

# Step 2: Send payment and get signature (use wallet or script)
# PAYMENT_SIGNATURE=$(your_wallet_script sign_payment "$0.02" "avalanche-fuji")

# Step 3: Retry with payment header
curl -X POST http://localhost:3004/api/summarize \\
  -H "Content-Type: application/json" \\
  -H "x-payment: {\\"txHash\\":\\"0x123...\\",\\"from\\":\\"0xabc...\\",\\"to\\":\\"0x742d35...\\",\\"value\\":\\"$0.02\\",\\"network\\":\\"avalanche-fuji\\"}" \\
  -d '{"url": "https://en.wikipedia.org/wiki/Artificial_intelligence"}'

# For testing, you can use mock payment:
curl -X POST http://localhost:3004/api/summarize \\
  -H "Content-Type: application/json" \\
  -H "x-payment: mock-payment-signature" \\
  -d '{"text": "Artificial intelligence is the simulation of human intelligence..."}'

# Check service info
curl http://localhost:3004/api/info

# Check transaction logs
curl http://localhost:3004/api/transactions`
    },

    telegram: {
      title: '🤖 Telegram Bot',
      language: 'javascript',
      description: 'Integrate x402 payments into Telegram bots',
      code: `// Install: npm install node-telegram-bot-api universal-agent-wallet
const TelegramBot = require('node-telegram-bot-api');
const { UniversalWallet } = require('universal-agent-wallet');

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
const wallet = UniversalWallet.connect(process.env.BOT_PRIVATE_KEY);

// Handle /summarize command
bot.onText(/\\/summarize (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const url = match[1];
  
  try {
    // Send "processing" message
    await bot.sendMessage(chatId, '🔄 Processing your request...');
    
    // Call paid API
    const response = await wallet.callPaidAPI('http://localhost:3004/api/summarize', {
      method: 'POST',
      body: JSON.stringify({ url })
    });
    
    if (response.ok) {
      const result = await response.json();
      
      // Send summary
      await bot.sendMessage(chatId, \`📄 **Summary:**\\n\\n\${result.data.summary}\\n\\n💰 Payment: \${result.payment.amount} (tx: \${result.payment.txHash.slice(0, 10)}...)\`);
    } else {
      await bot.sendMessage(chatId, '❌ Failed to summarize content');
    }
  } catch (error) {
    console.error('Bot error:', error);
    await bot.sendMessage(chatId, \`❌ Error: \${error.message}\`);
  }
});

// Handle /balance command
bot.onText(/\\/balance/, async (msg) => {
  const chatId = msg.chat.id;
  
  try {
    const balance = await wallet.getBalance();
    const address = wallet.getAddress();
    
    await bot.sendMessage(chatId, \`💰 **Bot Wallet**\\n\\nAddress: \\\`\${address}\\\`\\nBalance: \${balance} AVAX\\nNetwork: avalanche-fuji\`);
  } catch (error) {
    await bot.sendMessage(chatId, \`❌ Error checking balance: \${error.message}\`);
  }
});

console.log('🤖 Telegram bot with x402 payments started!');`
    },

    claude: {
      title: '🤖 Claude MCP Server',
      language: 'typescript',
      description: 'Integrate x402 payments into Claude MCP servers',
      code: `// Install: npm install @modelcontextprotocol/sdk universal-agent-wallet
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { UniversalWallet } from 'universal-agent-wallet';

// Initialize wallet for MCP server
const wallet = UniversalWallet.connect(process.env.MCP_PRIVATE_KEY);

// Create MCP server
const server = new Server(
  {
    name: 'x402-summarizer',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Add paid summarization tool
server.setRequestHandler('tools/list', async () => {
  return {
    tools: [
      {
        name: 'summarize_url',
        description: 'Summarize content from a URL using x402 micropayments',
        inputSchema: {
          type: 'object',
          properties: {
            url: {
              type: 'string',
              description: 'URL to summarize'
            }
          },
          required: ['url']
        }
      }
    ]
  };
});

server.setRequestHandler('tools/call', async (request) => {
  if (request.params.name === 'summarize_url') {
    const { url } = request.params.arguments as { url: string };
    
    try {
      // Call paid API with automatic payment
      const response = await wallet.callPaidAPI('http://localhost:3004/api/summarize', {
        method: 'POST',
        body: JSON.stringify({ url })
      });
      
      if (response.ok) {
        const result = await response.json();
        
        return {
          content: [
            {
              type: 'text',
              text: \`Summary of \${url}:\\n\\n\${result.data.summary}\\n\\nPayment: \${result.payment.amount} (tx: \${result.payment.txHash})\`
            }
          ]
        };
      } else {
        throw new Error(\`API call failed: \${response.status}\`);
      }
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: \`Error summarizing URL: \${error.message}\`
          }
        ],
        isError: true
      };
    }
  }
  
  throw new Error(\`Unknown tool: \${request.params.name}\`);
});

// Start MCP server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('🤖 Claude MCP Server with x402 payments started!');
}

main().catch(console.error);`
    }
  };

  const tabs = [
    { id: 'javascript', label: '🟨 JavaScript', icon: '⚡' },
    { id: 'nodejs', label: '🟢 Node.js', icon: '🚀' },
    { id: 'python', label: '🐍 Python', icon: '🔥' },
    { id: 'curl', label: '🌐 cURL', icon: '💻' },
    { id: 'telegram', label: '🤖 Telegram', icon: '📱' },
    { id: 'claude', label: '🤖 Claude MCP', icon: '🧠' }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Integration Examples
        </h2>
        <p className="text-lg text-gray-600">
          Universal Agent Wallet works with any platform that can make HTTP requests
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 mb-6 p-1 bg-gray-100 rounded-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <span>{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.label.split(' ')[1] || tab.label}</span>
          </button>
        ))}
      </div>

      {/* Code Example */}
      <CodeBlock {...examples[activeTab as keyof typeof examples]} />

      {/* Features Grid */}
      <div className="mt-12 grid md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6">
          <div className="text-2xl mb-3">⚡</div>
          <h3 className="font-semibold text-gray-900 mb-2">Automatic Payment</h3>
          <p className="text-gray-600 text-sm">
            SDK automatically handles 402 responses, signs payments, and retries requests
          </p>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6">
          <div className="text-2xl mb-3">🔗</div>
          <h3 className="font-semibold text-gray-900 mb-2">Universal Compatibility</h3>
          <p className="text-gray-600 text-sm">
            Works with any HTTP client - JavaScript, Python, cURL, or custom implementations
          </p>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg p-6">
          <div className="text-2xl mb-3">💰</div>
          <h3 className="font-semibold text-gray-900 mb-2">Micropayments</h3>
          <p className="text-gray-600 text-sm">
            Pay only for what you use - $0.01-$0.05 per API call with Avalanche's low fees
          </p>
        </div>
      </div>

      {/* Quick Start */}
      <div className="mt-12 bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg p-8 text-white">
        <h3 className="text-2xl font-bold mb-4">🚀 Quick Start</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold mb-2">1. Install SDK</h4>
            <code className="bg-gray-700 px-3 py-1 rounded text-sm">
              npm install universal-agent-wallet
            </code>
          </div>
          <div>
            <h4 className="font-semibold mb-2">2. Start Using</h4>
            <code className="bg-gray-700 px-3 py-1 rounded text-sm">
              const wallet = UniversalWallet.connect()
            </code>
          </div>
        </div>
        <p className="mt-4 text-gray-300">
          That's it! The SDK handles wallet connection, payment signing, and API calls automatically.
        </p>
      </div>
    </div>
  );
}
