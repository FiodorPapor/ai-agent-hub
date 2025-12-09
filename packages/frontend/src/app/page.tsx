'use client';

import React, { useState } from 'react';

export default function HomePage() {
  const [demoStatus, setDemoStatus] = useState<'idle' | 'loading' | 'payment' | 'success'>('idle');
  const [result, setResult] = useState<string | null>(null);

  const runDemo = async () => {
    setDemoStatus('loading');
    setResult(null);

    // Simulate API call that returns 402
    await new Promise(resolve => setTimeout(resolve, 800));
    setDemoStatus('payment');

    // Simulate payment
    await new Promise(resolve => setTimeout(resolve, 1200));
    setDemoStatus('success');
    setResult('Summary: Universal Agent Wallet enables any AI system to accept and send micropayments via x402 protocol on Avalanche.');
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Navigation */}
      <nav className="border-b border-slate-700/50 backdrop-blur-sm sticky top-0 z-50 bg-slate-900/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <span className="text-green-400 text-xl">💰</span>
            </div>
            <h1 className="text-xl font-bold text-white">Universal Agent Wallet</h1>
          </div>
          <a 
            href="https://github.com/FiodorPapor/ai-agent-hub" 
            target="_blank"
            className="text-slate-400 hover:text-white transition-colors"
          >
            GitHub
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-green-500/10 text-green-400 px-4 py-2 rounded-full text-sm mb-6">
            <span>⚡</span>
            x402 Payment Infrastructure
          </div>
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Universal Agent Wallet
          </h2>
          <p className="text-xl text-slate-300 mb-4">
            Payment layer for ANY AI system
          </p>
          <p className="text-slate-400 max-w-2xl mx-auto">
            One SDK to add x402 micropayments to Claude MCP, Telegram bots, Python scripts, 
            n8n workflows, or any HTTP client. Automatic 402 handling, instant settlements on Avalanche.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700/50 text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">1</div>
            <p className="text-slate-300">Universal SDK</p>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700/50 text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">6+</div>
            <p className="text-slate-300">Platforms Supported</p>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700/50 text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">$0.01</div>
            <p className="text-slate-300">Min Payment</p>
          </div>
        </div>
      </section>

      {/* Interactive Demo */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="bg-slate-800/50 rounded-xl p-8 border border-slate-700/50">
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <span className="text-green-400">🌐</span>
            Live Demo
          </h3>
          
          <div className="space-y-4">
            <div className="bg-slate-900 rounded-lg p-4">
              <p className="text-slate-400 text-sm mb-2">Request:</p>
              <code className="text-green-400">POST /api/summarize {"{"} url: "https://x402.org" {"}"}</code>
            </div>

            <button
              onClick={runDemo}
              disabled={demoStatus === 'loading' || demoStatus === 'payment'}
              className="w-full bg-green-500 hover:bg-green-600 disabled:bg-slate-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {demoStatus === 'idle' && <>Run Demo <span>→</span></>}
              {demoStatus === 'loading' && 'Calling API...'}
              {demoStatus === 'payment' && 'Processing Payment ($0.02)...'}
              {demoStatus === 'success' && <><span>✅</span> Complete!</>}
            </button>

            {/* Status Steps */}
            <div className="space-y-2">
              <div className={`flex items-center gap-2 ${demoStatus !== 'idle' ? 'text-green-400' : 'text-slate-500'}`}>
                <div className={`w-2 h-2 rounded-full ${demoStatus !== 'idle' ? 'bg-green-400' : 'bg-slate-500'}`} />
                1. Send request to paid API
              </div>
              <div className={`flex items-center gap-2 ${demoStatus === 'payment' || demoStatus === 'success' ? 'text-yellow-400' : 'text-slate-500'}`}>
                <div className={`w-2 h-2 rounded-full ${demoStatus === 'payment' || demoStatus === 'success' ? 'bg-yellow-400' : 'bg-slate-500'}`} />
                2. Receive 402 Payment Required
              </div>
              <div className={`flex items-center gap-2 ${demoStatus === 'success' ? 'text-green-400' : 'text-slate-500'}`}>
                <div className={`w-2 h-2 rounded-full ${demoStatus === 'success' ? 'bg-green-400' : 'bg-slate-500'}`} />
                3. SDK auto-pays & retries → Success!
              </div>
            </div>

            {result && (
              <div className="bg-slate-900 rounded-lg p-4 border border-green-500/30">
                <p className="text-slate-400 text-sm mb-2">Result:</p>
                <p className="text-white">{result}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Code Examples */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <span className="text-blue-400">💻</span>
          Integration Examples
        </h3>
        
        <div className="grid gap-4">
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
            <p className="text-blue-400 text-sm mb-2">JavaScript / Node.js</p>
            <pre className="text-slate-300 text-sm overflow-x-auto">
{`const wallet = UniversalWallet.connect();
const result = await wallet.callPaidAPI('/api/summarize', {
  method: 'POST',
  body: JSON.stringify({ url: 'https://example.com' })
});`}
            </pre>
          </div>
          
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
            <p className="text-yellow-400 text-sm mb-2">Python</p>
            <pre className="text-slate-300 text-sm overflow-x-auto">
{`wallet = UniversalWallet.connect()
result = wallet.call_paid_api('/api/summarize', 
  json={'text': 'Content to summarize'})`}
            </pre>
          </div>
          
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
            <p className="text-green-400 text-sm mb-2">cURL</p>
            <pre className="text-slate-300 text-sm overflow-x-auto">
{`curl -X POST http://localhost:3004/api/summarize \\
  -H "x-payment: <signed-payment>" \\
  -d '{"url": "https://example.com"}'`}
            </pre>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700/50 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <p className="text-slate-400 text-sm">
            Built for Hack2Build x402 Payments on Avalanche
          </p>
        </div>
      </footer>
    </main>
  );
}
