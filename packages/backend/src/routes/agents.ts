import { Router, Request, Response } from 'express';
import { x402Middleware, generateMockTxHash } from '../middleware/x402';
import { executeResearchAgent } from '../agents/researchAgent';
import { executeSummaryAgentWithMock } from '../agents/summaryAgent';
import { executeTranslateAgent } from '../agents/translateAgent';
import { executeCodeReviewAgent } from '../agents/codeReviewAgent';

export function createAgentRoutes(
  walletAddress: string,
  facilitatorUrl: string
): Router {
  const router = Router();

  // Research Agent - $0.02 per request
  router.get(
    '/research',
    x402Middleware(
      {
        price: '$0.02',
        network: 'avalanche-fuji',
        description: 'AI Research Agent - find relevant articles'
      },
      { walletAddress, facilitatorUrl }
    ),
    async (req: Request, res: Response) => {
      try {
        const query = req.query.query as string;
        if (!query) {
          return res.status(400).json({ error: 'query parameter is required' });
        }

        const result = await executeResearchAgent(query);

        // Add payment info from middleware
        if (res.locals.x402) {
          result.payment = {
            amount: res.locals.x402.amount,
            currency: 'USDC',
            txHash: res.locals.x402.txHash,
            timestamp: res.locals.x402.timestamp
          };
        }

        res.json(result);
      } catch (error) {
        console.error('Research agent error:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  );

  // Summary Agent - $0.01 per request
  router.post(
    '/summary',
    x402Middleware(
      {
        price: '$0.01',
        network: 'avalanche-fuji',
        description: 'AI Summary Agent - summarize text'
      },
      { walletAddress, facilitatorUrl }
    ),
    async (req: Request, res: Response) => {
      try {
        const { text } = req.body;
        if (!text) {
          return res.status(400).json({ error: 'text field is required' });
        }

        const result = await executeSummaryAgentWithMock(text);

        // Add payment info from middleware
        if (res.locals.x402) {
          result.payment = {
            amount: res.locals.x402.amount,
            currency: 'USDC',
            txHash: res.locals.x402.txHash,
            timestamp: res.locals.x402.timestamp
          };
        }

        res.json(result);
      } catch (error) {
        console.error('Summary agent error:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  );

  // Translate Agent - $0.01 per request
  router.post(
    '/translate',
    x402Middleware(
      {
        price: '$0.01',
        network: 'avalanche-fuji',
        description: 'AI Translation Agent - translate text'
      },
      { walletAddress, facilitatorUrl }
    ),
    async (req: Request, res: Response) => {
      try {
        const { text, targetLanguage } = req.body;
        if (!text || !targetLanguage) {
          return res.status(400).json({
            error: 'text and targetLanguage fields are required'
          });
        }

        const result = await executeTranslateAgent(text, targetLanguage);

        // Add payment info from middleware
        if (res.locals.x402) {
          result.payment = {
            amount: res.locals.x402.amount,
            currency: 'USDC',
            txHash: res.locals.x402.txHash,
            timestamp: res.locals.x402.timestamp
          };
        }

        res.json(result);
      } catch (error) {
        console.error('Translate agent error:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  );

  // Code Review Agent - $0.05 per request
  router.post(
    '/code-review',
    x402Middleware(
      {
        price: '$0.05',
        network: 'avalanche-fuji',
        description: 'AI Code Review Agent - review code'
      },
      { walletAddress, facilitatorUrl }
    ),
    async (req: Request, res: Response) => {
      try {
        const { code } = req.body;
        if (!code) {
          return res.status(400).json({ error: 'code field is required' });
        }

        const result = await executeCodeReviewAgent(code);

        // Add payment info from middleware
        if (res.locals.x402) {
          result.payment = {
            amount: res.locals.x402.amount,
            currency: 'USDC',
            txHash: res.locals.x402.txHash,
            timestamp: res.locals.x402.timestamp
          };
        }

        res.json(result);
      } catch (error) {
        console.error('Code review agent error:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  );

  return router;
}
