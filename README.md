# Fiat Protocol

A DeFi protocol for Digital Fiat currencies (USD, EUR, JPY, MXN) wrapped as yield-bearing USDY on the Stellar network.

## Architecture

### 1. Smart Contracts (Rust/Soroban)
Located in `/contracts/fiat_protocol`.
- `lib.rs`: Contains the core logic for:
  - Minting USDY backed by USDC.
  - Distributing yield (20% Reserves, 5% Founder, 75% Holders).

### 2. Backend (Node.js/Express)
Located in `server.ts`.
- Simulates the Stellar ledger using SQLite.
- Handles minting of test tokens (Digital Dollar, Euro, Yen, Peso).
- Executes the swap logic: `Token -> USDC -> USDY`.
- Calculates and updates yield distribution.

### 3. Frontend (React)
- **Dashboard**: View wallet balances and protocol stats.
- **Mint**: On-ramp simulation for various fiat currencies.
- **Swap**: Convert fiat tokens to yield-bearing USDY.
- **Yield**: Simulate yield generation events and visualize the split.

## Usage

1. **Mint**: Select a currency (e.g., Digital Euro) and an amount (e.g., $100).
2. **Swap**: Convert your Digital Euro to USDY. The protocol simulates a swap to USDC first, then wraps it as USDY.
3. **Yield**: Click "Simulate Yield" to generate protocol revenue. Watch the "Fiat Reserves" and "Founder Fees" increase, while the 75% holder share is attributed to the pool (increasing the backing of USDY).

## Deployment (Hypothetical)

To deploy the contracts to Stellar:
1. Install Rust and the Soroban CLI.
2. Run `cargo build --target wasm32-unknown-unknown --release`.
3. Deploy using `soroban contract deploy`.
