import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createAgentRoutes } from './routes/agents';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.BACKEND_PORT || 3001;
const WALLET_ADDRESS = process.env.WALLET_ADDRESS || '0x0000000000000000000000000000000000000000';
const FACILITATOR_URL = process.env.X402_FACILITATOR_URL || 'https://facilitator.ultravioletadao.xyz';

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '0.1.0'
  });
});

// API info
app.get('/api/info', (req, res) => {
  res.json({
    name: 'AI Agent Service Hub',
    version: '0.1.0',
    description: 'Marketplace where AI agents sell services via x402 micropayments on Avalanche',
    agents: [
      {
        id: 'research',
        name: 'Research Agent',
        description: 'Find relevant articles and resources',
        price: '$0.02',
        endpoint: 'GET /agents/research?query=...'
      },
      {
        id: 'summary',
        name: 'Summary Agent',
        description: 'Summarize text or URLs',
        price: '$0.01',
        endpoint: 'POST /agents/summary'
      },
      {
        id: 'translate',
        name: 'Translation Agent',
        description: 'Translate text to target language',
        price: '$0.01',
        endpoint: 'POST /agents/translate'
      },
      {
        id: 'code-review',
        name: 'Code Review Agent',
        description: 'Review code and provide feedback',
        price: '$0.05',
        endpoint: 'POST /agents/code-review'
      }
    ],
    network: 'avalanche-fuji',
    facilitator: FACILITATOR_URL,
    receiverAddress: WALLET_ADDRESS
  });
});

// Agent routes
app.use('/agents', createAgentRoutes(WALLET_ADDRESS, FACILITATOR_URL));

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path,
    method: req.method
  });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 AI Agent Service Hub backend running on http://localhost:${PORT}`);
  console.log(`📡 x402 Facilitator: ${FACILITATOR_URL}`);
  console.log(`💰 Receiver Address: ${WALLET_ADDRESS}`);
  console.log(`🌐 Network: avalanche-fuji`);
  console.log(`\n📚 API Documentation: http://localhost:${PORT}/api/info`);
});
