import axios from 'axios';

export interface SummarizeRequest {
  url?: string;
  text?: string;
}

export interface SummarizeResponse {
  summary: string;
  originalLength: number;
  summaryLength: number;
  compressionRatio: number;
  source: 'url' | 'text';
  timestamp: string;
}

/**
 * Summarize text content using a simple extractive summarization
 * In production, this would use AI services like OpenAI, Claude, etc.
 */
export async function summarizeContent(request: SummarizeRequest): Promise<SummarizeResponse> {
  let content = '';
  let source: 'url' | 'text' = 'text';

  // Get content from URL or direct text
  if (request.url) {
    try {
      console.log(`[Summarizer] Fetching content from URL: ${request.url}`);
      const response = await axios.get(request.url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Universal-Agent-Wallet/1.0'
        }
      });
      
      // Extract text from HTML (simple approach)
      content = extractTextFromHtml(response.data);
      source = 'url';
      
      if (!content.trim()) {
        throw new Error('No readable content found at the provided URL');
      }
    } catch (error: any) {
      throw new Error(`Failed to fetch URL content: ${error.message}`);
    }
  } else if (request.text) {
    content = request.text;
    source = 'text';
  } else {
    throw new Error('Either url or text must be provided');
  }

  // Perform summarization
  const summary = performSummarization(content);
  
  return {
    summary,
    originalLength: content.length,
    summaryLength: summary.length,
    compressionRatio: Math.round((summary.length / content.length) * 100) / 100,
    source,
    timestamp: new Date().toISOString()
  };
}

/**
 * Simple extractive summarization algorithm
 * In production, replace with AI-powered summarization
 */
function performSummarization(text: string): string {
  // Clean and split into sentences
  const sentences = text
    .replace(/\s+/g, ' ')
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 20); // Filter out very short sentences

  if (sentences.length <= 3) {
    return sentences.join('. ') + '.';
  }

  // Score sentences based on word frequency and position
  const wordFreq = calculateWordFrequency(text);
  const sentenceScores = sentences.map((sentence, index) => {
    const words = sentence.toLowerCase().split(/\W+/).filter(w => w.length > 3);
    const score = words.reduce((sum, word) => sum + (wordFreq[word] || 0), 0) / words.length;
    
    // Boost score for sentences at the beginning and end
    const positionBoost = index < 2 || index >= sentences.length - 2 ? 1.2 : 1.0;
    
    return {
      sentence,
      score: score * positionBoost,
      index
    };
  });

  // Select top sentences (roughly 30% of original)
  const targetSentences = Math.max(2, Math.min(5, Math.ceil(sentences.length * 0.3)));
  const topSentences = sentenceScores
    .sort((a, b) => b.score - a.score)
    .slice(0, targetSentences)
    .sort((a, b) => a.index - b.index); // Restore original order

  return topSentences.map(s => s.sentence).join('. ') + '.';
}

/**
 * Calculate word frequency for scoring
 */
function calculateWordFrequency(text: string): Record<string, number> {
  const words = text.toLowerCase().split(/\W+/).filter(w => w.length > 3);
  const freq: Record<string, number> = {};
  
  words.forEach(word => {
    freq[word] = (freq[word] || 0) + 1;
  });

  // Normalize frequencies
  const maxFreq = Math.max(...Object.values(freq));
  Object.keys(freq).forEach(word => {
    freq[word] = freq[word] / maxFreq;
  });

  return freq;
}

/**
 * Extract readable text from HTML content
 */
function extractTextFromHtml(html: string): string {
  // Remove script and style elements
  let text = html.replace(/<script[^>]*>.*?<\/script>/gis, '');
  text = text.replace(/<style[^>]*>.*?<\/style>/gis, '');
  
  // Remove HTML tags
  text = text.replace(/<[^>]*>/g, ' ');
  
  // Decode HTML entities
  text = text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
  
  // Clean up whitespace
  text = text.replace(/\s+/g, ' ').trim();
  
  return text;
}

/**
 * Validate summarization request
 */
export function validateSummarizeRequest(request: any): SummarizeRequest {
  if (!request || typeof request !== 'object') {
    throw new Error('Request body must be a JSON object');
  }

  const { url, text } = request;

  if (!url && !text) {
    throw new Error('Either "url" or "text" field is required');
  }

  if (url && text) {
    throw new Error('Provide either "url" or "text", not both');
  }

  if (url && (typeof url !== 'string' || !isValidUrl(url))) {
    throw new Error('Invalid URL format');
  }

  if (text && (typeof text !== 'string' || text.trim().length < 10)) {
    throw new Error('Text must be at least 10 characters long');
  }

  return { url, text };
}

/**
 * Simple URL validation
 */
function isValidUrl(string: string): boolean {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}
