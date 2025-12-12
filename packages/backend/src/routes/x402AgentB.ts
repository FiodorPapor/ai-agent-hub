/**
 * x402-protected AI microservice endpoints (Agent B side)
 * Demonstrates HTTP 402 Payment Required for AI services
 */

import { Router, Request, Response } from 'express';
import { x402Middleware } from '../middleware/x402';

const router: Router = Router();

/**
 * GET /x402/agent-b/ai-answer
 * x402-protected AI answer service
 */
router.get('/ai-answer', 
  // Apply x402 payment protection
  x402Middleware(
    {
      price: '0.001', // 0.001 AVAX for AI answer
      network: 'avalanche-fuji',
      description: 'AI Answer Microservice'
    },
    {
      facilitatorUrl: process.env.X402_FACILITATOR_URL || 'https://facilitator.ultravioletadao.xyz',
      walletAddress: process.env.AGENT_B_ADDRESS || getAgentBAddress(),
      enableRealVerification: false // Use mock for demo
    }
  ),
  async (req: Request, res: Response) => {
    try {
      const question = req.query.question as string || '¿Qué es la economía de agentes en Avalanche?';
      
      console.log(`[x402 AI] Processing question: ${question}`);
      console.log(`[x402 AI] Payment verified:`, res.locals.x402);

      // Simulate AI processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Generate AI response based on question
      const aiAnswer = generateAIAnswer(question);

      const response = {
        answer: aiAnswer,
        question: question,
        metadata: {
          provider: 'Agent B',
          model: 'demo-microservice',
          network: 'Avalanche Fuji',
          payment: res.locals.x402
        }
      };

      console.log(`[x402 AI] Returning AI answer for payment: ${res.locals.x402?.txHash}`);
      res.json(response);

    } catch (error) {
      console.error('[x402 AI] Error processing AI request:', error);
      res.status(500).json({
        error: 'AI processing failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * Generate AI answer based on question (simulated)
 */
function generateAIAnswer(question: string): string {
  const responses = {
    'economia': 'La economía de agentes en Avalanche permite que los agentes de IA realicen transacciones autónomas usando AVAX, creando un ecosistema donde los servicios de IA pueden monetizarse directamente a través de micropagos en blockchain.',
    'avalanche': 'Avalanche es una plataforma blockchain de alta velocidad que soporta contratos inteligentes y permite transacciones rápidas y económicas, ideal para micropagos entre agentes de IA.',
    'x402': 'El protocolo x402 extiende HTTP con un código de estado "402 Payment Required", permitiendo que los servicios web soliciten pagos automáticamente antes de proporcionar acceso a recursos.',
    'ai': 'Los agentes de IA pueden usar x402 para monetizar sus servicios automáticamente, creando una economía donde el conocimiento y procesamiento tienen valor directo en blockchain.',
    'payment': 'Los pagos x402 en Avalanche son instantáneos y de bajo costo, permitiendo micropagos eficientes entre servicios de IA sin intermediarios.',
    'default': 'Esta es una respuesta de ejemplo de un microservicio de IA protegido por x402 en Avalanche Fuji. El sistema permite pagos automáticos entre agentes para acceder a servicios de inteligencia artificial.'
  };

  const lowerQuestion = question.toLowerCase();
  
  for (const [keyword, response] of Object.entries(responses)) {
    if (keyword !== 'default' && lowerQuestion.includes(keyword)) {
      return response;
    }
  }
  
  return responses.default;
}

/**
 * Get Agent B address from environment or derive from private key
 */
function getAgentBAddress(): string {
  const agentBKey = process.env.AGENT_B_PRIVATE_KEY;
  if (agentBKey) {
    try {
      const { ethers } = require('ethers');
      const wallet = new ethers.Wallet(agentBKey);
      return wallet.address;
    } catch (error) {
      console.error('[x402 AI] Failed to derive Agent B address:', error);
    }
  }
  
  // Fallback address
  return '0x7e935568f082Cbf0728d9ded54218e665634076a';
}

export default router;
