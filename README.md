# 🗳️ DVote - Decentralized Voting App

Hardhat (Solidity) smart contract + React (Vite) frontend with MetaMask.

## Folder structure

```
dvote/
├── contracts/Voting.sol        # smart contract (elections, candidates, voters, votes)
├── test/Voting.test.js         # contract tests
├── scripts/deploy.js           # deploys + writes address to frontend/src/deployment.json
├── hardhat.config.js
└── frontend/
    └── src/
        ├── App.jsx             # wallet connect + election list
        ├── contract.js         # ABI + wallet/contract helper
        └── components/
            ├── ElectionCard.jsx  # status, live results, vote button
            └── AdminPanel.jsx    # create election, add candidates, register voters
```

## Run locally

```bash
npm install
npm --prefix frontend install

npx hardhat test                      # run contract tests

npx hardhat node                      # terminal 1 (local chain)
npm run deploy:local                  # terminal 2 (deploy)
npm run frontend                      # terminal 2 (open http://localhost:5173)
```

MetaMask setup: add network `http://127.0.0.1:8545`, chain ID `31337`, and import one of the private keys printed by `hardhat node`. The **first account** (the deployer) is the admin.

Testnet (Polygon Amoy): copy `.env.example` to `.env`, fill `PRIVATE_KEY`, then `npm run deploy:amoy`. Network switch in MetaMask is needed too.

## What works now (v0.1)

- Multi-election support
- Admin: create election with start/end time, add candidates (before start), register voter wallets
- Voters: connect MetaMask, vote once, see live results
- Time-window and one-vote-per-address enforced by the contract

## Known limitations (be honest in your report/viva)

- Votes are **public on-chain** (voter address -> candidate visible in events). Not anonymous yet.
- Admin is a single trusted address; voter eligibility = admin's wallet list (no KYC).
- Not audited. Use for learning / college project, not real elections.

## Roadmap (build in small parts)

1. Part 1 - Contract polish: delete/cancel election, pause, admin transfer
2. Part 2 - Better UI: toasts, loading states, nicer layout, mobile
3. Part 3 - Vote receipt (tx hash page) + audit trail from events
4. Part 4 - Voter registration requests + admin approval
5. Part 5 - IPFS: candidate photos / manifesto
6. Part 6 - Anonymous voting (commit-reveal, then ZK / Semaphore)
7. Part 7 - QR code voter verification, fraud/alert dashboard
8. Part 8 - Deploy: contract on Polygon Amoy, frontend on Vercel/Netlify
