// context/SolanaContext.tsx
import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import { useWallet, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { AnchorProvider, Program, Idl } from '@coral-xyz/anchor';
import idl from '../idl.json'; // Import the IDL JSON file

interface SolanaContextProps {
    connection: Connection | null;
    wallet: any;
    program: Program | null;
}

const SolanaContext = createContext<SolanaContextProps | undefined>(undefined);

export const useSolana = () => {
    const context = useContext(SolanaContext);
    if (!context) {
        throw new Error('useSolana must be used within a SolanaProvider');
    }
    return context;
};

export const SolanaProvider = ({ children }: { children: ReactNode }) => {
    const [connection, setConnection] = useState<Connection | null>(null);
    const [program, setProgram] = useState<Program | null>(null);
    const wallet = useWallet();

    useEffect(() => {
        const conn = new Connection('https://api.mainnet-beta.solana.com');
        setConnection(conn);

        if (wallet.connected && wallet.publicKey) {
            const provider = new AnchorProvider(conn, wallet, { preflightCommitment: 'processed' });
            const programId = new PublicKey('YourProgramIdHere'); // Replace with your program ID
            const program = new Program(idl as Idl, provider);
            setProgram(program);
        }
    }, [wallet]);

    const value = useMemo(() => ({
        connection,
        wallet,
        program,
    }), [connection, wallet, program]);

    return (
        <SolanaContext.Provider value={value}>
            {children}
        </SolanaContext.Provider>
    );
};

export const SolanaWalletProvider = ({ children }: { children: ReactNode }) => {
    const wallets = useMemo(() => [new PhantomWalletAdapter()], []);
    return (
        <WalletProvider wallets={wallets} autoConnect>
            <WalletModalProvider>
                <SolanaProvider>
                    {children}
                </SolanaProvider>
            </WalletModalProvider>
        </WalletProvider>
    );
};