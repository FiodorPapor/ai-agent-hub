'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import PaymentFlow from '@/components/PaymentFlow';
import X402Client, { PaymentFlow as PaymentFlowType } from '@/lib/x402Client';
import { ArrowLeft, Send } from 'lucide-react';

const agentConfigs: Record<string, any> = {
  research: {
    name: 'Research Agent',
    description: 'Find relevant articles and resources',
    price: '$0.02',
    inputLabel: 'Search Query',
    inputPlaceholder: 'e.g., x402 avalanche, AI agents, blockchain',
    inputType: 'text',
  },
  summary: {
    name: 'Summary Agent',
    description: 'Summarize text or URLs',
    price: '$0.01',
    inputLabel: 'Text to Summarize',
    inputPlaceholder: 'Paste your text here...',
    inputType: 'textarea',
  },
  translate: {
    name: 'Translation Agent',
    description: 'Translate text to target language',
    price: '$0.01',
    inputLabel: 'Text to Translate',
    inputPlaceholder: 'Enter text to translate...',
    inputType: 'textarea',
    secondaryInput: {
      label: 'Target Language',
      placeholder: 'e.g., Spanish, French, German, Japanese',
      type: 'text',
    },
  },
  'code-review': {
    name: 'Code Review Agent',
    description: 'Review code and provide feedback',
    price: '$0.05',
    inputLabel: 'Code to Review',
    inputPlaceholder: 'Paste your code here...',
    inputType: 'textarea',
  },
};

export default function AgentPage() {
  const params = useParams();
  const agentId = params.id as string;
  const config = agentConfigs[agentId];

  const [input, setInput] = useState('');
  const [secondaryInput, setSecondaryInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentFlow, setPaymentFlow] = useState<PaymentFlowType>({
    status: 'idle',
    message: 'Ready to execute',
  });

  if (!config) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-dark via-darker to-dark flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Agent not found</h1>
          <Link href="/" className="text-blue-400 hover:text-blue-300">
            ← Back to catalog
          </Link>
        </div>
      </div>
    );
  }

  const handleExecute = async () => {
    if (!input.trim()) {
      setPaymentFlow({
        status: 'error',
        message: 'Please provide input',
        error: 'Input is required',
      });
      return;
    }

    setLoading(true);
    const client = new X402Client();

    try {
      const params: Record<string, any> = {};

      if (agentId === 'research') {
        params.query = input;
      } else if (agentId === 'summary') {
        params.text = input;
      } else if (agentId === 'translate') {
        params.text = input;
        params.targetLanguage = secondaryInput || 'Spanish';
      } else if (agentId === 'code-review') {
        params.code = input;
      }

      await client.callAgent(agentId, params, (flow) => {
        setPaymentFlow(flow);
      });
    } catch (error: any) {
      console.error('Error calling agent:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-dark via-darker to-dark">
      {/* Navigation */}
      <nav className="border-b border-slate-700/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            Back to Catalog
          </Link>
          <h1 className="text-xl font-bold text-white">{config.name}</h1>
          <div className="text-sm text-slate-400">
            Price: <span className="text-green-400 font-semibold">{config.price}</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">{config.name}</h2>
              <p className="text-slate-400">{config.description}</p>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700/50 space-y-6">
              {/* Primary Input */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {config.inputLabel}
                </label>
                {config.inputType === 'textarea' ? (
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={config.inputPlaceholder}
                    disabled={loading}
                    className="w-full h-32 bg-slate-900/50 border border-slate-600 rounded-lg p-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                ) : (
                  <input
                    type={config.inputType}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={config.inputPlaceholder}
                    disabled={loading}
                    className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                )}
              </div>

              {/* Secondary Input (for translate) */}
              {config.secondaryInput && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    {config.secondaryInput.label}
                  </label>
                  <input
                    type={config.secondaryInput.type}
                    value={secondaryInput}
                    onChange={(e) => setSecondaryInput(e.target.value)}
                    placeholder={config.secondaryInput.placeholder}
                    disabled={loading}
                    className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              )}

              {/* Execute Button */}
              <button
                onClick={handleExecute}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:from-slate-600 disabled:to-slate-600 text-white font-semibold py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Execute & Pay {config.price}
                  </>
                )}
              </button>

              {/* Info Box */}
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <p className="text-sm text-blue-300">
                  <span className="font-semibold">How it works:</span> Click the button above to request the service. 
                  You'll be prompted to sign an x402 payment transaction. After confirmation, the agent will process your request.
                </p>
              </div>
            </div>
          </div>

          {/* Payment Flow Section */}
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Payment & Execution</h3>
              <p className="text-slate-400">Real-time x402 payment flow</p>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700/50">
              <PaymentFlow flow={paymentFlow} />
            </div>

            {/* Transaction Info */}
            {paymentFlow.result?.payment && (
              <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700/50">
                <h4 className="text-sm font-semibold text-slate-300 mb-3">Transaction Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">TX Hash:</span>
                    <code className="text-green-400 font-mono text-xs break-all">
                      {paymentFlow.result.payment.txHash}
                    </code>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Timestamp:</span>
                    <span className="text-white font-mono">
                      {new Date(paymentFlow.result.payment.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
