import { configureChains, createConfig } from 'wagmi';
import { avalancheFuji } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';
import { InjectedConnector } from 'wagmi/connectors/injected';

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [avalancheFuji],
  [publicProvider()]
);

export const config = createConfig({
  autoConnect: true,
  connectors: [
    new MetaMaskConnector({ chains }),
    new InjectedConnector({
      chains,
      options: {
        name: 'Injected',
        shimDisconnect: true,
      },
    }),
    new WalletConnectConnector({
      chains,
      options: {
        projectId: 'd80964fae72f11747d037416c1837f66', // Hardcoded for simplicity
        metadata: {
          name: 'AI Agent Service Hub',
          description: 'AI Agent marketplace with x402 payments',
          url: 'http://localhost:3001',
          icons: ['https://avatars.githubusercontent.com/u/37784886'],
        },
      },
    }),
  ],
  publicClient,
  webSocketPublicClient,
});

export { chains };
