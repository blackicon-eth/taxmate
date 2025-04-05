# TAXMATE

## Overview

TAXMATE is a portfolio manager application that helps web2 users and businesses to optimize their funds by turning sleeping liquidity into yield. It provides a simple interface for depositing assets, tracking earnings, and managing treasury and downloading reports to file required taxation papers every year
Token Metrics APIs are leveraged to manage a higher risk investment strategy, called the "Vault". This index contains many different assets and it's rebalanced every 24 hours following Token Metrics insights.

## Features

- **Simple Mode**: Direct deposit into AAVE for simple yield generation
- **Vault Mode**: Vault styled portfolio with asset rebalancing capabilities
- **Yield Tracking**: Track deposits, earnings, and APY in real-time
- **Visualization**: View your performance with charts
- **CSV Export**: Download reports in csv format that will help you to file your fiscal papers

## Tech Stack

- **Frontend**: Next.js 15, React 19, TailwindCSS 4
- **Authentication**: Privy.io for web3 authentication
- **Blockchain**: Arbitrum Sepolia with Stylus to optimize gas fees
- **DeFi Protocols**: AAVE for yield generation
- **Charts**: Tremor Charts for data visualization

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

## Created At

ETHBucharest 2025

## Contracts Repository

https://github.com/SolidityDrone/taxmate-stylus-contracts/

## License

[MIT License](LICENSE)
