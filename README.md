# NFT Marketplace

A full-stack NFT marketplace decentralized application built with **Next.js**, **Solidity**, **Hardhat**, **RainbowKit**, **Wagmi**, **Viem**, **Prisma**, and **SQLite**.

The application combines on-chain NFT ownership and marketplace transactions with off-chain indexing and application data. Users can authenticate with an Ethereum wallet, upload NFT assets to IPFS, mint and list ERC-721 tokens, purchase or resell NFTs, maintain wishlists, report listings, and manage their marketplace activity from a profile dashboard.

> This repository is an educational project configured primarily for a local Hardhat blockchain. It has not been audited and should not be used with real funds without substantial security review and production hardening.

## Features

### Wallet connection and authentication

- Connect an Ethereum wallet using RainbowKit
- Interact with the blockchain through Wagmi and Viem
- Authenticate with **Sign-In with Ethereum (SIWE)**
- Maintain authenticated sessions with NextAuth and JWTs
- Automatically create a database user for a newly authenticated wallet

### NFT creation and IPFS storage

- Upload NFT images through a drag-and-drop interface
- Validate image uploads and limit files to 50 MB
- Store images on IPFS through Pinata
- Generate and pin ERC-721 metadata to IPFS
- Enter an NFT name, description, category, and ETH price
- Mint the token and list it for sale in one flow
- Store searchable NFT and listing data in SQLite through Prisma

### Marketplace

- Browse active NFT listings
- Search by NFT name or description
- Filter by category
- Filter by minimum and maximum ETH price
- Paginate marketplace results
- View listing prices in ETH and approximate USD value
- Browse only items saved to the connected wallet's wishlist

Available categories:

- Art
- Game
- Nature
- Sport
- Portrait
- Animal

### NFT details

- View NFT metadata, dimensions, creator address, token ID, contract address, and price
- Purchase listed NFTs from the connected wallet
- Prevent sellers from buying their own listings
- Add or remove listings from a wishlist
- Report a listing once per authenticated user
- Share listing pages through Facebook, X/Twitter, Telegram, Instagram, or the browser share API

### Profile dashboard

- View NFTs owned by the connected wallet directly from the smart contract
- View active listings stored in the application database
- Review purchase and sale history
- Cancel an active listing
- Relist an owned NFT at a new price and category
- View seller proceeds accrued by the smart contract
- Withdraw marketplace earnings to the connected wallet
- View wallet address, balances, listing counts, and portfolio summaries

### Additional application features

- Category statistics and featured listings on the home page
- ETH-to-USD conversion through the CoinGecko API
- Responsive desktop and mobile navigation
- Email newsletter subscription storage
- Persistent wishlists and reports

## Architecture

```text
Ethereum wallet
      |
      v
RainbowKit + Wagmi + Viem
      |
      +-------------------------> Solidity ERC-721 marketplace
      |                             - mint and list
      |                             - buy and transfer
      |                             - cancel and relist
      |                             - fees and withdrawals
      |
      v
Next.js application
      |
      +--> NextAuth + SIWE authentication
      +--> Next.js API routes
      +--> Prisma ORM --> SQLite
      +--> Pinata --> IPFS images and metadata
```

The blockchain is the source of truth for token ownership and marketplace transfers. Prisma and SQLite maintain application-friendly records for users, NFT metadata, active listings, transactions, wishlists, reports, and newsletter subscribers.

## Smart contract

The marketplace contract is located at [`site/contracts/SmartContract.sol`](site/contracts/SmartContract.sol).

It is an ERC-721 token contract with marketplace functionality based on OpenZeppelin components:

- `ERC721URIStorage` for token metadata URIs
- `ReentrancyGuard` for protected state-changing payment operations
- `Ownable2Step` for safer ownership transfer
- `Pausable` for emergency pause and unpause controls

Implemented marketplace operations include:

- `createToken` - mint and immediately list an NFT
- `createMarketSale` - purchase a listed NFT
- `cancelListing` - return a listed NFT to its seller
- `resellToken` - list an owned NFT again
- `fetchMyNFTs` - retrieve NFTs owned by the caller
- `withdraw` - withdraw accrued seller proceeds

The protocol fee is configured as `100` basis points, equal to **1%**. Listing, cancellation, and sale-related fee accounting is handled by the contract. Seller proceeds use a pull-payment style balance that the seller withdraws separately.

## Technology stack

| Layer | Technology |
| --- | --- |
| Frontend | Next.js 15, React 19, CSS Modules |
| Wallet UI | RainbowKit |
| Blockchain hooks | Wagmi |
| Ethereum utilities | Viem, Ethers.js |
| Authentication | NextAuth, SIWE |
| Smart contracts | Solidity 0.8.28, OpenZeppelin |
| Local blockchain and deployment | Hardhat |
| Database | SQLite |
| ORM | Prisma |
| Decentralized storage | IPFS through Pinata |
| Data fetching and caching | TanStack Query |

## Database model

The Prisma schema is located at [`site/prisma/schema.prisma`](site/prisma/schema.prisma). It defines the following main entities:

- `User` - identified by a unique wallet address
- `NFT` - token metadata and current indexed owner
- `Listing` - active or inactive marketplace listings
- `Transaction` - mint, sale, and resale history
- `WishlistItem` - user-saved listings
- `Report` - user reports against listings
- `Subscriber` - newsletter email subscriptions

## Getting started

### Prerequisites

Install the following before running the project:

- Node.js 20 or newer
- npm
- A browser wallet such as MetaMask
- A WalletConnect Cloud project ID
- Pinata API credentials

### 1. Clone the repository

```bash
git clone https://github.com/M-Majed/NFTMarketplace.git
cd NFTMarketplace/site
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create `site/.env`:

```env
# Prisma / SQLite
DATABASE_URL="file:./dev.db"

# NextAuth / SIWE
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="replace-with-a-long-random-secret"

# WalletConnect / RainbowKit
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID="your-walletconnect-project-id"

# Pinata / IPFS
PINATA_API_KEY="your-pinata-api-key"
PINATA_SECRET_API_KEY="your-pinata-secret-api-key"
```

Generate a secure NextAuth secret with a command such as:

```bash
openssl rand -base64 32
```

### 4. Prepare the database

Generate the Prisma client and apply the included migrations:

```bash
npx prisma generate
npx prisma migrate dev
```

Open Prisma Studio to inspect the database:

```bash
npx prisma studio
```

### 5. Start the local blockchain

In a terminal inside `site/`:

```bash
npx hardhat node
```

Keep this terminal running. Add the local network to your wallet when needed:

| Setting | Value |
| --- | --- |
| Network name | Hardhat Localhost |
| RPC URL | `http://127.0.0.1:8545` |
| Chain ID | `1337` |
| Currency symbol | `ETH` |

Import one of the test accounts printed by Hardhat into your browser wallet. These accounts and their private keys are for local testing only.

### 6. Deploy the smart contract

In a second terminal:

```bash
npx hardhat run scripts/deploy.cjs --network localhost
```

The first deployment to a newly started default Hardhat node normally uses the address already configured in the repository:

```text
0x5FbDB2315678afecb367f032d93F642f64180aa3
```

When the deployed address differs, update it in both files:

- `site/src/context/constants.js`
- `site/src/app/constants.js`

After changing the contract, compile it and ensure `site/src/context/NFTMarketplace.json` contains the current ABI.

```bash
npx hardhat compile
```

### 7. Run the application

In another terminal:

```bash
npm run dev
```

Open `http://localhost:3000`, connect a wallet to the Hardhat network, and complete the SIWE signature request.

## Useful commands

Run these commands from the `site/` directory.

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Create a production build |
| `npm run start` | Start the production build |
| `npx hardhat node` | Start the local Ethereum network |
| `npx hardhat compile` | Compile the Solidity contract |
| `npx hardhat run scripts/deploy.cjs --network localhost` | Deploy to the local network |
| `npx prisma generate` | Generate the Prisma client |
| `npx prisma migrate dev` | Apply development migrations |
| `npx prisma studio` | Open the database browser |

## Project structure

```text
NFTMarketplace/
├── 40015703.pdf                 # Full project report/documentation
├── poster.pdf                   # Project poster
├── poster.pptx                  # Editable poster source
├── first.docx                   # Supporting project document
├── second.docx                  # Supporting project document
└── site/
    ├── contracts/
    │   └── SmartContract.sol    # ERC-721 marketplace contract
    ├── scripts/
    │   └── deploy.cjs           # Hardhat deployment script
    ├── prisma/
    │   ├── schema.prisma        # Database models
    │   ├── migrations/          # Prisma migrations
    │   └── dev.db               # Development SQLite database
    ├── public/img/              # Marketplace images and assets
    ├── src/app/
    │   ├── api/                 # Authentication and application APIs
    │   ├── createnft/           # NFT creation and listing page
    │   ├── marketplace/         # Searchable marketplace
    │   ├── nftdetails/          # NFT details and purchase page
    │   ├── profile/             # Wallet profile and transaction dashboard
    │   └── page.jsx             # Home page
    ├── src/components/          # Shared interface components
    ├── src/context/             # Contract ABI, address, and Web3 actions
    ├── hardhat.config.cjs       # Hardhat configuration
    └── package.json             # Dependencies and scripts
```

## Project documentation

- [Full project report](40015703.pdf)
- [Project poster](poster.pdf)
- [Editable poster presentation](poster.pptx)

## Security and production notes

Before adapting this project for a public network or real assets:

- Perform a professional smart-contract audit
- Add automated smart-contract, API, and interface tests
- Remove `hardhat/console.sol` from the production contract
- Deploy to a testnet before considering mainnet
- Store production secrets in a secure secret manager
- Review all API authorization and database synchronization paths
- Use a production database instead of the bundled SQLite development file
- Add monitoring, rate limiting, structured logging, and recovery procedures
- Verify IPFS gateway availability and content persistence policies
- Add deployment-specific chain and contract configuration instead of hard-coded addresses

Because blockchain transactions and database updates occur separately, production deployments should also include a reliable event indexer or reconciliation process to recover from partial failures.

## License

The application package declares the **ISC License** in `site/package.json`. A standalone `LICENSE` file should be added if the project is distributed or reused.
