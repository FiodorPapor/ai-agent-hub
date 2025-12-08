'use client';

import { useState } from 'react';

const AVALANCHE_FUJI_CHAIN_ID = 43113;

// Simple Web3 connection without external libraries
export default function Web3WalletButton() {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState('');
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);

  const detectProvider = () => {
    let provider = null;
    
    if ((window as any).ethereum) {
      provider = (window as any).ethereum;
    } else if ((window as any).web3) {
      provider = (window as any).web3.currentProvider;
    }
    
    return provider;
  };

  const connectWallet = async () => {
    console.log('🔗 Web3: Starting connection...');
    
    const provider = detectProvider();
    
    if (!provider) {
      alert('No Web3 provider detected. Please install MetaMask.');
      return;
    }

    try {
      // Enable ethereum (legacy method)
      if (provider.enable) {
        console.log('📡 Web3: Using legacy enable method');
        await provider.enable();
      }
      
      // Modern method
      if (provider.request) {
        console.log('📡 Web3: Using modern request method');
        const accounts = await provider.request({
          method: 'eth_requestAccounts'
        });
        
        if (accounts && accounts.length > 0) {
          setAddress(accounts[0]);
          setIsConnected(true);
          
          // Check network
          const networkId = await provider.request({
            method: 'net_version'
          });
          
          console.log('🌐 Web3: Network ID:', networkId);
          setIsCorrectNetwork(parseInt(networkId) === AVALANCHE_FUJI_CHAIN_ID);
        }
      }
    } catch (error) {
      console.error('❌ Web3: Connection failed:', error);
      alert('Failed to connect wallet. Please try again.');
    }
  };

  const switchNetwork = async () => {
    const provider = detectProvider();
    if (!provider) return;

    try {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${AVALANCHE_FUJI_CHAIN_ID.toString(16)}` }],
      });
      setIsCorrectNetwork(true);
    } catch (error: any) {
      if (error.code === 4902) {
        try {
          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: `0x${AVALANCHE_FUJI_CHAIN_ID.toString(16)}`,
              chainName: 'Avalanche Fuji',
              nativeCurrency: {
                name: 'AVAX',
                symbol: 'AVAX',
                decimals: 18,
              },
              rpcUrls: ['https://api.avax-test.network/ext/bc/C/rpc'],
              blockExplorerUrls: ['https://testnet.snowtrace.io'],
            }],
          });
          setIsCorrectNetwork(true);
        } catch (addError) {
          console.error('Failed to add network:', addError);
        }
      }
    }
  };

  const disconnect = () => {
    setIsConnected(false);
    setAddress('');
    setIsCorrectNetwork(false);
  };

  if (isConnected && address) {
    if (!isCorrectNetwork) {
      return (
        <div className="flex items-center gap-2">
          <div className="text-sm text-slate-300">
            {address.slice(0, 6)}...{address.slice(-4)}
          </div>
          <button
            onClick={switchNetwork}
            className="bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-300 text-sm"
          >
            Switch to Fuji
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
          Fuji ✓
        </div>
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
      className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-300 text-sm"
    >
      Connect Web3
    </button>
  );
}
