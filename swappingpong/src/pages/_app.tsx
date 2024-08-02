// pages/_app.tsx
import '../styles/globals.css';
import { SolanaWalletProvider } from '../context/SolanaContext';
import '@solana/wallet-adapter-react-ui/styles.css';
import type { AppProps } from 'next/app';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <SolanaWalletProvider>
      <Component {...pageProps} />
    </SolanaWalletProvider>
  );
}

export default MyApp;