# TAXMATE

## Overview

TAXMATE is a DeFi application that helps businesses optimize their treasury management by turning sleeping liquidity into yield. It provides a simple interface for depositing assets, tracking earnings, and managing treasury.
Token Metrics APIs are leveraged to manage a higher risk portfolio, called "Vault".

## Features

- **Simple Mode**: Direct deposit into AAVE for simple yield generation
- **Vault Mode**: Vault styled portfolio with asset rebalancing capabilities.
- **Yield Tracking**: Track deposits, earnings, and APY in real-time
- **Visualization**: View your performance with charts
- **CSV Export**: Download reports in csv format that will help you to file your fiscal papers

## Tech Stack

- **Frontend**: Next.js 15, React 19, TailwindCSS 4
- **Authentication**: Privy.io for web3 authentication
- **Blockchain**: Arbitrum Sepolia with Stylus to optimize gas fees
- **DeFi Protocols**: AAVE for yield generation
- **Charts**: Tremor and Recharts for data visualization
- **Database**: DrizzleORM with LibSQL

## Getting Started

### Prerequisites

- Node.js 18+
- PNPM 10+

### Installation

1. Clone the repository

   ```bash
   git clone https://github.com/yourusername/taxmate.git
   cd taxmate
   ```

2. Install dependencies

   ```bash
   pnpm install
   ```

3. Configure environment variables

   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. Start the development server
   ```bash
   pnpm dev
   ```

## Usage

1. Connect your wallet using Privy authentication
2. Choose between Simple mode or Vault mode
3. Deposit your assets to start earning yield
4. Monitor your earnings and APY in real-time
5. Withdraw funds or rebalance as needed

## Project Structure

- `/app`: Next.js application routes
- `/components`: Reusable UI components
- `/lib`: Utilities, constants, and API integrations
- `/hooks`: Custom React hooks
- `/public`: Static assets
- `/types`: TypeScript type definitions

## License

[MIT License](LICENSE)

## Created At

ETHBucharest 2025
