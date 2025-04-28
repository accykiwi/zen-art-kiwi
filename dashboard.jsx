// /src/Dashboard.jsx

import { useEffect, useState } from "react";
import axios from "axios";

const WALLET_ADDRESS = "2eb81eBXidrgW6sSzTDnHTEQpqJpmkANMCSRS1BKjUku";
const PROXY_ENDPOINT = "/api/proxy-solana"; // Call serverless proxy instead of direct RPC

export default function Dashboard() {
  const [tokens, setTokens] = useState([]);
  const [totalValue, setTotalValue] = useState(0);

  const tokenMintMap = {
    "9BB6NFEcjBCtnNLFko2FqVQBq8HHM13kCyYcdQbgpump": "Fartcoin",
    "J3NKxxXZcnNiMjKw9hYb2K4LUxgwB6t1FtPtQVsv3KFr": "SPX6900",
    "63LfDmNb3MQ8mw9MtZ2To9bEA2M71kZUUGg5tiJxcqj9": "GIGACHAD",
    "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v": "USDC",
    "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R": "RAY"
  };

  async function fetchWalletTokens() {
    try {
      const response = await axios.post(PROXY_ENDPOINT, 
        { wallet: WALLET_ADDRESS }, 
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

      const fetchedTokens = response.data?.result?.value || [];

      const simplifiedTokens = fetchedTokens.map(account => {
        const info = account?.account?.data?.parsed?.info;
        if (!info || !info.tokenAmount?.uiAmount || !info.mint) return null;
        const amount = parseFloat(info.tokenAmount.uiAmount);
        const mint = info.mint;
        const symbol = tokenMintMap[mint] || "Unknown";
        return { symbol, amount };
      }).filter(token => token && token.amount > 0 && token.symbol !== "USA");

      return simplifiedTokens;
    } catch (error) {
      console.error("Failed to fetch wallet tokens via proxy:", error);
      return [];
    }
  }

  async function fetchTokenPrice(symbol) {
    try {
      const tokenMap = {
        USDC: { coingeckoId: "usd-coin" },
        RAY: { coingeckoId: "raydium" },
        SPX6900: { birdeyeSymbol: "SPX6900" },
        Fartcoin: { birdeyeSymbol: "Fartcoin" },
        GIGACHAD: { birdeyeSymbol: "GIGACHAD" },
      };

      if (!tokenMap[symbol]) {
        console.warn(`Symbol ${symbol} not found in tokenMap.`);
        return 0;
      }

      if (tokenMap[symbol]?.coingeckoId) {
        const res = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${tokenMap[symbol].coingeckoId}&vs_currencies=usd`);
        return res.data[tokenMap[symbol].coingeckoId]?.usd || 0;
      } else if (tokenMap[symbol]?.birdeyeSymbol) {
        const res = await axios.get(`https://public-api.birdeye.so/public/price?symbol=${tokenMap[symbol].birdeyeSymbol}`);
        return res.data?.data?.value || 0;
      }
    } catch (error) {
      console.error(`Price fetch error for ${symbol}:`, error);
    }
    return 0;
  }

  async function updateDashboard() {
    try {
      const fetchedTokens = await fetchWalletTokens();

      const updatedTokens = await Promise.all(fetchedTokens.map(async (token) => {
        const price = await fetchTokenPrice(token.symbol);
        return {
          ...token,
          price,
          value: price * token.amount,
        };
      }));

      setTokens(updatedTokens);
      const total = updatedTokens.reduce((acc, t) => acc + t.value, 0);
      setTotalValue(total);
    } catch (error) {
      console.error("Dashboard update failed:", error);
    }
  }

  useEffect(() => {
    updateDashboard();
    const interval = setInterval(updateDashboard, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-2xl font-bold mb-6">Solana Wallet Dashboard</h1>
      <div className="mb-6">Total Portfolio Value: ${totalValue.toFixed(2)}</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tokens.length > 0 ? tokens.map((token, idx) => (
          <div key={idx} className="bg-gray-800 p-4 rounded-lg">
            <div className="font-semibold">{token.symbol}</div>
            <div>Balance: {token.amount.toFixed(2)}</div>
            <div>Price: ${token.price.toFixed(4)}</div>
            <div>Value: ${token.value.toFixed(2)}</div>
          </div>
        )) : (
          <div>Loading tokens...</div>
        )}
      </div>
    </div>
  );
}
