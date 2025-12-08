'use client';

import React, { useState, useEffect } from 'react';
import { UniversalWallet, PaymentFlow } from '../lib/universalWallet';
import { RobustWalletButton } from './RobustWalletButton';

interface DemoState {
  wallet: UniversalWallet | null;
  paymentFlow: PaymentFlow | null;
  result: any | null;
  loading: boolean;
  error: string | null;
  inputUrl: string;
  inputText: string;
  inputMode: 'url' | 'text';
  useRealPayment: boolean;
}

export function WalletDemo() {
  const [state, setState] = useState<DemoState>({
    wallet: null,
    paymentFlow: null,
    result: null,
    loading: false,
    error: null,
    inputUrl: 'https://en.wikipedia.org/wiki/Artificial_intelligence',
    inputText: 'Artificial intelligence (AI) is intelligence demonstrated by machines, in contrast to natural intelligence displayed by humans and animals. Leading AI textbooks define the field as the study of "intelligent agents": any device that perceives its environment and takes actions that maximize its chance of successfully achieving its goals. Colloquially, the term "artificial intelligence" is often used to describe machines that mimic "cognitive" functions that humans associate with the human mind, such as "learning" and "problem solving".',
    inputMode: 'url',
    useRealPayment: false
  });

  useEffect(() => {
    // Initialize wallet
    const wallet = UniversalWallet.connect();
    setState(prev => ({ ...prev, wallet }));
  }, []);

  const handleSummarize = async () => {
    if (!state.wallet) return;

    setState(prev => ({ 
      ...prev, 
      loading: true, 
      error: null, 
      result: null, 
      paymentFlow: null 
    }));

    try {
      const input = state.inputMode === 'url' 
        ? { url: state.inputUrl }
        : { text: state.inputText };

      const result = await state.wallet.summarize(
        input,
        (flow: PaymentFlow) => {
          setState(prev => ({ ...prev, paymentFlow: flow }));
        },
        state.useRealPayment
      );

      setState(prev => ({ 
        ...prev, 
        result, 
        loading: false,
        paymentFlow: null
      }));
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        error: error.message, 
        loading: false,
        paymentFlow: null
      }));
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'wallet_check': return '🔍';
      case 'requesting': return '📡';
      case 'payment_required': return '💳';
      case 'signing': return '✍️';
      case 'confirmed': return '✅';
      case 'completed': return '🎉';
      case 'error': return '❌';
      default: return '⏳';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'payment_required': return 'text-orange-600';
      case 'confirmed': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Universal Agent Wallet Demo
        </h2>
        <p className="text-lg text-gray-600">
          Experience seamless x402 micropayments for AI services
        </p>
      </div>

      {/* Wallet Connection */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4">1. Connect Your Wallet</h3>
        <RobustWalletButton />
      </div>

      {/* Payment Mode Toggle */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4">2. Payment Mode</h3>
        <div className="flex items-center space-x-4">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={state.useRealPayment}
              onChange={(e) => setState(prev => ({ 
                ...prev, 
                useRealPayment: e.target.checked 
              }))}
              className="sr-only"
            />
            <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              state.useRealPayment ? 'bg-blue-600' : 'bg-orange-400'
            }`}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                state.useRealPayment ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </div>
            <span className="ml-3 text-sm font-medium text-gray-700">
              {state.useRealPayment ? '🔗 Real Payments' : '🎭 Mock Payments'}
            </span>
          </label>
          <span className="text-sm text-gray-500">
            ({state.useRealPayment ? 'Uses actual blockchain transactions' : 'Demo mode for testing'})
          </span>
        </div>
      </div>

      {/* Input Selection */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4">3. Choose Input</h3>
        
        <div className="flex space-x-4 mb-4">
          <button
            onClick={() => setState(prev => ({ ...prev, inputMode: 'url' }))}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              state.inputMode === 'url'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            📄 Summarize URL
          </button>
          <button
            onClick={() => setState(prev => ({ ...prev, inputMode: 'text' }))}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              state.inputMode === 'text'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            📝 Summarize Text
          </button>
        </div>

        {state.inputMode === 'url' ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL to Summarize
            </label>
            <input
              type="url"
              value={state.inputUrl}
              onChange={(e) => setState(prev => ({ ...prev, inputUrl: e.target.value }))}
              placeholder="https://example.com/article"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Text to Summarize
            </label>
            <textarea
              value={state.inputText}
              onChange={(e) => setState(prev => ({ ...prev, inputText: e.target.value }))}
              placeholder="Enter the text you want to summarize..."
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
      </div>

      {/* Action Button */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4">4. Execute Paid Service</h3>
        <button
          onClick={handleSummarize}
          disabled={state.loading || !state.wallet}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          {state.loading ? 'Processing...' : '💰 Summarize with x402 Payment ($0.02)'}
        </button>
      </div>

      {/* Payment Flow Status */}
      {state.paymentFlow && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4">Payment Flow Status</h3>
          <div className="space-y-3">
            <div className={`flex items-center space-x-3 ${getStatusColor(state.paymentFlow.status)}`}>
              <span className="text-2xl">{getStatusIcon(state.paymentFlow.status)}</span>
              <span className="font-medium capitalize">{state.paymentFlow.status.replace('_', ' ')}</span>
            </div>
            <p className="text-gray-700">{state.paymentFlow.message}</p>
            
            {state.paymentFlow.paymentDetails && (
              <div className="bg-gray-50 rounded-md p-3 mt-3">
                <p className="text-sm text-gray-600">
                  <strong>Amount:</strong> {state.paymentFlow.paymentDetails.amount} {state.paymentFlow.paymentDetails.currency}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Service:</strong> {state.paymentFlow.paymentDetails.description}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Network:</strong> {state.paymentFlow.paymentDetails.network}
                </p>
              </div>
            )}

            {state.paymentFlow.transaction && (
              <div className="bg-blue-50 rounded-md p-3 mt-3">
                <p className="text-sm text-blue-800">
                  <strong>Transaction:</strong> {state.paymentFlow.transaction.hash}
                </p>
                <p className="text-sm text-blue-800">
                  <strong>Amount:</strong> {state.paymentFlow.transaction.value} AVAX
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Results */}
      {state.result && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4">✅ Summarization Result</h3>
          <div className="space-y-4">
            <div className="bg-green-50 rounded-md p-4">
              <h4 className="font-medium text-green-800 mb-2">Summary</h4>
              <p className="text-green-700">{state.result.data.summary}</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="bg-gray-50 rounded-md p-3">
                <p className="font-medium text-gray-700">Original Length</p>
                <p className="text-gray-600">{state.result.data.originalLength} chars</p>
              </div>
              <div className="bg-gray-50 rounded-md p-3">
                <p className="font-medium text-gray-700">Summary Length</p>
                <p className="text-gray-600">{state.result.data.summaryLength} chars</p>
              </div>
              <div className="bg-gray-50 rounded-md p-3">
                <p className="font-medium text-gray-700">Compression</p>
                <p className="text-gray-600">{Math.round((1 - state.result.data.compressionRatio) * 100)}%</p>
              </div>
              <div className="bg-gray-50 rounded-md p-3">
                <p className="font-medium text-gray-700">Source</p>
                <p className="text-gray-600">{state.result.data.source}</p>
              </div>
            </div>

            {state.result.payment && (
              <div className="bg-blue-50 rounded-md p-3">
                <p className="text-sm text-blue-800">
                  <strong>Payment Confirmed:</strong> {state.result.payment.txHash}
                </p>
                <p className="text-sm text-blue-800">
                  <strong>Amount:</strong> {state.result.payment.amount}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error Display */}
      {state.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-red-500 text-xl mr-3">❌</span>
            <div>
              <h4 className="text-red-800 font-medium">Error</h4>
              <p className="text-red-700">{state.error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
