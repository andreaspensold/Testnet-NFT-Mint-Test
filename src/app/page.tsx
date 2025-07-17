"use client";

import Image from "next/image";
import { ConnectButton, MediaRenderer, useReadContract, useSendTransaction, useActiveAccount } from "thirdweb/react";
import { client } from "./client";
import { defineChain, getContract, toEther } from "thirdweb";
import { createWallet } from "thirdweb/wallets";
import { getContractMetadata } from "thirdweb/extensions/common";
import { 
  getActiveClaimCondition, 
  claimTo
} from "thirdweb/extensions/erc721";
import { useState } from "react";

// Reference image directly from public folder
const pindoraIcon = "/pindoralogo.png";
const backgroundIcon = "/mintbackground.jpeg";
const collectionIcon = "/SSSF.png";

// Create wallets array with MetaMask
const wallets = [createWallet("io.metamask")];

export default function Home() {
  const [mintStatus, setMintStatus] = useState("");
  const account = useActiveAccount();
  
  // Properly define custom chain with all required parameters
  const chain = defineChain({
    id: 99812,
    name: "Pindora Testnet",
    rpc: "https://subnets.avax.network/pindora/testnet/rpc",
    nativeCurrency: {
      name: "LUCIA",
      symbol: "LUCIA",
      decimals: 18,
    },
    testnet: true,
  });

  const contract = getContract({
    client: client,
    chain: chain,
    address: "0x400F8432253A7CaF458062c4C2632230c83B8e73"
  });

  const { data: contractMetadata, isLoading: isContractMetadataLoading } = useReadContract(
    getContractMetadata,
    { contract: contract }
  );

  const { data: claimCondition } = useReadContract(
    getActiveClaimCondition,
    { contract: contract }
  );

  // Enhanced error message parsing function
  const parseErrorMessage = (error: any) => {
    const errorMessage = error.message || error.toString();
    
    // Check for specific error patterns
    if (errorMessage.includes("DropClaimExceedLimit")) {
      return "❌ Wallet not eligible: You either already minted your Signal ID or are not on the whitelist.";
    }
    
    if (errorMessage.includes("ClaimConditionNotMet")) {
      return "❌ Claim condition not met: Please ensure you meet all requirements to mint.";
    }
    
    if (errorMessage.includes("InsufficientBalance") || errorMessage.includes("insufficient funds")) {
      return "❌ Insufficient LUCIA balance: You need more LUCIA tokens to complete the mint.";
    }
    
    if (errorMessage.includes("NotInAllowlist") || errorMessage.includes("not allowed")) {
      return "❌ Not whitelisted: Your wallet is not on the Verified Signal role holders list.";
    }
    
    if (errorMessage.includes("MaxQuantityPerTransactionExceeded")) {
      return "❌ Too many requested: You can only mint one Signal ID per transaction.";
    }
    
    if (errorMessage.includes("ClaimPeriodEnded") || errorMessage.includes("claim ended")) {
      return "❌ Mint period ended: The minting period has concluded.";
    }
    
    if (errorMessage.includes("ClaimPeriodNotStarted") || errorMessage.includes("not started")) {
      return "❌ Mint not started: The minting period hasn't begun yet.";
    }
    
    if (errorMessage.includes("rejected") || errorMessage.includes("denied")) {
      return "❌ Transaction rejected: You declined the transaction in your wallet.";
    }
    
    if (errorMessage.includes("network") || errorMessage.includes("RPC")) {
      return "❌ Network error: Please check your connection and try again.";
    }
    
    // Generic fallback with cleaner message
    return "❌ Minting failed: Please ensure you're whitelisted and haven't already minted. Contact support if the issue persists.";
  };

  // Mint functionality with enhanced error handling
  const { mutate: sendTransaction, isPending: isMinting } = useSendTransaction();

  const mintNFT = () => {
    if (!account) {
      setMintStatus("Please connect your wallet first!");
      return;
    }

    setMintStatus(""); // Clear previous status

    const transaction = claimTo({
      contract: contract,
      to: account.address,
      quantity: BigInt(1),
    });

    sendTransaction(transaction, {
      onSuccess: (result) => {
        setMintStatus("✅ Successfully minted your Sovereign Signal ID! Welcome to the exclusive club.");
        console.log("Mint transaction:", result);
      },
      onError: (error) => {
        const friendlyMessage = parseErrorMessage(error);
        setMintStatus(friendlyMessage);
        console.error("Mint error:", error);
      },
    });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      {/* Full-screen custom background image with better visibility */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('${backgroundIcon}')`,
          opacity: 0.7
        }}
      />
      
      {/* Light dark overlay for text readability */}
      <div className="absolute inset-0 bg-black/40" />
      
      {/* Pindora-inspired dark gradient overlay - Purple to Orange */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-950/40 via-violet-950/30 to-orange-950/20" />
      
      {/* Enhanced animated background elements for darker theme */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-600/15 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-600/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-violet-500/10 rounded-full blur-2xl animate-pulse delay-500"></div>
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-purple-700/8 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-orange-800/12 rounded-full blur-3xl animate-pulse delay-300"></div>
      </div>
      
      {/* Content */}
      <main className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-8 max-w-4xl mx-auto">
          <Header />
          
          {/* Main Content Card - Dark Pindora styled glassmorphism */}
          <div className="backdrop-blur-xl bg-gradient-to-br from-white/5 to-purple-900/30 border border-purple-400/40 rounded-3xl p-8 shadow-2xl w-full max-w-2xl">
            {/* Contract Information */}
            <div className="flex flex-col items-center mb-8">
              {isContractMetadataLoading ? (
                <div className="flex items-center gap-3 text-purple-100">
                  <div className="w-6 h-6 border-2 border-purple-300/30 border-t-purple-300 rounded-full animate-spin"></div>
                  <p className="text-lg">Loading contract info...</p>
                </div>
              ) : (
                <>
                  <div className="relative mb-6">
                    <MediaRenderer
                      client={client}
                      src={collectionIcon}
                      className="rounded-2xl shadow-2xl w-48 h-48 object-cover border-4 border-purple-300/30"
                    />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-purple-900/30 to-transparent"></div>
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-2 text-center">
                    {contractMetadata?.name}
                  </h2>
                </>
              )}
            </div>

            {/* Mint Section - Dark Pindora Purple/Orange theme */}
            <div className="bg-gradient-to-br from-purple-800/30 to-orange-700/20 backdrop-blur-sm rounded-2xl p-6 border border-purple-400/30">
              <h3 className="text-xl font-bold bg-gradient-to-r from-purple-200 to-orange-200 bg-clip-text text-transparent mb-6 text-center">
                Connect your whitelisted Metamask wallet.
              </h3>
              
              {claimCondition ? (
                <>
                  <div className="text-center mb-6">
                    <div className="inline-block bg-gradient-to-r from-orange-500 to-purple-600 text-white px-6 py-3 rounded-xl font-bold text-xl shadow-lg border border-orange-300/30">
                      Price: {parseFloat(toEther(claimCondition.pricePerToken)).toFixed(1)} LUCIA
                    </div>
                  </div>

                  <button
                    onClick={mintNFT}
                    disabled={isMinting || !account}
                    className={`
                      w-full px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform
                      ${isMinting || !account 
                        ? 'bg-gray-600/50 cursor-not-allowed text-white/50 scale-100 border border-gray-500/30' 
                        : 'bg-gradient-to-r from-purple-600 via-violet-600 to-orange-500 hover:from-purple-700 hover:via-violet-700 hover:to-orange-600 text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 border border-purple-300/30'
                      }
                    `}
                  >
                    {isMinting ? (
                      <span className="flex items-center justify-center gap-3">
                        <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Minting Your Sovereign Signal ID...
                      </span>
                    ) : !account ? (
                      'Connect Wallet to Mint'
                    ) : (
                      '🚀 Mint Your Sovereign Signal ID'
                    )}
                  </button>
                </>
              ) : (
                <div className="text-center">
                  <div className="flex items-center justify-center gap-3 text-purple-100">
                    <div className="w-5 h-5 border-2 border-purple-300/30 border-t-purple-300 rounded-full animate-spin"></div>
                    <p className="text-lg">Loading mint conditions...</p>
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced Mint Status - Better visual feedback */}
            {mintStatus && (
              <div className="mt-6 text-center">
                <div className={`
                  inline-block px-6 py-4 rounded-xl font-bold text-sm backdrop-blur-sm border max-w-md
                  ${mintStatus.includes('✅') || mintStatus.includes('Successfully') 
                    ? 'bg-green-500/20 border-green-400/50 text-green-200' 
                    : mintStatus.includes('❌') || mintStatus.includes('failed') || mintStatus.includes('not eligible')
                    ? 'bg-red-500/20 border-red-400/50 text-red-300'
                    : 'bg-purple-500/20 border-purple-400/50 text-purple-200'
                  }
                `}>
                  {mintStatus}
                </div>
              </div>
            )}

            {/* Additional Help Text for Whitelist Issues */}
            <div className="mt-4 text-center">
              <p className="text-purple-200/70 text-sm">
                Having trouble? Ensure you have the <span className="text-orange-300 font-semibold">Verified Signal</span> role in Discord.
              </p>
            </div>
          </div>

          {/* Connect Button - Updated with new configuration */}
          <div className="backdrop-blur-md bg-gradient-to-r from-purple-800/30 to-orange-700/30 border border-purple-400/40 rounded-2xl p-4">
            <ConnectButton
              client={client}
              chain={chain}
              wallets={wallets}
              connectModal={{ 
                showThirdwebBranding: false, 
                size: "compact" 
              }}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

function Header() {
  return (
    <header className="flex flex-col items-center text-center mb-8">
      <div className="relative mb-6">
        <Image
          src={pindoraIcon}
          alt="Pindora Logo"
          width={120}
          height={120}
          className="size-[120px] md:size-[120px] rounded-full border-4 border-purple-400/50 shadow-2xl"
          style={{
            filter: "drop-shadow(0px 0px 40px #a855f7aa)",
          }}
        />
        <div className="absolute inset-0 rounded-full bg-gradient-to-t from-purple-600/30 to-orange-400/15"></div>
      </div>
      
      <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-purple-300 via-violet-200 to-orange-300 bg-clip-text text-transparent mb-3 leading-tight pb-2">
        Sovereign Signal ID Mint
      </h1>
      
      <p className="text-purple-100/90 text-lg font-medium max-w-md mb-3">
        Claim your whitelist key. Prove you were first.
      </p>
      
      <p className="text-orange-200/80 text-sm font-light max-w-lg">
        Mint access is restricted to Verified Signal role holders.
      </p>
      
      {/* Decorative elements - Pindora brand colors */}
      <div className="flex gap-2 mt-4">
        <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
        <div className="w-2 h-2 bg-violet-400 rounded-full animate-pulse delay-75"></div>
        <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse delay-150"></div>
      </div>
    </header>
  );
}