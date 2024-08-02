// pages/index.tsx
import { useEffect, useState } from 'react';
import { useSolana } from '../context/SolanaContext';
import { PublicKey } from '@solana/web3.js';
import { getOrCreateAssociatedTokenAccount, getAccount } from '@solana/spl-token';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import * as anchor from '@coral-xyz/anchor';

const TOKEN_A_MINT = new PublicKey('Your Token A Mint Address');
const TOKEN_B_MINT = new PublicKey('Your Token B Mint Address');

export default function Home() {
  const { connection, wallet, program } = useSolana();
  const [tokenABalance, setTokenABalance] = useState<number>(0);
  const [tokenBEquivalent, setTokenBEquivalent] = useState<number>(0);

  useEffect(() => {
    const fetchTokenABalance = async () => {
      if (wallet.connected && wallet.publicKey && connection) {
        const tokenAAccount = await getOrCreateAssociatedTokenAccount(
          connection,
          wallet.publicKey,
          TOKEN_A_MINT,
          wallet.publicKey
        );

        const tokenAAccountInfo = await getAccount(connection, tokenAAccount.address);
        const balance = Number(tokenAAccountInfo.amount);
        setTokenABalance(balance);
        setTokenBEquivalent(balance * 100);
      }
    };

    fetchTokenABalance();
  }, [wallet, connection]);

  const handleBurnAndMint = async () => {
    if (wallet.connected && wallet.publicKey && connection && program) {
      const tokenAAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        wallet.publicKey,
        TOKEN_A_MINT,
        wallet.publicKey
      );

      const tokenBAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        wallet.publicKey,
        TOKEN_B_MINT,
        wallet.publicKey
      );

      try {
        await program.methods.swap(new anchor.BN(tokenABalance))
          .accounts({
            user: wallet.publicKey,
            userTokenA: tokenAAccount.address,
            tokenAMint: TOKEN_A_MINT,
            tokenMintB: TOKEN_B_MINT,
            userTokenB: tokenBAccount.address,
            mintAuthority: wallet.publicKey,
            tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([])
          .rpc();
      } catch (error) {
        console.error("Transaction error:", error);
      }
    }
  };

  return (
    <div>
      <h1>Solana Token Swap</h1>
      <WalletMultiButton />
      {wallet.connected && (
        <div>
          <p>Token A Balance: {tokenABalance}</p>
          <p>Equivalent Token B: {tokenBEquivalent}</p>
          <button onClick={handleBurnAndMint}>Burn and Claim Token B</button>
        </div>
      )}
    </div>
  );
}