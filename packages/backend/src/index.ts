import express from 'express';
import cors from 'cors';
import apiRouter from './routes/api';
import walletRouter from './routes/wallet';

const app = express();
const PORT = process.env.PORT || 3004;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api', apiRouter);
app.use('/wallet', walletRouter);

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

app.get('/api/agents', (req, res) => {
  res.status(410).json({
    error: 'Endpoint deprecated',
    message: 'This service has been refactored to Universal Agent Wallet. Use /api/info for current endpoints.',
    migration: {
      old: '/agents/*',
      new: '/api/summarize',
      documentation: '/api/info'
    }
  });
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
  console.log(`📊 Health: http://localhost:${PORT}/api/health`);
  console.log(`📋 API Info: http://localhost:${PORT}/api/info`);
  console.log(`💰 Wallet API: http://localhost:${PORT}/wallet/info`);
  console.log(`🔧 Demo Endpoint: POST http://localhost:${PORT}/api/summarize`);
});
