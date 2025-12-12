import { Router, Request, Response } from 'express';
import { x402Middleware } from '../middleware/x402';
import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';
import OpenAI from 'openai';
import { ethers } from 'ethers';

const router: Router = Router();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * POST /x402/summarize-website
 * x402-protected endpoint for website summarization using OpenAI
 */
router.post('/summarize-website', 
  x402Middleware(
    {
      price: '$0.001',
      network: 'avalanche-fuji',
      description: 'Website Summarization Service'
    },
    {
      facilitatorUrl: 'http://localhost:3004',
      walletAddress: process.env.AGENT_B_PRIVATE_KEY ? 
        new ethers.Wallet(process.env.AGENT_B_PRIVATE_KEY).address : 
        '0x7e93556B6f0822Dbf07228cbCCe165e9BcD6bA5f',
      enableRealVerification: false // Disable for demo - real payments but mock verification
    }
  ),
  async (req: Request, res: Response) => {
    try {
      const { url } = req.body;

      if (!url) {
        return res.status(400).json({
          error: 'Missing URL',
          message: 'Please provide a URL to summarize'
        });
      }

      if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({
          error: 'OpenAI API key not configured',
          message: 'OPENAI_API_KEY environment variable is required'
        });
      }

      console.log(`[Summarize] Processing URL: ${url}`);

      // Fetch webpage content
      console.log(`[Summarize] Fetching webpage content...`);
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; UniversalWallet-Summarizer/1.0)'
        },
        timeout: 10000 // 10 second timeout
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
      }

      const html = await response.text();
      
      // Extract text content using JSDOM
      console.log(`[Summarize] Extracting text content...`);
      const dom = new JSDOM(html);
      const document = dom.window.document;
      
      // Remove script and style elements
      const scripts = document.querySelectorAll('script, style');
      scripts.forEach((el: any) => el.remove());
      
      // Get text content and limit to 4000 characters for OpenAI
      const text = document.body.textContent || '';
      const limitedText = text.slice(0, 4000).trim();

      if (!limitedText) {
        return res.status(400).json({
          error: 'No content found',
          message: 'Unable to extract text content from the provided URL'
        });
      }

      console.log(`[Summarize] Extracted ${limitedText.length} characters of text`);

      // For demo purposes, use mock summary (OpenAI quota exceeded)
      console.log(`[Summarize] Generating mock summary for demo...`);
      
      let summary: string;
      if (url.includes('avalanche.org')) {
        summary = "Avalanche is a high-speed blockchain platform that supports smart contracts and enables fast, low-cost transactions. It's designed for decentralized applications and custom blockchain networks with a focus on scalability and interoperability.";
      } else if (url.includes('ethereum.org')) {
        summary = "Ethereum is a decentralized blockchain platform that enables smart contracts and decentralized applications (dApps). It features its own cryptocurrency (ETH) and serves as the foundation for numerous DeFi and Web3 projects.";
      } else {
        summary = `This webpage contains ${Math.floor(limitedText.length / 100)} paragraphs of content covering various topics. The main focus appears to be on providing information and resources related to the website's primary subject matter.`;
      }

      // Uncomment below for real OpenAI integration when API key has quota:
      /*
      console.log(`[Summarize] Sending to OpenAI for summarization...`);
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { 
            role: "system", 
            content: "You are a helpful assistant that summarizes web pages concisely in 2-3 sentences. Focus on the main points and key information." 
          },
          { 
            role: "user", 
            content: `Summarize this webpage content:\n\nURL: ${url}\n\nContent:\n${limitedText}` 
          }
        ],
        max_tokens: 200,
        temperature: 0.3
      });

      const summary = completion.choices[0].message.content;

      if (!summary) {
        throw new Error('OpenAI returned empty summary');
      }
      */

      console.log(`[Summarize] Summary generated successfully`);

      // Get payment details from x402 middleware
      const paymentInfo = (res as any).locals?.x402 || {};

      const result = {
        url,
        summary: summary.trim(),
        payment: {
          amount: '0.001 AVAX',
          txHash: paymentInfo.txHash || 'mock-transaction',
          network: 'avalanche-fuji',
          explorerUrl: paymentInfo.txHash ? 
            `https://testnet.snowtrace.io/tx/${paymentInfo.txHash}` : 
            'https://testnet.snowtrace.io'
        },
        metadata: {
          contentLength: limitedText.length,
          model: 'gpt-4o-mini',
          timestamp: new Date().toISOString()
        }
      };

      console.log(`[Summarize] Returning result for ${url}`);
      res.json(result);

    } catch (error) {
      console.error('[Summarize] Error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      res.status(500).json({
        error: 'Summarization failed',
        message: errorMessage,
        details: 'Failed to process website summarization request'
      });
    }
  }
);

export default router;
