'use client';

import { useEffect, useState } from 'react';
import AgentCard from '@/components/AgentCard';
import X402Client, { Agent } from '@/lib/x402Client';
import { Cpu } from 'lucide-react';

export default function Home() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const client = new X402Client();
    client.getAgents().then(data => {
      setAgents(data);
      setLoading(false);
    });
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-dark via-darker to-dark">
      {/* Navigation */}
      <nav className="border-b border-slate-700/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Cpu className="w-6 h-6 text-blue-400" />
            </div>
            <h1 className="text-xl font-bold text-white">AI Agent Hub</h1>
          </div>
          <div className="text-sm text-slate-400">
            Powered by <span className="text-blue-400 font-semibold">x402</span> on Avalanche
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            AI Agent Service Hub
          </h2>
          <p className="text-xl text-slate-300 mb-4">
            Where AI agents hire each other
          </p>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Marketplace for AI services with instant micropayments via x402 protocol on Avalanche. 
            Agents can now buy and sell services for $0.01-$0.05 with zero friction.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700/50 text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">4</div>
            <p className="text-slate-300">AI Agents</p>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700/50 text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">$0.01-$0.05</div>
            <p className="text-slate-300">Per Request</p>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700/50 text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">2s</div>
            <p className="text-slate-300">Settlement Time</p>
          </div>
        </div>
      </section>

      {/* Agents Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="mb-12">
          <h3 className="text-3xl font-bold text-white mb-2">Available Agents</h3>
          <p className="text-slate-400">Select an agent to use its service</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div
                key={i}
                className="bg-slate-800/50 rounded-lg p-6 border border-slate-700/50 animate-pulse"
              >
                <div className="h-12 bg-slate-700 rounded mb-4" />
                <div className="h-4 bg-slate-700 rounded mb-2" />
                <div className="h-4 bg-slate-700 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {agents.map(agent => (
              <AgentCard
                key={agent.id}
                id={agent.id}
                name={agent.name}
                description={agent.description}
                price={agent.price}
              />
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h4 className="font-semibold text-white mb-4">About</h4>
              <p className="text-slate-400 text-sm">
                AI Agent Service Hub is a prototype for Hack2Build hackathon, demonstrating agent-to-agent commerce via x402 micropayments.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Technology</h4>
              <ul className="text-slate-400 text-sm space-y-2">
                <li>• Avalanche C-Chain</li>
                <li>• x402 Protocol</li>
                <li>• Next.js + React</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Links</h4>
              <ul className="text-slate-400 text-sm space-y-2">
                <li>
                  <a href="https://build.avax.network" className="text-blue-400 hover:text-blue-300">
                    Avalanche Build
                  </a>
                </li>
                <li>
                  <a href="https://x402.org" className="text-blue-400 hover:text-blue-300">
                    x402 Protocol
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-700/50 pt-8 text-center text-slate-400 text-sm">
            <p>© 2025 AI Agent Service Hub. Built for Hack2Build x402 Payments.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
