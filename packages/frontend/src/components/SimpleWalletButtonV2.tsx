'use client';

import { useState } from 'react';

const AVALANCHE_FUJI_CHAIN_ID = '0xA869'; // 43113 in hex

export default function SimpleWalletButtonV2() {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState('');
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);

  const connectWallet = async () => {
    console.log('🔗 V2: Connect wallet button clicked');
    
    try {
      // Direct approach - check if MetaMask is available
      if (!(window as any).ethereum) {
        alert('MetaMask is not installed. Please install MetaMask and try again.');
        return;
      }

      console.log('✅ V2: MetaMask detected');

      // Request account access
      const accounts = await (window as any).ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length > 0) {
        console.log('✅ V2: Account connected:', accounts[0]);
        setAddress(accounts[0]);
        setIsConnected(true);

        // Check network
        const chainId = await (window as any).ethereum.request({
          method: 'eth_chainId',
        });
        
        console.log('🌐 V2: Current network:', chainId);
        setIsCorrectNetwork(chainId === AVALANCHE_FUJI_CHAIN_ID);
      }
    } catch (error: any) {
      console.error('❌ V2: Connection failed:', error);
      
      if (error.code === 4001) {
        alert('Please connect to MetaMask.');
      } else {
        alert('An error occurred. Please try again.');
      }
    }
  };

  const switchToFuji = async () => {
    try {
      await (window as any).ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: AVALANCHE_FUJI_CHAIN_ID }],
      });
      setIsCorrectNetwork(true);
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        try {
          await (window as any).ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: AVALANCHE_FUJI_CHAIN_ID,
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

  const disconnectWallet = () => {
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
      Connect Wallet V2
    </button>
  );
}
