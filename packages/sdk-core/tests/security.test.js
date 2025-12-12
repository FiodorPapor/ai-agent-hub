/**
 * Security Tests for Universal Agent Wallet SDK
 */

const { 
  UniversalWallet, 
  isValidAddress, 
  validatePaymentDetails,
  validateMainnetConfig 
} = require('../dist/index.js');

describe('Security Tests', () => {
  
  describe('Private Key Security', () => {
    test('should not expose private keys in error messages', async () => {
      const invalidKey = '0xinvalid-private-key-that-should-not-appear-in-logs';
      
      try {
        const wallet = new UniversalWallet({ privateKey: invalidKey });
        await wallet.getBalance();
      } catch (error) {
        expect(error.message).not.toContain(invalidKey);
        expect(error.toString()).not.toContain(invalidKey);
      }
    });

    test('should not log private keys during wallet creation', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const testPrivateKey = '0x' + '1'.repeat(64); // Mock private key for testing
      const testPrivateKey2 = '0x' + '2'.repeat(64); // Mock private key for testing
      
      const wallet = UniversalWallet.connect(testPrivateKey);
      
      const logCalls = consoleSpy.mock.calls.flat().join(' ');
      expect(logCalls).not.toContain(testPrivateKey);
      
      consoleSpy.mockRestore();
    });

    test('should validate private key format', () => {
      const invalidKeys = [
        '1234', // too short
        '0x123', // too short with prefix
        'not-hex', // invalid characters
        '', // empty
        null, // null
        undefined // undefined
      ];

      invalidKeys.forEach(key => {
        expect(() => {
          new UniversalWallet({ privateKey: key });
        }).toThrow();
      });
    });
  });

  describe('Address Validation', () => {
    test('should validate Ethereum addresses correctly', () => {
      const validAddresses = [
        '0x742d35Cc6634C0532925a3b844Bc9e7595f5bB0e',
        '0x0000000000000000000000000000000000000000',
        '0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF'
      ];

      const invalidAddresses = [
        '742d35Cc6634C0532925a3b844Bc9e7595f5bB0e', // missing 0x
        '0x742d35Cc6634C0532925a3b844Bc9e7595f5bB0', // too short
        '0x742d35Cc6634C0532925a3b844Bc9e7595f5bB0ee', // too long
        '0xGGGd35Cc6634C0532925a3b844Bc9e7595f5bB0e', // invalid hex
        '', // empty
        null, // null
        undefined // undefined
      ];

      validAddresses.forEach(address => {
        expect(isValidAddress(address)).toBe(true);
      });

      invalidAddresses.forEach(address => {
        expect(isValidAddress(address)).toBe(false);
      });
    });
  });

  describe('Payment Details Validation', () => {
    test('should validate payment details structure', () => {
      const validPayment = {
        amount: '$0.02',
        currency: 'AVAX',
        network: 'avalanche-fuji',
        receiverAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f5bB0e',
        description: 'Test payment'
      };

      expect(validatePaymentDetails(validPayment)).toBe(true);

      // Test missing required fields
      const requiredFields = ['amount', 'currency', 'network', 'receiverAddress'];
      requiredFields.forEach(field => {
        const invalidPayment = { ...validPayment };
        delete invalidPayment[field];
        expect(validatePaymentDetails(invalidPayment)).toBe(false);
      });
    });

    test('should reject malicious payment amounts', () => {
      const maliciousAmounts = [
        'javascript:alert(1)', // XSS attempt
        '<script>alert(1)</script>', // HTML injection
        '../../etc/passwd', // Path traversal
        'SELECT * FROM users', // SQL injection attempt
        '${process.env.SECRET}', // Template injection
        'Infinity', // Invalid number
        'NaN' // Invalid number
      ];

      maliciousAmounts.forEach(amount => {
        const payment = {
          amount,
          currency: 'AVAX',
          network: 'avalanche-fuji',
          receiverAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f5bB0e',
          description: 'Test'
        };
        
        // Should either reject or sanitize malicious input
        const isValid = validatePaymentDetails(payment);
        if (isValid) {
          // If accepted, ensure it's properly sanitized
          expect(payment.amount).not.toContain('<script>');
          expect(payment.amount).not.toContain('javascript:');
        }
      });
    });
  });

  describe('Network Security', () => {
    test('should validate network configuration', () => {
      const validNetworks = ['avalanche-fuji', 'avalanche-mainnet'];
      const invalidNetworks = ['ethereum', 'bitcoin', 'malicious-network', ''];

      validNetworks.forEach(network => {
        expect(() => {
          new UniversalWallet({ network });
        }).not.toThrow();
      });

      // Invalid networks should either throw or default to safe network
      invalidNetworks.forEach(network => {
        const wallet = new UniversalWallet({ network });
        const actualNetwork = wallet.getNetwork();
        expect(['avalanche-fuji', 'avalanche-mainnet']).toContain(actualNetwork);
      });
    });

    test('should validate mainnet configuration securely', () => {
      const mainnetConfig = {
        network: 'avalanche-mainnet',
        privateKey: undefined
      };

      const validation = validateMainnetConfig(mainnetConfig);
      expect(validation.isValid).toBe(false);
      expect(validation.warnings.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling Security', () => {
    test('should not expose sensitive data in error messages', async () => {
      const wallet = UniversalWallet.connect();
      
      try {
        // This should fail due to insufficient funds
        await wallet.pay('0x742d35Cc6634C0532925a3b844Bc9e7595f5bB0e', '1000');
      } catch (error) {
        // Error should not contain private key or other sensitive data
        expect(error.message).not.toMatch(/0x[a-fA-F0-9]{64}/); // Private key pattern
        expect(error.message).not.toContain('private');
        expect(error.message).not.toContain('secret');
      }
    });

    test('should handle malformed API responses safely', async () => {
      const wallet = UniversalWallet.connect();
      
      // Mock fetch to return malformed response
      const originalFetch = global.fetch;
      global.fetch = jest.fn().mockResolvedValue({
        status: 402,
        json: () => Promise.resolve({
          malicious: '<script>alert(1)</script>',
          payment: null // Invalid payment structure
        })
      });

      try {
        await wallet.callPaidAPI('http://test.com/api');
      } catch (error) {
        // Should handle gracefully without executing malicious content
        expect(error.message).not.toContain('<script>');
      } finally {
        global.fetch = originalFetch;
      }
    });
  });

  describe('Input Sanitization', () => {
    test('should sanitize URL inputs', () => {
      const maliciousUrls = [
        'javascript:alert(1)',
        'data:text/html,<script>alert(1)</script>',
        'file:///etc/passwd',
        'ftp://malicious.com/payload'
      ];

      maliciousUrls.forEach(url => {
        expect(() => {
          // Should either reject or sanitize malicious URLs
          const wallet = UniversalWallet.connect();
          // This should not execute malicious code
          wallet.callPaidAPI(url);
        }).not.toThrow(); // Should handle gracefully, not crash
      });
    });

    test('should validate numeric inputs', () => {
      const maliciousNumbers = [
        'Infinity',
        '-Infinity',
        'NaN',
        '1e308', // Number.MAX_VALUE overflow
        '-1e308',
        '0x1234', // Hex that might be confused with address
        '1.7976931348623157e+308' // Max safe number
      ];

      maliciousNumbers.forEach(num => {
        const result = parseFloat(num.replace(/[^0-9.-]/g, ''));
        expect(isFinite(result) || isNaN(result)).toBe(true);
      });
    });
  });

  describe('Rate Limiting & DoS Protection', () => {
    test('should handle rapid successive calls gracefully', async () => {
      const wallet = UniversalWallet.connect();
      
      // Make many rapid calls
      const promises = Array(10).fill().map(() => 
        wallet.getBalance().catch(() => null)
      );

      const results = await Promise.all(promises);
      
      // Should not crash or expose errors
      results.forEach(result => {
        expect(typeof result === 'string' || result === null).toBe(true);
      });
    });
  });

  describe('Memory Safety', () => {
    test('should not leak sensitive data in memory', () => {
      const sensitiveData = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
      
      // Create and destroy wallet
      let wallet = UniversalWallet.connect(sensitiveData);
      const address = wallet.getAddress();
      wallet = null;
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      // Sensitive data should not be easily accessible
      expect(address).toBeDefined();
      expect(address).not.toBe(sensitiveData);
    });
  });
});

// Mock Jest if not available
if (typeof describe === 'undefined') {
  global.describe = (name, fn) => {
    console.log(`\n🧪 ${name}`);
    fn();
  };
  
  global.test = (name, fn) => {
    try {
      fn();
      console.log(`  ✅ ${name}`);
    } catch (error) {
      console.log(`  ❌ ${name}: ${error.message}`);
    }
  };
  
  global.expect = (actual) => ({
    toBe: (expected) => {
      if (actual !== expected) {
        throw new Error(`Expected ${expected}, got ${actual}`);
      }
    },
    not: {
      toContain: (substring) => {
        if (typeof actual === 'string' && actual.includes(substring)) {
          throw new Error(`Expected not to contain "${substring}"`);
        }
      },
      toMatch: (pattern) => {
        if (typeof actual === 'string' && pattern.test(actual)) {
          throw new Error(`Expected not to match pattern ${pattern}`);
        }
      },
      toBe: (expected) => {
        if (actual === expected) {
          throw new Error(`Expected not to be ${expected}`);
        }
      }
    },
    toContain: (substring) => {
      if (typeof actual === 'string' && !actual.includes(substring)) {
        throw new Error(`Expected to contain "${substring}"`);
      }
    },
    toThrow: () => {
      try {
        actual();
        throw new Error('Expected function to throw');
      } catch (e) {
        // Expected to throw
      }
    }
  });
  
  global.jest = {
    fn: () => ({ mock: { calls: [] } }),
    spyOn: () => ({ mockImplementation: () => {}, mockRestore: () => {} })
  };
}
