# Deployment Guide (Polygon Amoy & Vercel)

## 1. Smart Contract Deployment (Polygon Amoy)
1. Fund a fresh test wallet with test POL from a Polygon Amoy faucet.
2. Add AMOY_RPC_URL and PRIVATE_KEY to root .env (never commit .env).
3. Run: npm install && npx hardhat test
4. Deploy: npx hardhat run scripts/deploy.js --network amoy

## 2. Frontend Deployment (Vercel)
1. Import Neha-1507/Decentralized-Voting-App in Vercel.
2. Set Root Directory to frontend and deploy.
