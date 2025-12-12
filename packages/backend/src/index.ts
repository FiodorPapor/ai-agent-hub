import { config } from 'dotenv';
import path from 'path';

// Load environment variables from .env file
config({ path: path.resolve(__dirname, '../../../.env') });

import express from 'express';
import cors from 'cors';
import apiRouter from './routes/api';
import walletRouter from './routes/wallet';
import playgroundRouter from './routes/playground';
import x402AgentBRouter from './routes/x402AgentB';
import summarizeRouter from './routes/summarize';

const app = express();
const PORT = process.env.PORT || 3004;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://127.0.0.1:55395'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Routes
app.use('/api', apiRouter);
app.use('/wallet', walletRouter);
app.use('/x402/agent-b', x402AgentBRouter);
app.use('/x402', summarizeRouter);

// Playground API routes (before static files)
app.use('/playground', playgroundRouter);

// Serve static files for playground UI
app.use('/playground', express.static(path.join(__dirname, '../playground-ui')));

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'Universal Agent Wallet',
    version: '1.0.0',
    description: 'Universal payment layer for AI agents and tools',
    network: 'avalanche-fuji',
    endpoints: {
      api: '/api',
      wallet: '/wallet',
      playground: '/playground',
      health: '/api/health',
      info: '/api/info'
    },
    documentation: {
      swagger: '/docs',
      examples: '/api/info'
    },
    sdk: {
      javascript: 'npm install universal-agent-wallet',
      python: 'pip install universal-agent-wallet',
      curl: 'See /api/info for examples'
    }
  });
});

// Backward compatibility - redirect old endpoints
app.get('/health', (req, res) => {
  res.redirect(301, '/api/health');
});


// Error handling middleware
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message,
    service: 'Universal Agent Wallet'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not found',
    message: `Endpoint ${req.method} ${req.path} not found`,
    service: 'Universal Agent Wallet',
    availableEndpoints: [
      'GET /',
      'GET /api/info',
      'GET /api/health',
      'POST /api/summarize',
      'POST /wallet/connect',
      'GET /wallet/balance'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Universal Agent Wallet Backend running on port ${PORT}`);
  console.log(`🌐 Service: http://localhost:${PORT}`);
  console.log(`🎮 Playground: http://localhost:${PORT}/playground`);
  console.log(`📊 Health: http://localhost:${PORT}/api/health`);
  console.log(`📋 API Info: http://localhost:${PORT}/api/info`);
  console.log(`💰 Wallet API: http://localhost:${PORT}/wallet/info`);
  console.log(`🔧 Demo Endpoint: POST http://localhost:${PORT}/api/summarize`);
});
