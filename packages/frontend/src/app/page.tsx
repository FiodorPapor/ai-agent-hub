'use client';

import { useState } from 'react';

export default function Home() {
  const [demoStatus, setDemoStatus] = useState('idle');
  const [result, setResult] = useState('');

  const runDemo = async () => {
    setDemoStatus('loading');
    setResult('');
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setDemoStatus('payment');
    
    // Simulate payment
    await new Promise(resolve => setTimeout(resolve, 1500));
    setDemoStatus('success');
    setResult('Summary: Universal Agent Wallet enables seamless x402 micropayments for any AI system on Avalanche.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      {/* Header */}
      <header className="border-b border-gray-700 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              💰
            </div>
            <h1 className="text-xl font-bold">Universal Agent Wallet</h1>
          </div>
          <a href="https://github.com/FiodorPapor/ai-agent-hub" className="text-gray-400 hover:text-white">
            GitHub
          </a>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-8">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-block bg-green-500/10 text-green-400 px-4 py-2 rounded-full text-sm mb-4">
            ⚡ x402 Payment Infrastructure
          </div>
          <h2 className="text-5xl font-bold mb-4">Universal Agent Wallet</h2>
          <p className="text-xl text-gray-300 mb-2">Payment layer for ANY AI system</p>
          <p className="text-gray-400 max-w-2xl mx-auto">
            One SDK to add x402 micropayments to Claude MCP, Telegram bots, Python scripts, 
            n8n workflows, or any HTTP client.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gray-800 p-6 rounded-lg text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">1</div>
            <p className="text-gray-300">Universal SDK</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">6+</div>
            <p className="text-gray-300">Platforms</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">$0.01</div>
            <p className="text-gray-300">Min Payment</p>
          </div>
        </div>

        {/* Demo */}
        <div className="bg-gray-800 rounded-xl p-8 mb-12">
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
            🌐 Live Demo
          </h3>
          
          <div className="space-y-4">
            <div className="bg-gray-900 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-2">Request:</p>
              <code className="text-green-400">POST /api/summarize {"{"} url: "https://example.com" {"}"}</code>
            </div>

            <button
              onClick={runDemo}
              disabled={demoStatus === 'loading' || demoStatus === 'payment'}
              className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              {demoStatus === 'idle' && 'Run Demo →'}
              {demoStatus === 'loading' && 'Calling API...'}
              {demoStatus === 'payment' && 'Processing Payment ($0.02)...'}
              {demoStatus === 'success' && '✅ Complete!'}
            </button>

            {/* Status */}
            <div className="space-y-2">
              <div className={`flex items-center gap-2 ${demoStatus !== 'idle' ? 'text-green-400' : 'text-gray-500'}`}>
                <div className={`w-2 h-2 rounded-full ${demoStatus !== 'idle' ? 'bg-green-400' : 'bg-gray-500'}`} />
                1. Send request to paid API
              </div>
              <div className={`flex items-center gap-2 ${demoStatus === 'payment' || demoStatus === 'success' ? 'text-yellow-400' : 'text-gray-500'}`}>
                <div className={`w-2 h-2 rounded-full ${demoStatus === 'payment' || demoStatus === 'success' ? 'bg-yellow-400' : 'bg-gray-500'}`} />
                2. Receive 402 Payment Required
              </div>
              <div className={`flex items-center gap-2 ${demoStatus === 'success' ? 'text-green-400' : 'text-gray-500'}`}>
                <div className={`w-2 h-2 rounded-full ${demoStatus === 'success' ? 'bg-green-400' : 'bg-gray-500'}`} />
                3. SDK auto-pays & retries → Success!
              </div>
            </div>

            {result && (
              <div className="bg-gray-900 rounded-lg p-4 border border-green-500/30">
                <p className="text-gray-400 text-sm mb-2">Result:</p>
                <p className="text-white">{result}</p>
              </div>
            )}
          </div>
        </div>

        {/* Code Examples */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
            💻 Integration Examples
          </h3>
          
          <div className="grid gap-4">
            <div className="bg-gray-800 rounded-lg p-4">
              <p className="text-blue-400 text-sm mb-2">JavaScript / Node.js</p>
              <pre className="text-gray-300 text-sm overflow-x-auto">
{`const wallet = UniversalWallet.connect();
const result = await wallet.callPaidAPI('/api/summarize', {
  method: 'POST',
  body: JSON.stringify({ url: 'https://example.com' })
});`}
              </pre>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4">
              <p className="text-yellow-400 text-sm mb-2">Python</p>
              <pre className="text-gray-300 text-sm overflow-x-auto">
{`wallet = UniversalWallet.connect()
result = wallet.call_paid_api('/api/summarize', 
  json={'text': 'Content to summarize'})`}
              </pre>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4">
              <p className="text-green-400 text-sm mb-2">cURL</p>
              <pre className="text-gray-300 text-sm overflow-x-auto">
{`curl -X POST http://localhost:3004/api/summarize \\
  -H "x-payment: <signed-payment>" \\
  -d '{"url": "https://example.com"}'`}
              </pre>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-700 bg-gray-900 p-8 text-center">
        <p className="text-gray-400">
          Built for Hack2Build x402 Payments on Avalanche
        </p>
      </footer>
    </div>
  );
}
