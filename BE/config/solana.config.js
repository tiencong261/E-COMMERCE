export default {
  MERCHANT_WALLET: process.env.SOLANA_MERCHANT_WALLET,
  USD_TO_VND_RATE: 27081.2903,
  LABEL: "FOREVER",
  NETWORK: process.env.SOLANA_NETWORK || "devnet",
  CURRENCY_API:
    "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd",
};
