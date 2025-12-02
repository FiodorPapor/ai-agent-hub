'use client';

import { CheckCircle, Clock, AlertCircle, Loader } from 'lucide-react';
import { PaymentFlow as PaymentFlowType } from '@/lib/x402Client';

interface PaymentFlowProps {
  flow: PaymentFlowType;
}

export default function PaymentFlow({ flow }: PaymentFlowProps) {
  const steps = [
    { id: 'requesting', label: 'Requesting...', icon: Clock },
    { id: 'payment_required', label: 'Payment Required', icon: AlertCircle },
    { id: 'signing', label: 'Signing Transaction', icon: Loader },
    { id: 'confirmed', label: 'Payment Confirmed', icon: CheckCircle },
    { id: 'completed', label: 'Result Received', icon: CheckCircle },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === flow.status);

  return (
    <div className="w-full space-y-6">
      {/* Status message */}
      <div className={`p-4 rounded-lg border ${
        flow.status === 'error'
          ? 'bg-red-500/10 border-red-500/30 text-red-300'
          : flow.status === 'completed'
          ? 'bg-green-500/10 border-green-500/30 text-green-300'
          : 'bg-blue-500/10 border-blue-500/30 text-blue-300'
      }`}>
        <p className="font-medium">{flow.message}</p>
      </div>

      {/* Payment details */}
      {flow.paymentDetails && (
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <h4 className="text-sm font-semibold text-slate-300 mb-3">Payment Details</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Amount:</span>
              <span className="text-white font-mono">{flow.paymentDetails.amount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Currency:</span>
              <span className="text-white font-mono">{flow.paymentDetails.currency}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Network:</span>
              <span className="text-white font-mono">{flow.paymentDetails.network}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Description:</span>
              <span className="text-white text-right max-w-xs">{flow.paymentDetails.description}</span>
            </div>
          </div>
        </div>
      )}

      {/* Progress steps */}
      <div className="space-y-3">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === currentStepIndex;
          const isCompleted = index < currentStepIndex;

          return (
            <div
              key={step.id}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                isCompleted
                  ? 'bg-green-500/10 border-green-500/30'
                  : isActive
                  ? 'bg-blue-500/10 border-blue-500/30 animate-pulse-glow'
                  : 'bg-slate-800/30 border-slate-700/30'
              }`}
            >
              <Icon
                className={`w-5 h-5 flex-shrink-0 ${
                  isCompleted
                    ? 'text-green-400'
                    : isActive && step.icon === Loader
                    ? 'text-blue-400 animate-spin'
                    : isActive
                    ? 'text-blue-400'
                    : 'text-slate-500'
                }`}
              />
              <span
                className={`text-sm font-medium ${
                  isCompleted
                    ? 'text-green-300'
                    : isActive
                    ? 'text-blue-300'
                    : 'text-slate-400'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Result */}
      {flow.result && (
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <h4 className="text-sm font-semibold text-slate-300 mb-3">Result</h4>
          <pre className="text-xs text-slate-300 overflow-auto max-h-64 bg-slate-900/50 p-3 rounded border border-slate-700">
            {JSON.stringify(flow.result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
