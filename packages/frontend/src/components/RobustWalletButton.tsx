'use client';

import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

const AVALANCHE_FUJI_CHAIN_ID = '0xA869'; // 43113 in hex
const FUJI_NETWORK_CONFIG = {
  chainId: AVALANCHE_FUJI_CHAIN_ID,
  chainName: 'Avalanche Fuji',
  nativeCurrency: {
    name: 'AVAX',
    symbol: 'AVAX',
    decimals: 18,
  },
  rpcUrls: ['https://api.avax-test.network/ext/bc/C/rpc'],
  blockExplorerUrls: ['https://testnet.snowtrace.io'],
};

export default function RobustWalletButton() {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState('');
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Find the cleanest ethereum provider
  const getCleanProvider = () => {
    if (typeof window === 'undefined') return null;

    // Try to get the most direct provider
    const providers = [
      (window as any).ethereum,
      (window as any).web3?.currentProvider,
    ].filter(Boolean);

    console.log('🔍 Available providers:', providers.length);

    // If multiple providers, try to find MetaMask specifically
    for (const provider of providers) {
      if (provider && typeof provider.request === 'function') {
        console.log('✅ Found working provider:', {
          isMetaMask: provider.isMetaMask,
          hasRequest: typeof provider.request === 'function'
        });
        return provider;
      }
    }

    return null;
  };

  // Simple connection without event listeners that cause problems
  const connectWallet = async () => {
    console.log('🔗 Robust: Starting connection...');
    setIsLoading(true);

    try {
      const provider = getCleanProvider();
      
      if (!provider) {
        alert('No Web3 wallet detected. Please install MetaMask.');
        return;
      }

      console.log('📡 Robust: Requesting accounts...');
      
      // Use direct request without any event listener setup
      const accounts = await provider.request({
        method: 'eth_requestAccounts',
      });

      if (accounts && accounts.length > 0) {
        console.log('✅ Robust: Connected to:', accounts[0]);
        setAddress(accounts[0]);
        setIsConnected(true);

        // Check network separately
        await checkNetworkStatus(provider);
      }
    } catch (error: any) {
      console.error('❌ Robust: Connection failed:', error);
      
      if (error.code === 4001) {
        alert('Connection was rejected. Please try again.');
      } else {
        alert('Failed to connect. Please refresh the page and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const checkNetworkStatus = async (provider?: any) => {
    try {
      const activeProvider = provider || getCleanProvider();
      if (!activeProvider) return;

      const chainId = await activeProvider.request({
        method: 'eth_chainId',
      });

      console.log('🌐 Robust: Current network:', chainId);
      
      // Normalize chainId for comparison (handle both hex and decimal)
      const normalizedChainId = chainId.toLowerCase();
      const isCorrect = normalizedChainId === AVALANCHE_FUJI_CHAIN_ID.toLowerCase() || 
                       normalizedChainId === '0xa869' ||
                       parseInt(chainId, 16) === 43113 ||
                       chainId === '43113';
      
      console.log('🔍 RobustWallet network check:', {
        received: chainId,
        normalized: normalizedChainId,
        expected: AVALANCHE_FUJI_CHAIN_ID,
        isCorrect
      });
      
      setIsCorrectNetwork(isCorrect);
    } catch (error) {
      console.error('❌ Network check failed:', error);
    }
  };

  const switchToFuji = async () => {
    setIsLoading(true);
    try {
      const provider = getCleanProvider();
      if (!provider) return;

      console.log('🔄 Switching to Fuji...');

      try {
        await provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: AVALANCHE_FUJI_CHAIN_ID }],
        });
        setIsCorrectNetwork(true);
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          console.log('➕ Adding Fuji network...');
          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [FUJI_NETWORK_CONFIG],
          });
          setIsCorrectNetwork(true);
        } else {
          throw switchError;
        }
      }
    } catch (error) {
      console.error('❌ Network switch failed:', error);
      alert('Failed to switch network. Please try manually in your wallet.');
    } finally {
      setIsLoading(false);
    }
  };

  const disconnect = () => {
    setIsConnected(false);
    setAddress('');
    setIsCorrectNetwork(false);
  };

  // Manual refresh function
  const refreshWalletStatus = async () => {
    console.log('🔄 Manually refreshing wallet status...');
    try {
      const provider = getCleanProvider();
      if (!provider) return;

      const accounts = await provider.request({
        method: 'eth_accounts',
      });

      if (accounts && accounts.length > 0) {
        setAddress(accounts[0]);
        setIsConnected(true);
        await checkNetworkStatus(provider);
      } else {
        setIsConnected(false);
        setAddress('');
        setIsCorrectNetwork(false);
      }
    } catch (error) {
      console.error('Failed to refresh wallet status:', error);
    }
  };

  // Check connection status on mount (without event listeners)
  useEffect(() => {
    const checkExistingConnection = async () => {
      try {
        const provider = getCleanProvider();
        if (!provider) return;

        const accounts = await provider.request({
          method: 'eth_accounts',
        });

        if (accounts && accounts.length > 0) {
          setAddress(accounts[0]);
          setIsConnected(true);
          await checkNetworkStatus(provider);
        }
      } catch (error) {
        console.log('No existing connection found');
      }
    };

    checkExistingConnection();
  }, []);

  if (isConnected && address) {
    if (!isCorrectNetwork) {
      return (
        <div className="flex items-center gap-2">
          <div className="text-sm text-slate-300">
            {address.slice(0, 6)}...{address.slice(-4)}
          </div>
          <button
            onClick={switchToFuji}
            disabled={isLoading}
            className="bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 disabled:opacity-50 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-300 text-sm"
          >
            {isLoading ? 'Switching...' : 'Switch to Avalanche Fuji'}
          </button>
          <button
            onClick={refreshWalletStatus}
            className="p-2 text-slate-400 hover:text-white transition-colors"
            title="Refresh wallet status"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={disconnect}
            className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-300 text-sm"
          >
            Disconnect
          </button>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <div className="text-sm text-slate-300">
          {address.slice(0, 6)}...{address.slice(-4)}
        </div>
        <div className="text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded">
          ✅ Avalanche Fuji
        </div>
        <button
          onClick={refreshWalletStatus}
          className="p-2 text-slate-400 hover:text-white transition-colors"
          title="Refresh wallet status"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
        <button
          onClick={disconnect}
          className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-300 text-sm"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={connectWallet}
      disabled={isLoading}
      className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 disabled:opacity-50 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-300 text-sm"
    >
      {isLoading ? 'Connecting...' : 'Connect Wallet (Robust)'}
    </button>
  );
}
