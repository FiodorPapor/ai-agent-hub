'use client';

import { useState, useEffect } from 'react';

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

export default function SimpleWalletButton() {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState('');
  const [chainId, setChainId] = useState('');
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);

  const checkNetwork = async () => {
    console.log('🌐 Checking network...');
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        const currentChainId = await (window as any).ethereum.request({
          method: 'eth_chainId',
        });
        console.log('🔗 Current chain ID:', currentChainId);
        console.log('🎯 Expected chain ID:', AVALANCHE_FUJI_CHAIN_ID);
        console.log('✅ Is correct network:', currentChainId === AVALANCHE_FUJI_CHAIN_ID);
        
        setChainId(currentChainId);
        setIsCorrectNetwork(currentChainId === AVALANCHE_FUJI_CHAIN_ID);
        return currentChainId;
      } catch (error) {
        console.error('❌ Failed to get chain ID:', error);
        return null;
      }
    }
    console.log('❌ No Ethereum provider for network check');
    return null;
  };

  const switchToFuji = async () => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        // Try to switch to Fuji network
        await (window as any).ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: AVALANCHE_FUJI_CHAIN_ID }],
        });
        // Recheck network after successful switch
        await checkNetwork();
      } catch (switchError: any) {
        // If the network is not added, add it
        if (switchError.code === 4902) {
          try {
            await (window as any).ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [FUJI_NETWORK_CONFIG],
            });
            // Recheck network after successful add
            await checkNetwork();
          } catch (addError) {
            console.error('Failed to add Fuji network:', addError);
          }
        } else {
          console.error('Failed to switch to Fuji network:', switchError);
        }
      }
    }
  };

  const connectWallet = async () => {
    console.log('🔗 Connect wallet button clicked');
    console.log('🌐 Window object:', typeof window);
    
    if (typeof window === 'undefined') {
      console.log('❌ Window is undefined');
      return;
    }

    // Wait for page to fully load
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Detect and select the right provider
    let ethereum = (window as any).ethereum;
    
    console.log('🔍 Available providers:', {
      ethereum: !!ethereum,
      isMetaMask: ethereum?.isMetaMask,
      isTrust: ethereum?.isTrust,
      providers: ethereum?.providers?.length || 0
    });
    
    // Handle multiple providers (common issue)
    if (ethereum?.providers?.length > 0) {
      console.log('🔄 Multiple providers detected, selecting MetaMask...');
      ethereum = ethereum.providers.find((p: any) => p.isMetaMask) || ethereum.providers[0];
    }
    
    // Fallback to specific provider if main ethereum object is problematic
    if (!ethereum || typeof ethereum.request !== 'function') {
      console.log('🔍 Trying alternative provider detection...');
      ethereum = (window as any).web3?.currentProvider || 
                 (window as any).ethereum || 
                 null;
    }
    
    console.log('🦊 Selected provider:', {
      exists: !!ethereum,
      hasRequest: typeof ethereum?.request === 'function',
      isMetaMask: ethereum?.isMetaMask,
      isTrust: ethereum?.isTrust
    });
    
    if (!ethereum || typeof ethereum.request !== 'function') {
      console.log('❌ No valid Ethereum provider found');
      alert('Please install MetaMask or another Web3 wallet and refresh the page');
      return;
    }

    console.log('✅ Ethereum provider found, attempting connection...');
    
    try {
      // Use a more robust approach for requesting accounts
      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      });
      
      console.log('📋 Accounts received:', accounts);
      
      if (accounts && accounts.length > 0) {
        console.log('🎯 Setting address:', accounts[0]);
        setAddress(accounts[0]);
        setIsConnected(true);
        
        // Check network after successful connection
        setTimeout(() => {
          checkNetwork();
        }, 500);
      } else {
        console.log('❌ No accounts returned');
        alert('No accounts found. Please unlock your wallet.');
      }
    } catch (error: any) {
      console.error('❌ Failed to connect wallet:', error);
      
      if (error.code === 4001) {
        alert('Connection rejected by user');
      } else if (error.code === -32002) {
        alert('Connection request already pending. Please check your wallet.');
      } else {
        alert(`Connection failed: ${error?.message || 'Unknown error'}`);
      }
    }
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setAddress('');
    setChainId('');
    setIsCorrectNetwork(false);
  };

  // Listen for network changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const ethereum = (window as any).ethereum;
      
      if (ethereum && typeof ethereum.on === 'function') {
        const handleChainChanged = (newChainId: string) => {
          console.log('🔄 Network changed to:', newChainId);
          setChainId(newChainId);
          setIsCorrectNetwork(newChainId === AVALANCHE_FUJI_CHAIN_ID);
        };

        const handleAccountsChanged = (accounts: string[]) => {
          console.log('👤 Accounts changed:', accounts);
          if (accounts.length === 0) {
            // User disconnected wallet
            disconnectWallet();
          } else if (accounts[0] !== address) {
            // User switched accounts
            setAddress(accounts[0]);
            checkNetwork();
          }
        };

        try {
          ethereum.on('chainChanged', handleChainChanged);
          ethereum.on('accountsChanged', handleAccountsChanged);

          // Check network on mount if already connected
          if (isConnected) {
            checkNetwork();
          }
        } catch (error) {
          console.error('Error setting up event listeners:', error);
        }

        return () => {
          try {
            if (ethereum.removeListener) {
              ethereum.removeListener('chainChanged', handleChainChanged);
              ethereum.removeListener('accountsChanged', handleAccountsChanged);
            }
          } catch (error) {
            console.error('Error removing event listeners:', error);
          }
        };
      }
    }
  }, [isConnected, address]);

  if (isConnected && address) {
    // If connected but wrong network, show switch button
    if (!isCorrectNetwork) {
      return (
        <div className="flex items-center gap-2">
          <div className="text-sm text-slate-300">
            {address.slice(0, 6)}...{address.slice(-4)}
          </div>
          <button
            onClick={switchToFuji}
            className="bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-300 text-sm"
          >
            Switch to Avalanche Fuji
          </button>
          <button
            onClick={disconnectWallet}
            className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-300 text-sm"
          >
            Disconnect
          </button>
        </div>
      );
    }

    // If connected and correct network, show normal state
    return (
      <div className="flex items-center gap-2">
        <div className="text-sm text-slate-300">
          {address.slice(0, 6)}...{address.slice(-4)}
        </div>
        <div className="text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded">
          Avalanche Fuji
        </div>
        <button
          onClick={disconnectWallet}
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
      className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-300 text-sm"
    >
      Connect Wallet
    </button>
  );
}
