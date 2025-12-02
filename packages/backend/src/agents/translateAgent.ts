// Translation Agent - Translates text to target language
// Price: $0.01 per 100 words

export interface TranslateResult {
  agent: string;
  input: string;
  targetLanguage: string;
  translation: string;
  wordCount: number;
  payment?: {
    amount: string;
    currency: string;
    txHash: string;
    timestamp: string;
  };
}

// Mock translations
const mockTranslations: Record<string, Record<string, string>> = {
  'spanish': {
    'hello world': 'Hola mundo',
    'ai agent': 'Agente de IA',
    'blockchain': 'Cadena de bloques',
    'payment': 'Pago',
    'default': 'Este es un texto traducido al español.'
  },
  'french': {
    'hello world': 'Bonjour le monde',
    'ai agent': 'Agent IA',
    'blockchain': 'Chaîne de blocs',
    'payment': 'Paiement',
    'default': 'Ceci est un texte traduit en français.'
  },
  'german': {
    'hello world': 'Hallo Welt',
    'ai agent': 'KI-Agent',
    'blockchain': 'Blockchain',
    'payment': 'Zahlung',
    'default': 'Dies ist ein ins Deutsche übersetzter Text.'
  },
  'japanese': {
    'hello world': 'こんにちは世界',
    'ai agent': 'AIエージェント',
    'blockchain': 'ブロックチェーン',
    'payment': '支払い',
    'default': 'これは日本語に翻訳されたテキストです。'
  }
};

export async function executeTranslateAgent(
  text: string,
  targetLanguage: string
): Promise<TranslateResult> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 400));

  const lang = targetLanguage.toLowerCase();
  const lowerText = text.toLowerCase();

  // Try to find matching translation for known phrases
  let translation = null;
  
  if (mockTranslations[lang]) {
    for (const [key, value] of Object.entries(mockTranslations[lang])) {
      if (key !== 'default' && lowerText.includes(key)) {
        translation = value;
        break;
      }
    }
  }

  // If no exact phrase match, translate the whole text word by word
  if (!translation) {
    const words = text.split(/\s+/);
    const translatedWords = words.map(word => {
      const lowerWord = word.toLowerCase();
      const langDict = mockTranslations[lang];
      
      // Check if word or phrase exists in dictionary
      if (langDict) {
        for (const [key, value] of Object.entries(langDict)) {
          if (key !== 'default' && lowerWord.includes(key)) {
            return value;
          }
        }
      }
      
      // Return original word if no translation found
      return word;
    });
    
    translation = translatedWords.join(' ');
  }

  // Fallback if language not supported
  if (!translation) {
    translation = mockTranslations[lang]?.default || `[${lang}] ${text}`;
  }

  const wordCount = text.split(/\s+/).length;

  return {
    agent: 'translate',
    input: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
    targetLanguage,
    translation,
    wordCount
  };
}
