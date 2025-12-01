'use client';

import { Zap, Code, Globe, BookOpen, Cpu } from 'lucide-react';
import Link from 'next/link';

interface AgentCardProps {
  id: string;
  name: string;
  description: string;
  price: string;
}

const iconMap: Record<string, React.ReactNode> = {
  research: <BookOpen className="w-8 h-8" />,
  summary: <Zap className="w-8 h-8" />,
  translate: <Globe className="w-8 h-8" />,
  'code-review': <Code className="w-8 h-8" />,
};

export default function AgentCard({ id, name, description, price }: AgentCardProps) {
  return (
    <Link href={`/agents/${id}`}>
      <div className="group h-full bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-6 border border-slate-700 hover:border-blue-500 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-blue-500/20 hover:-translate-y-1">
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400 group-hover:bg-blue-500/20 transition-colors">
            {iconMap[id] || <Cpu className="w-8 h-8" />}
          </div>
          <span className="text-sm font-semibold text-green-400 bg-green-500/10 px-3 py-1 rounded-full">
            {price}
          </span>
        </div>

        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">
          {name}
        </h3>

        <p className="text-slate-400 text-sm mb-4 line-clamp-2">
          {description}
        </p>

        <div className="flex items-center text-blue-400 text-sm font-medium group-hover:text-blue-300">
          Use Agent
          <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
        </div>
      </div>
    </Link>
  );
}
