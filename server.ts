import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

// Initialize DB
const db = new Database("fiat_protocol.db");
db.pragma("journal_mode = WAL");

// Initialize Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    address TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS balances (
    user_id INTEGER,
    currency TEXT, -- 'yUSDC', 'USD', 'EUR', etc. (Generic) OR Token Symbol like '$10Dollar'
    amount REAL DEFAULT 0,
    PRIMARY KEY (user_id, currency),
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    type TEXT, -- 'MINT', 'SWAP', 'YIELD'
    from_currency TEXT,
    to_currency TEXT,
    amount_in REAL,
    amount_out REAL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  
  CREATE TABLE IF NOT EXISTS protocol_stats (
    key TEXT PRIMARY KEY,
    value REAL
  );

  CREATE TABLE IF NOT EXISTS inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    name TEXT,
    description TEXT,
    price REAL,
    image_url TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS asset_settings (
    user_id INTEGER,
    asset_code TEXT,
    enabled BOOLEAN DEFAULT 1,
    PRIMARY KEY (user_id, asset_code),
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    name TEXT,
    dob TEXT, -- Private
    ssn TEXT, -- Private
    image_url TEXT,
    occupation TEXT,
    pay_rate REAL,
    description TEXT,
    status TEXT DEFAULT 'Active', -- Active, Terminated
    termination_date DATETIME,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS properties (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    address TEXT,
    description TEXT,
    market_cap REAL, -- The equity value attached
    equity_balance REAL DEFAULT 0, -- 25% retained equity
    image_url TEXT,
    apn TEXT, -- Assessor's Parcel Number
    title_number TEXT,
    zoning TEXT,
    jurisdiction TEXT,
    status TEXT DEFAULT 'Active', -- Active, Swapped, Listed
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_yield_time DATETIME,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS property_vault (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    property_id INTEGER,
    currency TEXT, -- 'yBTC', 'yETH', 'USD', etc.
    amount REAL DEFAULT 0,
    FOREIGN KEY(property_id) REFERENCES properties(id)
  );

  CREATE TABLE IF NOT EXISTS farm_stakes (
    user_id INTEGER,
    farm_id TEXT, -- 'gold', 'silver', 'digital-dollar', 'bitcoin', 'ethereum'
    staked_amount REAL DEFAULT 0, -- In Digital Dollars (USD)
    rewards_accrued REAL DEFAULT 0, -- In Reward Token
    last_update DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, farm_id),
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`);

// Seed initial protocol stats if not exists
const initStats = db.prepare("INSERT OR IGNORE INTO protocol_stats (key, value) VALUES (?, ?)");
initStats.run("fiat_reserves", 0);
initStats.run("fiat_protocol_swap_reserves", 0); // New Reserve
initStats.run("founder_fees", 0);
initStats.run("total_usdy_supply", 0);
initStats.run("current_reserve_asset", "USD"); // Default

// ... (rest of code)





  // --- API Routes ---
const TOKENS = [
  // Digital Dollars
  { id: 'USD_0.01', name: 'digital dollar', symbol: '$1Cent', val: 0.01, type: 'USD' },
  { id: 'USD_0.05', name: 'digital dollar', symbol: '$5Cent', val: 0.05, type: 'USD' },
  { id: 'USD_0.10', name: 'digital dollar', symbol: '$10Cent', val: 0.10, type: 'USD' },
  { id: 'USD_0.25', name: 'digital dollar', symbol: '$25Cent', val: 0.25, type: 'USD' },
  { id: 'USD_0.50', name: 'digital dollar', symbol: '$1Dollar-Cent', val: 0.50, type: 'USD' },
  { id: 'USD_1', name: 'digital dollar', symbol: '$1Dollar', val: 1, type: 'USD' },
  { id: 'USD_2', name: 'digital dollar', symbol: '$2Dollar', val: 2, type: 'USD' },
  { id: 'USD_5', name: 'digital dollar', symbol: '$5Dollar', val: 5, type: 'USD' },
  { id: 'USD_10', name: 'digital dollar', symbol: '$10Dollar', val: 10, type: 'USD' },
  { id: 'USD_20', name: 'digital dollar', symbol: '$20Dollar', val: 20, type: 'USD' },
  { id: 'USD_50', name: 'digital dollar', symbol: '$50Dollar', val: 50, type: 'USD' },
  { id: 'USD_100', name: 'digital dollar', symbol: '$100Dollar', val: 100, type: 'USD' },
  // Digital Euros
  { id: 'EUR_1', name: 'digital euro', symbol: '$1Euro', val: 1, type: 'EUR' },
  { id: 'EUR_2', name: 'digital euro', symbol: '$2Euro', val: 2, type: 'EUR' },
  { id: 'EUR_5', name: 'digital euro', symbol: '$5Euro', val: 5, type: 'EUR' },
  { id: 'EUR_10', name: 'digital euro', symbol: '$10Euro', val: 10, type: 'EUR' },
  { id: 'EUR_20', name: 'digital euro', symbol: '$20Euro', val: 20, type: 'EUR' },
  { id: 'EUR_50', name: 'digital euro', symbol: '$50Euro', val: 50, type: 'EUR' },
  { id: 'EUR_100', name: 'digital euro', symbol: '$100Euro', val: 100, type: 'EUR' },
  // Digital Pesos
  { id: 'MXN_1', name: 'digital peso', symbol: '$1Peso', val: 1, type: 'MXN' },
  { id: 'MXN_2', name: 'digital peso', symbol: '$2Peso', val: 2, type: 'MXN' },
  { id: 'MXN_5', name: 'digital peso', symbol: '$5Peso', val: 5, type: 'MXN' },
  { id: 'MXN_10', name: 'digital peso', symbol: '$10Peso', val: 10, type: 'MXN' },
  { id: 'MXN_20', name: 'digital peso', symbol: '$20Peso', val: 20, type: 'MXN' },
  { id: 'MXN_50', name: 'digital peso', symbol: '$50Peso', val: 50, type: 'MXN' },
  { id: 'MXN_100', name: 'digital peso', symbol: '$100Peso', val: 100, type: 'MXN' },
  // Stock & RWA Assets
  { id: 'xTSLA', name: 'Tesla', symbol: 'xTSLA', val: 200, type: 'STOCK' },
  { id: 'xAAPL', name: 'Apple', symbol: 'xAAPL', val: 175, type: 'STOCK' },
  { id: 'xGOOGL', name: 'Google', symbol: 'xGOOGL', val: 140, type: 'STOCK' },
  { id: 'HOOD', name: 'Robinhood', symbol: 'HOOD', val: 18, type: 'STOCK' },
  { id: 'OUSG', name: 'Ondo Gov', symbol: 'OUSG', val: 105, type: 'RWA' },
  { id: 'LINK', name: 'Chainlink', symbol: 'LINK', val: 15, type: 'CRYPTO' },
];

const RATES: Record<string, number> = {
  'USD': 1.0,
  'EUR': 1.08,
  'JPY': 0.0067,
  'MXN': 0.059,
  // Stellar Assets
  'XLM': 0.12,
  'USDC': 1.0,
  'PYUSD': 1.0,
  'BTC': 65000.0,
  'SHX': 0.002,
  'AQUA': 0.001,
  'yUSDC': 1.0,
  'yETH': 3200.0,
  'yBTC': 65000.0,
  'yXLM': 0.12,
  'USDY': 1.0,
  'USTRY': 1.0,
  'ONDO': 0.85,
  // EVM Assets
  'ETH': 3200.0,
  'UNI': 10.0,
  '1INCH': 0.5,
  'USDT': 1.0,
  'USDC_EVM': 1.0,
  'gWEI': 0.0000032,
  // Cronos Assets
  'CRO': 0.15,
  'USDC_CRO': 1.0,
  'VVS': 0.000004,
  'TONIC': 0.0000001,
  // Solana Assets
  'SOL': 145.0,
  'USDC_SOL': 1.0,
  'JUP': 1.2,
  'PYTH': 0.45,
  // Banking
  'BANK': 1.0,
  'ZELLE': 1.0,
  'CASHAPP': 1.0,
  'PAYPAL': 1.0,
  'BTC_LN': 65000.0,
  // Stock & RWA Assets
  'xTSLA': 200.0,
  'xAAPL': 175.0,
  'xGOOGL': 140.0,
  'HOOD': 18.0,
  'OUSG': 105.0,
  'LINK': 15.0,
  // Base Rates for Types
  'STOCK': 1.0,
  'RWA': 1.0,
  'CRYPTO': 1.0,
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Debug Middleware
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });

  // --- Farm Endpoints ---
  
  // Get User Farm Data
  app.get("/api/farms/:address", (req, res) => {
    const { address } = req.params;
    const user = db.prepare("SELECT id FROM users WHERE address = ?").get(address) as any;
    if (!user) return res.json({});

    const stakes = db.prepare("SELECT farm_id, staked_amount, rewards_accrued FROM farm_stakes WHERE user_id = ?").all(user.id);
    const result: Record<string, any> = {};
    stakes.forEach((s: any) => {
        result[s.farm_id] = { staked: s.staked_amount, rewards: s.rewards_accrued };
    });
    res.json(result);
  });

  // Stake (Deposit)
  app.post("/api/farms/stake", (req, res) => {
    const { address, farm_id, asset, amount } = req.body;
    const user = db.prepare("SELECT id FROM users WHERE address = ?").get(address) as any;
    if (!user) return res.status(404).json({ error: "User not found" });

    // 1. Calculate USD Value (Async Swap Simulation)
    const rates = RATES;
    const rate = rates[asset] || 0;
    if (rate === 0) return res.status(400).json({ error: "Invalid asset" });
    
    const usdValue = amount * rate;

    // 2. Update Stake
    db.prepare(`
        INSERT INTO farm_stakes (user_id, farm_id, staked_amount) 
        VALUES (?, ?, ?) 
        ON CONFLICT(user_id, farm_id) DO UPDATE SET staked_amount = staked_amount + ?
    `).run(user.id, farm_id, usdValue, usdValue);

    // 3. Log Transaction
    db.prepare("INSERT INTO transactions (user_id, type, from_currency, to_currency, amount_in, amount_out, timestamp) VALUES (?, 'STAKE_FARM', ?, ?, ?, ?, ?)").run(user.id, asset, `FARM_${farm_id.toUpperCase()}`, amount, usdValue, new Date().toISOString());

    res.json({ success: true, stakedUSD: usdValue });
  });

  // Claim Rewards
  app.post("/api/farms/claim", (req, res) => {
    const { address, farm_id } = req.body;
    const user = db.prepare("SELECT id FROM users WHERE address = ?").get(address) as any;
    if (!user) return res.status(404).json({ error: "User not found" });

    const stake = db.prepare("SELECT rewards_accrued FROM farm_stakes WHERE user_id = ? AND farm_id = ?").get(user.id, farm_id) as any;
    if (!stake || stake.rewards_accrued <= 0) {
        return res.status(400).json({ error: "No rewards to claim" });
    }

    const rewardAmount = stake.rewards_accrued;

    // Determine Reward Token based on Farm ID
    let rewardToken = 'USD';
    if (farm_id === 'gold') rewardToken = 'GOLD';
    if (farm_id === 'silver') rewardToken = 'SLVR';
    if (farm_id === 'digital-dollar') rewardToken = 'USD'; // Digital Dollars
    if (farm_id === 'bitcoin') rewardToken = 'yBTC';
    if (farm_id === 'ethereum') rewardToken = 'yETH';
    
    // Stock Farms
    if (['xTSLA', 'xAAPL', 'xGOOGL', 'HOOD', 'OUSG', 'LINK'].includes(farm_id)) {
        rewardToken = farm_id;
    }

    // 1. Credit User Balance
    db.prepare(`
        INSERT INTO balances (user_id, currency, amount) 
        VALUES (?, ?, ?) 
        ON CONFLICT(user_id, currency) DO UPDATE SET amount = amount + ?
    `).run(user.id, rewardToken, rewardAmount, rewardAmount);

    // 2. Reset Rewards
    db.prepare("UPDATE farm_stakes SET rewards_accrued = 0 WHERE user_id = ? AND farm_id = ?").run(user.id, farm_id);

    // 3. Log Transaction
    db.prepare("INSERT INTO transactions (user_id, type, to_currency, amount_out, timestamp) VALUES (?, 'CLAIM_FARM', ?, ?, ?)").run(user.id, rewardToken, rewardAmount, new Date().toISOString());

    res.json({ success: true, claimed: rewardAmount, token: rewardToken });
  });

  // Process Yield (Simulation Step)
  app.post("/api/farms/process-yield", (req, res) => {
    try {
        // This would typically be a cron job. Here we simulate a "tick".
        // We iterate all stakes and apply the logic.
        
        const stakes = db.prepare("SELECT * FROM farm_stakes WHERE staked_amount > 0").all() as any[];
        let totalYieldGenerated = 0;

        const APR_MAP: Record<string, number> = {
            'gold': 0.125,
            'silver': 0.10,
            'digital-dollar': 0.15,
            'bitcoin': 0.05,
            'ethereum': 0.06,
            // Stock Farms
            'xTSLA': 0.125,
            'xAAPL': 0.08,
            'xGOOGL': 0.095,
            'HOOD': 0.15,
            'OUSG': 0.052,
            'LINK': 0.11
        };

        // Simulate 1 day of yield for this call (or a smaller interval if called frequently)
        // Let's assume this is called every 5 seconds by the frontend, simulating a small slice of time.
        // To make it visible, let's pretend 5 seconds = 1 hour of yield.
        const TIME_FACTOR = 1 / (24 * 365); // 1 hour portion of a year roughly

        const updateStake = db.prepare("UPDATE farm_stakes SET staked_amount = staked_amount + ?, rewards_accrued = rewards_accrued + ? WHERE user_id = ? AND farm_id = ?");
        const updateReserves = db.prepare("UPDATE protocol_stats SET value = value + ? WHERE key = ?");

        for (const stake of stakes) {
            const apr = APR_MAP[stake.farm_id] || 0.05;
            const yieldAmount = stake.staked_amount * apr * TIME_FACTOR; // USD Value
            
            if (yieldAmount > 0) {
                totalYieldGenerated += yieldAmount;

                const isStockFarm = ['xTSLA', 'xAAPL', 'xGOOGL', 'HOOD', 'OUSG', 'LINK'].includes(stake.farm_id);

                if (isStockFarm) {
                    // Stock Farm Allocation: 25/25/50
                    // 25% to Farmer (Stock Token)
                    // 25% to Farm Balance (USD) -> Auto-compound
                    // 50% to Fiat Reserves (yUSDC)

                    const farmerShareUSD = yieldAmount * 0.25;
                    const compoundShareUSD = yieldAmount * 0.25;
                    const reserveShareUSD = yieldAmount * 0.50;

                    // Convert Farmer Share to Token Amount
                    const tokenRate = RATES[stake.farm_id] || 1.0;
                    const farmerShareToken = farmerShareUSD / tokenRate;

                    // Update Stake
                    updateStake.run(compoundShareUSD, farmerShareToken, stake.user_id, stake.farm_id);

                    // Update Reserves
                    updateReserves.run(reserveShareUSD, 'fiat_reserves');

                } else {
                    // Standard Allocation: 25/25/25/25
                    const shareUSD = yieldAmount * 0.25;

                    // Determine Reward Token Rate
                    let rewardToken = 'USD';
                    if (stake.farm_id === 'bitcoin') rewardToken = 'yBTC';
                    if (stake.farm_id === 'ethereum') rewardToken = 'yETH';
                    
                    const tokenRate = RATES[rewardToken] || 1.0;
                    const shareToken = shareUSD / tokenRate;

                    // Update Stake
                    updateStake.run(shareUSD, shareToken, stake.user_id, stake.farm_id);

                    // Update Reserves
                    updateReserves.run(shareUSD, 'fiat_reserves');
                    updateReserves.run(shareUSD, 'fiat_protocol_swap_reserves');
                }
            }
        }

        res.json({ success: true, totalYield: totalYieldGenerated });
    } catch (error: any) {
        console.error("Yield process failed:", error);
        res.status(500).json({ error: "Yield process failed", details: error.message });
    }
  });

  // --- API Routes ---





  // Chainlink Automation: Run Daily Reserve Schedule
  app.post("/api/chainlink/automation/run", (req, res) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const schedule: Record<string, string> = {
      'Sunday': 'yXLM',
      'Monday': 'USDY',
      'Tuesday': 'yUSDC',
      'Wednesday': 'USTRY',
      'Thursday': 'USDY',
      'Friday': 'yUSDC',
      'Saturday': 'USTRY'
    };

    // Use simulated day if provided, otherwise current day
    const { simulatedDay } = req.body;
    const todayIndex = new Date().getDay();
    const currentDay = simulatedDay || days[todayIndex];
    const targetAsset = schedule[currentDay];

    // Update Current Reserve Asset
    db.prepare("INSERT INTO protocol_stats (key, value) VALUES ('current_reserve_asset', ?) ON CONFLICT(key) DO UPDATE SET value = ?").run(targetAsset, targetAsset);

    // Calculate Yield (Simulated Daily Rate ~ 5% APY -> 0.0137% Daily)
    const dailyRate = 0.000137;

    // 1. Process Fiat Reserves
    const fiatReservesRow = db.prepare("SELECT value FROM protocol_stats WHERE key = 'fiat_reserves'").get() as any;
    const fiatReserves = fiatReservesRow?.value || 0;
    
    let fiatYield = 0;
    let fiatFounder = 0;
    let fiatReinvest = 0;
    let fiatToSwap = 0;

    if (fiatReserves > 0) {
        fiatYield = fiatReserves * dailyRate;
        
        // Allocation:
        // 25% Founder
        fiatFounder = fiatYield * 0.25;
        // 50% Back to FiatReserves (Compounding)
        fiatReinvest = fiatYield * 0.50;
        // 25% To SwapReserves
        fiatToSwap = fiatYield * 0.25;
    }

    // 2. Process Swap Reserves
    const swapReservesRow = db.prepare("SELECT value FROM protocol_stats WHERE key = 'fiat_protocol_swap_reserves'").get() as any;
    const swapReserves = swapReservesRow?.value || 0;

    let swapYield = 0;
    let swapReinvest = 0;
    let swapFounder = 0;
    let swapToFiat = 0;

    if (swapReserves > 0) {
        swapYield = swapReserves * dailyRate;

        // Allocation:
        // 25% Back to SwapReserves (Compounding)
        swapReinvest = swapYield * 0.25;
        // 25% Founder
        swapFounder = swapYield * 0.25;
        // 50% To FiatReserves
        swapToFiat = swapYield * 0.50;
    }

    // Apply Updates
    const totalFounder = fiatFounder + swapFounder;
    const totalFiatAdd = fiatReinvest + swapToFiat; // 50% of FiatYield + 50% of SwapYield
    const totalSwapAdd = fiatToSwap + swapReinvest; // 25% of FiatYield + 25% of SwapYield

    const updateStmt = db.prepare("UPDATE protocol_stats SET value = value + ? WHERE key = ?");
    
    if (totalFounder > 0) updateStmt.run(totalFounder, 'founder_fees');
    if (totalFiatAdd > 0) updateStmt.run(totalFiatAdd, 'fiat_reserves');
    if (totalSwapAdd > 0) updateStmt.run(totalSwapAdd, 'fiat_protocol_swap_reserves');

    // NEW: Property NFT Equity Yield (25/25/25/25)
    // "when its being held and stored as digital dollars that's when the interest from the digital dollars is allocated"
    // We iterate over Active properties
    const properties = db.prepare("SELECT * FROM properties WHERE status = 'Active'").all() as any[];
    let propertyYieldTotal = 0;

    for (const prop of properties) {
        // Calculate Total "Digital Dollar" Value
        // 1. Equity (Market Cap + Retained Equity)
        const equityValue = (prop.market_cap || 0) + (prop.equity_balance || 0);
        
        // 2. Vault Assets (Only USD-pegged count as "Digital Dollars" for this specific yield?)
        // The prompt says: "allow $BTC to be held as $yBTC... in the propertyNFT equity vault"
        // And "interest from the digital dollars is allocated".
        // We will assume ALL assets in the vault contribute to the "Equity" value for yield generation, 
        // converted to USD.
        const vaultAssets = db.prepare("SELECT currency, amount FROM property_vault WHERE property_id = ?").all(prop.id) as any[];
        let vaultValueUSD = 0;
        
        for (const v of vaultAssets) {
            const r = RATES[v.currency.replace('y', '')] || RATES[v.currency] || 0;
            vaultValueUSD += v.amount * r;
        }

        const totalValue = equityValue + vaultValueUSD;

        if (totalValue > 0) {
            // Yield Rate (Simulated ~5% APY -> 0.0137% Daily)
            const yieldAmount = totalValue * dailyRate;
            propertyYieldTotal += yieldAmount;

            // Allocation: 25/25/25/25
            const share = yieldAmount * 0.25;

            // 1. 25% to Owner (Digital Dollars -> USD balance)
            db.prepare(`
                INSERT INTO balances (user_id, currency, amount) 
                VALUES (?, 'USD', ?) 
                ON CONFLICT(user_id, currency) DO UPDATE SET amount = amount + ?
            `).run(prop.user_id, share, share);

            // 2. 25% to Property Equity (Retained in Property)
            db.prepare("UPDATE properties SET equity_balance = equity_balance + ? WHERE id = ?").run(share, prop.id);

            // 3. 25% to Fiat Reserves
            db.prepare("UPDATE protocol_stats SET value = value + ? WHERE key = 'fiat_reserves'").run(share);

            // 4. 25% to Fiat Protocol Swap Reserves
            db.prepare("UPDATE protocol_stats SET value = value + ? WHERE key = 'fiat_protocol_swap_reserves'").run(share);
            
            // Log
            // db.prepare("INSERT INTO transactions ...") // Optional: Log yield
        }
    }

    // NEW: Yield for Asset-Backed Tokens (yBTC, yETH, yXLM, yUSDC)
    // Rule: 50% to FiatReserves, 50% to Token Holders
    const yieldAssets = ['yBTC', 'yETH', 'yXLM', 'yUSDC'];
    const assetYieldResults: any = {};

    for (const asset of yieldAssets) {
        // 1. Get Total User Holdings
        const totalHeldRow = db.prepare("SELECT SUM(amount) as total FROM balances WHERE currency = ?").get(asset) as any;
        const totalHeld = totalHeldRow?.total || 0;

        if (totalHeld > 0) {
            // Calculate Yield (Simulated APY varies, using dailyRate for simplicity or specific rates)
            // Let's assume a base daily rate for these assets, e.g., staking yield ~4% APY -> 0.000109 daily
            const assetDailyRate = 0.000109; 
            const totalYieldAmount = totalHeld * assetDailyRate;

            // Allocation
            const toReserves = totalYieldAmount * 0.50;
            const toHolders = totalYieldAmount * 0.50;

            // 1. Distribute to Fiat Reserves (Converted to USD Value)
            // We need the rate of the asset to convert to USD for the reserves
            const rate = RATES[asset.replace('y', '')] || RATES[asset] || 0; // yBTC -> BTC rate
            const toReservesUSD = toReserves * rate;
            
            if (toReservesUSD > 0) {
                 db.prepare("UPDATE protocol_stats SET value = value + ? WHERE key = 'fiat_reserves'").run(toReservesUSD);
            }

            // 2. Distribute to Holders (Increase their balance)
            // Math: new_amount = amount + amount * (toHolders / totalHeld) = amount * (1 + toHolders/totalHeld)
            const yieldFactor = 1 + (toHolders / totalHeld);
            
            db.prepare("UPDATE balances SET amount = amount * ? WHERE currency = ?").run(yieldFactor, asset);
            
            assetYieldResults[asset] = {
                totalHeld,
                yieldGenerated: totalYieldAmount,
                toReservesUSD,
                toHolders
            };
        }
    }

    res.json({
        success: true,
        day: currentDay,
        asset: targetAsset,
        yields: {
            fiatReserves: {
                total: fiatYield,
                founder: fiatFounder,
                reinvest: fiatReinvest,
                toSwap: fiatToSwap
            },
            swapReserves: {
                total: swapYield,
                reinvest: swapReinvest,
                founder: swapFounder,
                toFiat: swapToFiat
            },
            assetYields: assetYieldResults
        },
        newBalances: {
            fiatReserves: (db.prepare("SELECT value FROM protocol_stats WHERE key = 'fiat_reserves'").get() as any).value,
            swapReserves: (db.prepare("SELECT value FROM protocol_stats WHERE key = 'fiat_protocol_swap_reserves'").get() as any).value,
            founderFees: (db.prepare("SELECT value FROM protocol_stats WHERE key = 'founder_fees'").get() as any).value
        }
    });
  });

  // BTC Migration Endpoint
  app.post("/api/btc/migrate", (req, res) => {
    const { address, amount } = req.body;
    const user = db.prepare("SELECT id FROM users WHERE address = ?").get(address) as any;
    if (!user) return res.status(404).json({ error: "User not found" });

    // 1. Check if user has BTC balance (simulated L1 balance)
    // For this simulation, we'll assume the user has some BTC on L1.
    // We'll just process the migration and credit yBTC on Soroban.
    
    const btcRate = RATES['BTC'];
    const yBtcRate = RATES['yBTC'];
    
    // Migration logic: 1 BTC L1 = 1 yBTC Soroban (minus a small fee)
    const fee = 0.0001; // 0.01% fee
    const netAmount = amount * (1 - fee);
    const received = netAmount * (btcRate / yBtcRate);

    // 2. Credit yBTC Balance
    db.prepare(`
        INSERT INTO balances (user_id, currency, amount) 
        VALUES (?, 'yBTC', ?) 
        ON CONFLICT(user_id, currency) DO UPDATE SET amount = amount + ?
    `).run(user.id, received, received);

    // 3. Log Transaction
    const timestamp = new Date().toISOString();
    db.prepare("INSERT INTO transactions (user_id, type, from_currency, to_currency, amount_in, amount_out, timestamp) VALUES (?, 'BTC_MIGRATION', 'BTC_L1', 'yBTC', ?, ?, ?)").run(user.id, amount, received, timestamp);

    res.json({ 
      success: true, 
      amount, 
      received, 
      dlcProof: `DLC-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      timestamp 
    });
  });

  // Security Audit Simulation
  app.get("/api/security/audit", (req, res) => {
    const auditResults = [
      {
        id: 'AUTH-001',
        category: 'Access Control',
        name: 'Management Dashboard Access',
        status: 'CRITICAL',
        description: 'Management dashboard is currently accessible to all connected wallets. Role-Based Access Control (RBAC) is missing.',
        recommendation: 'Implement "Owner" role check. Only allow specific addresses to access management features.'
      },
      {
        id: 'DATA-002',
        category: 'Data Privacy',
        name: 'PII Encryption (At Rest)',
        status: 'WARNING',
        description: 'Employee SSN and DOB are stored in the database. While "Hybrid" visibility is simulated, database-level encryption is not fully enforced.',
        recommendation: 'Implement AES-256 encryption for sensitive columns in the SQLite database.'
      },
      {
        id: 'ORACLE-003',
        category: 'Oracle Security',
        name: 'Price Feed Redundancy',
        status: 'PASS',
        description: 'Protocol uses multiple oracle sources (Chainlink, Band, etc.) for price aggregation.',
        recommendation: 'None. Redundancy is sufficient.'
      },
      {
        id: 'CONTRACT-004',
        category: 'Smart Contract',
        name: 'Reentrancy Protection',
        status: 'PASS',
        description: 'Mint and Swap functions follow Checks-Effects-Interactions pattern.',
        recommendation: 'None.'
      },
      {
        id: 'API-005',
        category: 'Infrastructure',
        name: 'API Rate Limiting',
        status: 'FAIL',
        description: 'No rate limiting detected on API endpoints. Vulnerable to DDoS.',
        recommendation: 'Implement rate limiting middleware (e.g., 100 req/min per IP).'
      },
      {
        id: 'CCIP-006',
        category: 'Cross-Chain',
        name: 'Bridge Cap Limits',
        status: 'WARNING',
        description: 'No maximum transaction limit set for CCIP transfers.',
        recommendation: 'Set a max cap per transaction (e.g., $10,000) to limit risk exposure.'
      }
    ];

    res.json({ success: true, timestamp: new Date().toISOString(), results: auditResults });
  });

  app.get("/api/config", (req, res) => {
    res.json({ tokens: TOKENS });
  });

  app.get("/api/rates", (req, res) => {
    res.json(RATES);
  });

  // Get User Balance
  app.get("/api/user/:address", (req, res) => {
    const { address } = req.params;
    let user = db.prepare("SELECT * FROM users WHERE address = ?").get(address) as any;
    
    if (!user) {
      const info = db.prepare("INSERT INTO users (address) VALUES (?)").run(address);
      user = { id: info.lastInsertRowid, address };
    }

    const balances = db.prepare("SELECT currency, amount FROM balances WHERE user_id = ?").all(user.id);
    res.json({ user, balances });
  });

  // Get User Transactions
  app.get("/api/transactions/:address", (req, res) => {
    const { address } = req.params;
    const user = db.prepare("SELECT id FROM users WHERE address = ?").get(address) as any;
    
    if (!user) {
      return res.json([]);
    }

    const transactions = db.prepare("SELECT * FROM transactions WHERE user_id = ? ORDER BY timestamp DESC LIMIT 50").all(user.id);
    res.json(transactions);
  });

  // Mint Generic Fiat (Simulation of on-ramping)
  app.post("/api/mint", (req, res) => {
    const { address, currency, amount } = req.body;
    // Validate currency is one of the supported ones
    const allowedCurrencies = [
      'USD', 'EUR', 'JPY', 'MXN', 
      'XLM', 'USDC', 'PYUSD', 'BTC', 'BTC_LN', 'SHX', 'AQUA', 
      'yUSDC', 'yETH', 'yBTC', 'yXLM', 'USDY', 'ONDO', 'USTRY',
      'ETH', 'USDT', 'USDC_EVM', 'USDC_SOL', 'USDC_CRO'
    ];
    if (!allowedCurrencies.includes(currency)) {
      return res.status(400).json({ error: "Invalid currency" });
    }

    const user = db.prepare("SELECT id FROM users WHERE address = ?").get(address) as any;
    if (!user) return res.status(404).json({ error: "User not found" });

    // Fee Calculation: $0.01 USD
    const rates = RATES;
    const rate = rates[currency] || 0;
    if (rate === 0) return res.status(400).json({ error: "Invalid currency rate" });

    const feeInUSD = 0.01;
    const feeInCurrency = feeInUSD / rate;

    if (amount <= feeInCurrency) {
        return res.status(400).json({ error: "Amount too small to cover $0.01 transaction fee" });
    }

    const netAmount = amount - feeInCurrency;

    // Update Founder Fees
    db.prepare("UPDATE protocol_stats SET value = value + ? WHERE key = 'founder_fees'").run(feeInUSD);

    // --- ASYNC SWAP LOGIC ---
    // Map input currency to target yield-bearing asset
    const asyncSwapMap: Record<string, string> = {
        'BTC': 'yBTC',
        'BTC_LN': 'yBTC',
        'ETH': 'yETH',
        'XLM': 'yXLM',
        'USDC': 'yUSDC',
        'USDC_EVM': 'yUSDC',
        'USDC_SOL': 'yUSDC',
        'USDC_CRO': 'yUSDC',
        'PYUSD': 'yUSDC',
        'USDT': 'yUSDC'
    };

    const targetCurrency = asyncSwapMap[currency];

    if (targetCurrency) {
        // 1. Calculate USD Value of Input (Intermediate Step 1)
        const usdValue = netAmount * rate;
        
        // 2. Calculate Target Amount (Intermediate Step 2)
        const targetRate = rates[targetCurrency];
        const targetAmount = usdValue / targetRate;

        // 3. Credit Target Asset
        db.prepare(`
            INSERT INTO balances (user_id, currency, amount) 
            VALUES (?, ?, ?) 
            ON CONFLICT(user_id, currency) DO UPDATE SET amount = amount + ?
        `).run(user.id, targetCurrency, targetAmount, targetAmount);

        // 4. Record Transactions to show the path
        const timestamp = new Date().toISOString();
        
        // Transaction 1: Mint Original
        db.prepare("INSERT INTO transactions (user_id, type, from_currency, to_currency, amount_in, amount_out, timestamp) VALUES (?, 'MINT', 'EXTERNAL', ?, ?, ?, ?)").run(user.id, currency, amount, netAmount, timestamp);

        // Transaction 2: Swap to USDC (Implicit Intermediate)
        // We log this to show the path: BTC -> USDC
        db.prepare("INSERT INTO transactions (user_id, type, from_currency, to_currency, amount_in, amount_out, timestamp) VALUES (?, 'AUTO_SWAP', ?, 'USDC', ?, ?, ?)").run(user.id, currency, netAmount, usdValue, timestamp);

        // Transaction 3: Swap to Target (yBTC)
        // Path: USDC -> yBTC
        db.prepare("INSERT INTO transactions (user_id, type, from_currency, to_currency, amount_in, amount_out, timestamp) VALUES (?, 'AUTO_SWAP', 'USDC', ?, ?, ?, ?)").run(user.id, targetCurrency, usdValue, targetAmount, timestamp);

        return res.json({ 
            success: true, 
            newBalance: targetAmount, 
            currency: targetCurrency,
            message: `Async Swap Executed: ${currency} -> USDC -> ${targetCurrency}` 
        });

    } else {
        // Standard Mint (No Async Swap)
        const current = db.prepare("SELECT amount FROM balances WHERE user_id = ? AND currency = ?").get(user.id, currency) as any;
        const newAmount = (current?.amount || 0) + netAmount;
        
        db.prepare(`
          INSERT INTO balances (user_id, currency, amount) 
          VALUES (?, ?, ?) 
          ON CONFLICT(user_id, currency) DO UPDATE SET amount = ?
        `).run(user.id, currency, netAmount, newAmount);

        db.prepare("INSERT INTO transactions (user_id, type, to_currency, amount_out) VALUES (?, 'MINT', ?, ?)").run(user.id, currency, netAmount);

        return res.json({ success: true, newBalance: newAmount, fee: feeInCurrency });
    }
  });

  // Withdraw / Send (Async Swap Egress)
  app.post("/api/withdraw", (req, res) => {
    const { address, toAddress, currency, amount } = req.body; // currency is what the user wants to SEND (e.g. BTC)
    
    const user = db.prepare("SELECT id FROM users WHERE address = ?").get(address) as any;
    if (!user) return res.status(404).json({ error: "User not found" });

    // Map requested output currency to held yield-bearing asset
    const reverseSwapMap: Record<string, string> = {
        'BTC': 'yBTC',
        'BTC_LN': 'yBTC',
        'ETH': 'yETH',
        'XLM': 'yXLM',
        'USDC': 'yUSDC',
        'PYUSD': 'yUSDC',
        'USDT': 'yUSDC',
        'USDC_EVM': 'yUSDC',
        'USDC_SOL': 'yUSDC',
        'USDC_CRO': 'yUSDC'
    };

    const sourceCurrency = reverseSwapMap[currency] || currency; // If no map, assume holding raw asset

    // Check Balance of Source
    const balanceRow = db.prepare("SELECT amount FROM balances WHERE user_id = ? AND currency = ?").get(user.id, sourceCurrency) as any;
    
    // We need to calculate how much Source is needed to send 'amount' of Target
    const rates = RATES;
    const targetRate = rates[currency];
    const sourceRate = rates[sourceCurrency];

    if (!targetRate || !sourceRate) return res.status(400).json({ error: "Invalid currency rates" });

    // Value to send in USD
    const valueInUSD = amount * targetRate;
    
    // Amount of Source needed
    const amountSourceNeeded = valueInUSD / sourceRate;

    if (!balanceRow || balanceRow.amount < amountSourceNeeded) {
        return res.status(400).json({ error: `Insufficient balance. You hold ${sourceCurrency}, but need ${amountSourceNeeded.toFixed(6)} to send ${amount} ${currency}` });
    }

    // Execute Withdraw
    const timestamp = new Date().toISOString();

    // 1. Deduct Source
    db.prepare("UPDATE balances SET amount = amount - ? WHERE user_id = ? AND currency = ?").run(amountSourceNeeded, user.id, sourceCurrency);

    // 2. Log Transactions
    if (sourceCurrency !== currency) {
        // Log the swap path: yBTC -> USDC -> BTC
        db.prepare("INSERT INTO transactions (user_id, type, from_currency, to_currency, amount_in, amount_out, timestamp) VALUES (?, 'AUTO_SWAP', ?, 'USDC', ?, ?, ?)").run(user.id, sourceCurrency, amountSourceNeeded, valueInUSD, timestamp);
        db.prepare("INSERT INTO transactions (user_id, type, from_currency, to_currency, amount_in, amount_out, timestamp) VALUES (?, 'AUTO_SWAP', 'USDC', ?, ?, ?, ?)").run(user.id, currency, valueInUSD, amount, timestamp);
    }

    // 3. Log Send
    db.prepare("INSERT INTO transactions (user_id, type, from_currency, to_currency, amount_out, timestamp) VALUES (?, 'SEND', ?, ?, ?, ?)").run(user.id, currency, toAddress, amount, timestamp);

    res.json({ success: true, sentAmount: amount, sentCurrency: currency, deductedAmount: amountSourceNeeded, deductedCurrency: sourceCurrency });
  });

  // Swap Generic Fiat/Token to Specific Digital Token
  // Logic: Token -> yUSDC -> Digital Token
  app.post("/api/swap-to-token", (req, res) => {
    const { address, fromCurrency, tokenId, amount } = req.body; // amount is quantity of tokens to buy
    
    const tokenDef = TOKENS.find(t => t.id === tokenId);
    if (!tokenDef) return res.status(400).json({ error: "Invalid token ID" });

    const user = db.prepare("SELECT id FROM users WHERE address = ?").get(address) as any;
    if (!user) return res.status(404).json({ error: "User not found" });

    // 1. Calculate Cost in yUSDC
    // Exchange Rates (Mock)
    const rates = RATES;

    const tokenBaseRate = rates[tokenDef.type]; // e.g. 1.08 for EUR
    const costPerTokenInUSD = tokenDef.val * tokenBaseRate; // e.g. 10 Euro * 1.08 = 10.8 USD
    const totalCostInUSD = costPerTokenInUSD * amount;

    // 2. Check User Balance of Source Currency
    const sourceRate = rates[fromCurrency];
    if (!sourceRate) return res.status(400).json({ error: "Invalid source currency" });

    // How much source currency is needed?
    // Cost in USD / Source Rate = Amount of Source
    const requiredSourceAmount = totalCostInUSD / sourceRate;

    // Fee Calculation: $0.01 USD added to COST
    const feeInUSD = 0.01;
    const feeInSource = feeInUSD / sourceRate;
    const totalRequiredSource = requiredSourceAmount + feeInSource;

    const balanceRow = db.prepare("SELECT amount FROM balances WHERE user_id = ? AND currency = ?").get(user.id, fromCurrency) as any;
    if (!balanceRow || balanceRow.amount < totalRequiredSource) {
      return res.status(400).json({ error: `Insufficient ${fromCurrency} balance. Need ${totalRequiredSource.toFixed(2)} (incl. fee)` });
    }

    // 3. Execute Swap
    // Deduct Source
    db.prepare("UPDATE balances SET amount = amount - ? WHERE user_id = ? AND currency = ?").run(totalRequiredSource, user.id, fromCurrency);
    
    // Credit Founder Fees (Initial Transaction Fee)
    db.prepare("UPDATE protocol_stats SET value = value + ? WHERE key = 'founder_fees'").run(feeInUSD);

    // Credit Digital Token
    const tokenRow = db.prepare("SELECT amount FROM balances WHERE user_id = ? AND currency = ?").get(user.id, tokenDef.symbol) as any;
    const newTokenBalance = (tokenRow?.amount || 0) + amount;

    db.prepare(`
      INSERT INTO balances (user_id, currency, amount) 
      VALUES (?, ?, ?) 
      ON CONFLICT(user_id, currency) DO UPDATE SET amount = ?
    `).run(user.id, tokenDef.symbol, amount, newTokenBalance);

    // Update Protocol Stats (Total yUSDC locked)
    db.prepare("UPDATE protocol_stats SET value = value + ? WHERE key = 'total_usdy_supply'").run(totalCostInUSD);

    // --- BUYBACK & BURN LOGIC (FiatSwapReserves) ---
    // Triggered for specific "Buyback" tokens
    const buybackTokens = ['BTC', 'ETH', 'XLM', 'BNB', 'CRO', 'ICP', 'ARB', 'LINK', 'SOL', 'WLFI'];
    
    if (buybackTokens.includes(fromCurrency)) {
        // The protocol "bought" 'totalRequiredSource' amount of 'fromCurrency' (e.g. BTC)
        // It now holds this asset.
        // Logic: Async Swap 'fromCurrency' -> Digital Dollar ($USDY)
        // We simulate this by taking the USD value of the trade (totalCostInUSD) and allocating it.
        
        const buybackValueUSD = totalCostInUSD; // Simplified: We assume instant conversion at spot rate

        // Allocation:
        // 25% Founder
        const founderAlloc = buybackValueUSD * 0.25;
        // 25% Native Token Holders (yUSDC holders)
        const holdersAlloc = buybackValueUSD * 0.25;
        // 25% FiatReserves
        const fiatReservesAlloc = buybackValueUSD * 0.25;
        // 25% Reinvested in FiatSwapReserves as yXLM
        const swapReservesAlloc = buybackValueUSD * 0.25;

        // 1. Founder
        db.prepare("UPDATE protocol_stats SET value = value + ? WHERE key = 'founder_fees'").run(founderAlloc);

        // 2. FiatReserves
        db.prepare("UPDATE protocol_stats SET value = value + ? WHERE key = 'fiat_reserves'").run(fiatReservesAlloc);

        // 3. FiatSwapReserves (Tracked as value, conceptually yXLM)
        db.prepare("UPDATE protocol_stats SET value = value + ? WHERE key = 'fiat_protocol_swap_reserves'").run(swapReservesAlloc);

        // 4. Native Token Holders (Distribute yUSDC)
        // Reuse distribution logic (simplified here for inline execution)
        const totalBackedValue = db.prepare("SELECT value FROM protocol_stats WHERE key = 'total_usdy_supply'").get() as any;
        if (totalBackedValue.value > 0) {
             const allBalances = db.prepare("SELECT user_id, currency, amount FROM balances WHERE amount > 0").all() as any[];
             const userShares: Record<number, number> = {};
             
             // Calculate user shares based on Digital Token holdings
             for (const bal of allBalances) {
                const tDef = TOKENS.find(t => t.symbol === bal.currency);
                if (tDef) {
                   const r = rates[tDef.type] || 0;
                   const val = bal.amount * tDef.val * r;
                   userShares[bal.user_id] = (userShares[bal.user_id] || 0) + val;
                }
             }

             const distributeStmt = db.prepare(`
                INSERT INTO balances (user_id, currency, amount) 
                VALUES (?, 'yUSDC', ?) 
                ON CONFLICT(user_id, currency) DO UPDATE SET amount = amount + ?
             `);

             for (const [uId, usdVal] of Object.entries(userShares)) {
                const share = (usdVal / totalBackedValue.value) * holdersAlloc;
                if (share > 0) {
                    distributeStmt.run(uId, share, share);
                    // Log Yield Transaction
                    db.prepare("INSERT INTO transactions (user_id, type, to_currency, amount_out) VALUES (?, 'YIELD', 'yUSDC', ?)").run(uId, share);
                }
             }
        }
    }

    // Record Transaction
    db.prepare(`
      INSERT INTO transactions (user_id, type, from_currency, to_currency, amount_in, amount_out) 
      VALUES (?, 'SWAP', ?, ?, ?, ?)
    `).run(user.id, fromCurrency, tokenDef.symbol, totalRequiredSource, amount);

    res.json({ success: true, tokensReceived: amount, costInUsd: totalCostInUSD, fee: feeInSource });
  });

  // Simulate Yield Distribution
  // 50% Reserves, 20% Founder, 30% Token Holder (Paid in yUSDC)
  app.post("/api/distribute-yield", (req, res) => {
    const { yieldAmount } = req.body; // Total yield generated in yUSDC
    
    const reservesShare = yieldAmount * 0.50;
    const founderShare = yieldAmount * 0.20;
    const holdersShare = yieldAmount * 0.30;

    // Update Protocol Stats
    db.prepare("UPDATE protocol_stats SET value = value + ? WHERE key = 'fiat_reserves'").run(reservesShare);
    db.prepare("UPDATE protocol_stats SET value = value + ? WHERE key = 'founder_fees'").run(founderShare);

    // Distribute to Holders
    // We need to find all holders of ANY Digital Token
    // And calculate their share of the total backing pool
    
    const totalBackedValue = db.prepare("SELECT value FROM protocol_stats WHERE key = 'total_usdy_supply'").get() as any;
    
    if (totalBackedValue.value > 0) {
      // Get all balances
      const allBalances = db.prepare("SELECT user_id, currency, amount FROM balances WHERE amount > 0").all() as any[];
      
      // Filter for Digital Tokens and calculate their USD value
      const rates = RATES;
      
      const userShares: Record<number, number> = {}; // user_id -> usd value held

      for (const bal of allBalances) {
        const tokenDef = TOKENS.find(t => t.symbol === bal.currency);
        if (tokenDef) {
           const rate = rates[tokenDef.type] || 0;
           const valueInUsd = bal.amount * tokenDef.val * rate;
           userShares[bal.user_id] = (userShares[bal.user_id] || 0) + valueInUsd;
        }
      }

      // Distribute yUSDC to users
      const distributeStmt = db.prepare(`
        INSERT INTO balances (user_id, currency, amount) 
        VALUES (?, 'yUSDC', ?) 
        ON CONFLICT(user_id, currency) DO UPDATE SET amount = amount + ?
      `);

      for (const [userId, usdValue] of Object.entries(userShares)) {
        const share = (usdValue / totalBackedValue.value) * holdersShare;
        if (share > 0) {
          distributeStmt.run(userId, share, share);
          // Log Yield Transaction
          db.prepare("INSERT INTO transactions (user_id, type, to_currency, amount_out) VALUES (?, 'YIELD', 'yUSDC', ?)").run(userId, share);
        }
      }
    }

    res.json({ 
      success: true, 
      distribution: {
        reserves: reservesShare,
        founder: founderShare,
        holders: holdersShare
      }
    });
  });

  // Generate Integration API Key & Mapped Address
  app.post("/api/integrate", (req, res) => {
    const { address, label, appFee } = req.body;
    
    // Validate appFee
    if (appFee && (isNaN(Number(appFee)) || Number(appFee) < 0 || Number(appFee) > 25)) {
        return res.status(400).json({ error: "Ecosystem App Fee must be between 0 and 25%" });
    }
    
    const user = db.prepare("SELECT id FROM users WHERE address = ?").get(address) as any;
    if (!user) return res.status(404).json({ error: "User not found" });

    // Generate a mock API Key and Mapped Address
    const apiKey = `fp_live_${Math.random().toString(36).substring(2, 18)}`;
    const mappedAddress = `M${Math.random().toString(36).substring(2, 15).toUpperCase()}`; // 'M' for Mapped
    const digitalFiatContract = `C${Math.random().toString(36).substring(2, 15).toUpperCase()}`; // 'C' for Contract
    
    // Generate Processor IDs
    const paymentProcessorId = `pp_${Math.random().toString(36).substring(2, 10)}`;
    const inventoryProcessorId = `inv_${Math.random().toString(36).substring(2, 10)}`;
    const personnelProcessorId = `hr_${Math.random().toString(36).substring(2, 10)}`;

    // In a real app, we would store this in an 'integrations' table
    // db.prepare("INSERT INTO integrations ...").run(...)

    res.json({ 
      success: true, 
      apiKey, 
      mappedAddress,
      digitalFiatContract,
      processors: {
        payment: {
            id: paymentProcessorId,
            status: 'active',
            capabilities: ['digital_dollar_settlement', 'cross_border_fiat', 'merchant_services']
        },
        inventory: {
            id: inventoryProcessorId,
            status: 'active',
            capabilities: ['real_time_sync', 'asset_tokenization', 'supply_chain_tracking']
        },
        personnel: {
            id: personnelProcessorId,
            status: 'active',
            capabilities: ['payroll_streaming', 'tax_compliance', 'benefits_management']
        }
      },
      config: {
        fiatReserves: "20%",
        founderFee: "5%",
        holderYield: `${75 - (Number(appFee) || 0)}%`, // Enforcing the >= 50% rule
        ecosystemAppFee: appFee ? `${appFee}%` : "0%",
        immutableAllocations: {
            digitalDollars: true,
            transactionFee: "$0.01 USD"
        }
      }
    });
  });

  // Simulate Token Recovery (Security Feature)
  app.post("/api/simulate-recovery", (req, res) => {
    const { address } = req.body;
    const user = db.prepare("SELECT id FROM users WHERE address = ?").get(address) as any;
    if (!user) return res.status(404).json({ error: "User not found" });

    // Simulate a wrong token sent (e.g., 0.5 ETH sent to a Solana address)
    const lostToken = "ETH (Wrong Chain)";
    const lostAmount = 0.5;
    const recoveryRate = 3200; // ETH price
    const recoveredValue = lostAmount * recoveryRate; // 1600 USDC

    // Credit 'USD' (Digital Dollar)
    const currency = 'USD';

    db.prepare(`
      INSERT INTO balances (user_id, currency, amount) 
      VALUES (?, ?, ?) 
      ON CONFLICT(user_id, currency) DO UPDATE SET amount = amount + ?
    `).run(user.id, currency, recoveredValue, recoveredValue);

    db.prepare(`
      INSERT INTO transactions (user_id, type, from_currency, to_currency, amount_in, amount_out) 
      VALUES (?, 'RECOVERY', ?, ?, ?, ?)
    `).run(user.id, lostToken, currency, lostAmount, recoveredValue);

    res.json({ success: true, recoveredValue, lostToken, lostAmount });
  });

  app.get("/api/stats", (req, res) => {
    const stats = db.prepare("SELECT * FROM protocol_stats").all();
    const statsObj: any = {};
    stats.forEach((s: any) => statsObj[s.key] = s.value);
    res.json(statsObj);
  });

  // --- Management Endpoints ---

  // Get Management Data
  app.get("/api/management/:address", (req, res) => {
    const { address } = req.params;
    const user = db.prepare("SELECT id FROM users WHERE address = ?").get(address) as any;
    if (!user) return res.status(404).json({ error: "User not found" });

    const inventory = db.prepare("SELECT * FROM inventory WHERE user_id = ?").all(user.id);
    const assetSettings = db.prepare("SELECT * FROM asset_settings WHERE user_id = ?").all(user.id);
    const employees = db.prepare("SELECT * FROM employees WHERE user_id = ?").all(user.id);
    const properties = db.prepare("SELECT * FROM properties WHERE user_id = ?").all(user.id);
    const balances = db.prepare("SELECT currency, amount FROM balances WHERE user_id = ?").all(user.id);

    res.json({ inventory, assetSettings, employees, properties, balances });
  });

  // Inventory
  app.post("/api/management/inventory/add", (req, res) => {
    const { address, name, description, price, image_url } = req.body;
    const user = db.prepare("SELECT id FROM users WHERE address = ?").get(address) as any;
    if (!user) return res.status(404).json({ error: "User not found" });

    const info = db.prepare("INSERT INTO inventory (user_id, name, description, price, image_url) VALUES (?, ?, ?, ?, ?)").run(user.id, name, description, price, image_url);
    res.json({ success: true, id: info.lastInsertRowid });
  });

  app.post("/api/management/inventory/remove", (req, res) => {
    const { address, id } = req.body;
    const user = db.prepare("SELECT id FROM users WHERE address = ?").get(address) as any;
    if (!user) return res.status(404).json({ error: "User not found" });

    db.prepare("DELETE FROM inventory WHERE id = ? AND user_id = ?").run(id, user.id);
    res.json({ success: true });
  });

  // Asset Settings
  app.post("/api/management/assets/toggle", (req, res) => {
    const { address, asset_code, enabled } = req.body;
    const user = db.prepare("SELECT id FROM users WHERE address = ?").get(address) as any;
    if (!user) return res.status(404).json({ error: "User not found" });

    db.prepare(`
      INSERT INTO asset_settings (user_id, asset_code, enabled) 
      VALUES (?, ?, ?) 
      ON CONFLICT(user_id, asset_code) DO UPDATE SET enabled = ?
    `).run(user.id, asset_code, enabled ? 1 : 0, enabled ? 1 : 0);
    
    res.json({ success: true });
  });

  // Employees
  app.post("/api/management/employees/add", (req, res) => {
    const { address, name, dob, ssn, image_url, occupation, pay_rate, description } = req.body;
    const user = db.prepare("SELECT id FROM users WHERE address = ?").get(address) as any;
    if (!user) return res.status(404).json({ error: "User not found" });

    const info = db.prepare(`
      INSERT INTO employees (user_id, name, dob, ssn, image_url, occupation, pay_rate, description) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(user.id, name, dob, ssn, image_url, occupation, pay_rate, description);
    
    res.json({ success: true, id: info.lastInsertRowid });
  });

  app.post("/api/management/employees/remove", (req, res) => {
    const { address, id, termination_date } = req.body;
    const user = db.prepare("SELECT id FROM users WHERE address = ?").get(address) as any;
    if (!user) return res.status(404).json({ error: "User not found" });

    db.prepare("UPDATE employees SET status = 'Terminated', termination_date = ? WHERE id = ? AND user_id = ?").run(termination_date, id, user.id);
    res.json({ success: true });
  });

  // Properties
  app.post("/api/management/properties/add", (req, res) => {
    const { address, property_address, description, market_cap, image_url, apn, title_number, zoning, jurisdiction } = req.body;
    const user = db.prepare("SELECT id FROM users WHERE address = ?").get(address) as any;
    if (!user) return res.status(404).json({ error: "User not found" });

    const info = db.prepare(`
      INSERT INTO properties (user_id, address, description, market_cap, image_url, apn, title_number, zoning, jurisdiction) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(user.id, property_address, description, market_cap, image_url, apn, title_number, zoning, jurisdiction);
    
    res.json({ success: true, id: info.lastInsertRowid });
  });

  // Deposit into Property Vault
  app.post("/api/properties/deposit", (req, res) => {
    const { address, property_id, currency, amount } = req.body;
    const user = db.prepare("SELECT id FROM users WHERE address = ?").get(address) as any;
    if (!user) return res.status(404).json({ error: "User not found" });

    const property = db.prepare("SELECT * FROM properties WHERE id = ? AND user_id = ?").get(property_id, user.id);
    if (!property) return res.status(404).json({ error: "Property not found" });

    // Check User Balance
    const balanceRow = db.prepare("SELECT amount FROM balances WHERE user_id = ? AND currency = ?").get(user.id, currency) as any;
    if (!balanceRow || balanceRow.amount < amount) {
        return res.status(400).json({ error: "Insufficient balance" });
    }

    // Conversion Logic
    // BTC -> yBTC, ETH -> yETH, XLM -> yXLM
    // USDC, USDT, PYUSD -> USD (Digital Dollars)
    const conversionMap: Record<string, string> = {
        'BTC': 'yBTC', 'BTC_LN': 'yBTC',
        'ETH': 'yETH',
        'XLM': 'yXLM',
        'USDC': 'USD', 'USDT': 'USD', 'PYUSD': 'USD', 'USD': 'USD',
        'yBTC': 'yBTC', 'yETH': 'yETH', 'yXLM': 'yXLM', 'yUSDC': 'USD'
    };

    const targetCurrency = conversionMap[currency];
    if (!targetCurrency) {
        return res.status(400).json({ error: "Unsupported currency for vault deposit" });
    }

    let targetAmount = amount;

    // Execute Deposit
    const depositStmt = db.transaction(() => {
        // 1. Deduct from User
        db.prepare("UPDATE balances SET amount = amount - ? WHERE user_id = ? AND currency = ?").run(amount, user.id, currency);

        // 2. Add to Property Vault
        // If converting (e.g. USDC -> USD), rate is 1:1 for stablecoins usually, but let's check RATES
        // For BTC -> yBTC, it's 1:1 amount (just wrapped)
        // For USDC -> USD, it's 1:1
        
        // Add to Vault
        db.prepare(`
            INSERT INTO property_vault (property_id, currency, amount) 
            VALUES (?, ?, ?) 
            ON CONFLICT(property_id, currency) DO UPDATE SET amount = amount + ?
        `).run(property.id, targetCurrency, targetAmount, targetAmount);

        // Reactivate Property if it was Swapped (to resume yield)
        if (property.status !== 'Active') {
            db.prepare("UPDATE properties SET status = 'Active' WHERE id = ?").run(property.id);
        }

        // 3. Log Transaction
        db.prepare("INSERT INTO transactions (user_id, type, from_currency, to_currency, amount_in, amount_out, timestamp) VALUES (?, 'DEPOSIT_VAULT', ?, ?, ?, ?, ?)").run(user.id, currency, `VAULT_${targetCurrency}`, amount, targetAmount, new Date().toISOString());
    });

    depositStmt();
    res.json({ success: true, deposited: targetAmount, currency: targetCurrency });
  });

  app.post("/api/management/properties/swap", (req, res) => {
    const { address, property_id, target_asset } = req.body;
    const user = db.prepare("SELECT id FROM users WHERE address = ?").get(address) as any;
    if (!user) return res.status(404).json({ error: "User not found" });

    const property = db.prepare("SELECT * FROM properties WHERE id = ? AND user_id = ? AND status = 'Active'").get(property_id, user.id) as any;
    if (!property) return res.status(404).json({ error: "Property not found or already swapped" });

    // Calculate Total Value to Swap
    // 1. Equity
    const equityValue = (property.market_cap || 0) + (property.equity_balance || 0);
    
    // 2. Vault Assets
    const vaultAssets = db.prepare("SELECT currency, amount FROM property_vault WHERE property_id = ?").all(property_id) as any[];
    let vaultValueUSD = 0;
    for (const v of vaultAssets) {
        const r = RATES[v.currency.replace('y', '')] || RATES[v.currency] || 0;
        vaultValueUSD += v.amount * r;
    }

    const totalValueUSD = equityValue + vaultValueUSD;

    // Fee: $0.01 USD
    const feeUSD = 0.01;
    const netValueUSD = totalValueUSD - feeUSD;

    if (netValueUSD <= 0) {
        return res.status(400).json({ error: "Property value too low to cover transaction fee" });
    }

    // Update Protocol Stats (Fee)
    db.prepare("UPDATE protocol_stats SET value = value + ? WHERE key = 'founder_fees'").run(feeUSD);

    // Convert Net Value to Target Asset
    const targetAssetCode = target_asset || 'USD';
    const rate = RATES[targetAssetCode];
    if (!rate) return res.status(400).json({ error: "Invalid target asset" });

    const userAllocTarget = netValueUSD / rate;

    // Execute Swap
    const swapStmt = db.transaction(() => {
        // 1. Credit User
        db.prepare(`
            INSERT INTO balances (user_id, currency, amount) 
            VALUES (?, ?, ?) 
            ON CONFLICT(user_id, currency) DO UPDATE SET amount = amount + ?
        `).run(user.id, targetAssetCode, userAllocTarget, userAllocTarget);

        // 2. Update Property Status (Swapped/Inactive)
        // "The interest allocation from their equity will stop until they deposit assets into their propertyNFT equity"
        // This implies the property remains owned but "empty" or "inactive".
        // We'll set status to 'Swapped' (which stops yield in our automation logic)
        // And reset balances.
        db.prepare("UPDATE properties SET status = 'Swapped', equity_balance = 0, market_cap = 0 WHERE id = ?").run(property_id);
        
        // 3. Clear Vault
        db.prepare("DELETE FROM property_vault WHERE property_id = ?").run(property_id);

        // 4. Log Transaction
        db.prepare("INSERT INTO transactions (user_id, type, from_currency, to_currency, amount_in, amount_out, timestamp) VALUES (?, 'SWAP_PROPERTY', 'PROPERTY_FULL', ?, ?, ?, ?)").run(user.id, targetAssetCode, totalValueUSD, userAllocTarget, new Date().toISOString());
    });

    swapStmt();

    res.json({ 
      success: true, 
      swappedValueUSD: totalValueUSD,
      receivedAmount: userAllocTarget,
      receivedCurrency: targetAssetCode,
      feeUSD
    });
  });

  app.post("/api/management/properties/transfer", (req, res) => {
    const { address, property_id, to_address } = req.body;
    const user = db.prepare("SELECT id FROM users WHERE address = ?").get(address) as any;
    if (!user) return res.status(404).json({ error: "User not found" });

    const property = db.prepare("SELECT * FROM properties WHERE id = ? AND user_id = ?").get(property_id, user.id);
    if (!property) return res.status(404).json({ error: "Property not found" });

    // Get/Create Receiver
    let receiver = db.prepare("SELECT id FROM users WHERE address = ?").get(to_address) as any;
    if (!receiver) {
        const info = db.prepare("INSERT INTO users (address) VALUES (?)").run(to_address);
        receiver = { id: info.lastInsertRowid };
    }

    // Transfer Ownership
    db.prepare("UPDATE properties SET user_id = ? WHERE id = ?").run(receiver.id, property_id);

    // Record Transaction
    db.prepare("INSERT INTO transactions (user_id, type, from_currency, to_currency, amount_out, timestamp) VALUES (?, 'TRANSFER_PROPERTY', 'PROPERTY', ?, 0, ?)").run(user.id, to_address, new Date().toISOString());

    res.json({ success: true });
  });

  app.post("/api/management/properties/trade", (req, res) => {
    const { address, property_id, price } = req.body;
    const user = db.prepare("SELECT id FROM users WHERE address = ?").get(address) as any;
    if (!user) return res.status(404).json({ error: "User not found" });

    // Just mark as Listed for now
    db.prepare("UPDATE properties SET status = 'Listed' WHERE id = ? AND user_id = ?").run(property_id, user.id);

    res.json({ success: true, message: "Property listed for trade" });
  });

  // Import & Reconciliation
  app.post("/api/management/import/preview", (req, res) => {
    const { address, importData } = req.body;
    const user = db.prepare("SELECT id FROM users WHERE address = ?").get(address) as any;
    if (!user) return res.status(404).json({ error: "User not found" });

    const currentInventory = db.prepare("SELECT * FROM inventory WHERE user_id = ?").all(user.id) as any[];
    const currentEmployees = db.prepare("SELECT * FROM employees WHERE user_id = ?").all(user.id) as any[];

    // Logic to compare Import vs Current
    // 1. Inventory Reconciliation
    const inventoryDiff = {
      new: [] as any[],
      updated: [] as any[],
      unchanged: [] as any[],
      stats: {
        currentValue: currentInventory.reduce((acc, i) => acc + (i.price || 0), 0),
        importedValue: 0,
        projectedValue: 0
      }
    };

    if (importData.inventory) {
      importData.inventory.forEach((item: any) => {
        inventoryDiff.stats.importedValue += (item.price || 0);
        const existing = currentInventory.find(i => i.name === item.name);
        if (existing) {
          if (existing.price !== item.price || existing.description !== item.description) {
            inventoryDiff.updated.push({ ...item, id: existing.id, oldPrice: existing.price, oldDesc: existing.description });
          } else {
            inventoryDiff.unchanged.push(existing);
          }
        } else {
          inventoryDiff.new.push(item);
        }
      });
      // Projected = Current - Updated(Old) + Updated(New) + New
      // Easier: Projected = Unchanged + Updated(New) + New
      inventoryDiff.stats.projectedValue = 
        inventoryDiff.unchanged.reduce((acc, i) => acc + (i.price || 0), 0) +
        inventoryDiff.updated.reduce((acc, i) => acc + (i.price || 0), 0) +
        inventoryDiff.new.reduce((acc, i) => acc + (i.price || 0), 0);
    }

    // 2. Employee Reconciliation
    const employeeDiff = {
      new: [] as any[],
      updated: [] as any[],
      unchanged: [] as any[],
      stats: {
        currentPayroll: currentEmployees.filter(e => e.status !== 'Terminated').reduce((acc, e) => acc + (e.pay_rate || 0), 0),
        importedPayroll: 0,
        projectedPayroll: 0
      }
    };

    if (importData.employees) {
      importData.employees.forEach((emp: any) => {
        employeeDiff.stats.importedPayroll += (emp.pay_rate || 0);
        const existing = currentEmployees.find(e => e.name === emp.name && e.status !== 'Terminated');
        if (existing) {
          if (existing.pay_rate !== emp.pay_rate || existing.occupation !== emp.occupation) {
            employeeDiff.updated.push({ ...emp, id: existing.id, oldPay: existing.pay_rate, oldOcc: existing.occupation });
          } else {
            employeeDiff.unchanged.push(existing);
          }
        } else {
          employeeDiff.new.push(emp);
        }
      });
      
      employeeDiff.stats.projectedPayroll = 
        employeeDiff.unchanged.reduce((acc, e) => acc + (e.pay_rate || 0), 0) +
        employeeDiff.updated.reduce((acc, e) => acc + (e.pay_rate || 0), 0) +
        employeeDiff.new.reduce((acc, e) => acc + (e.pay_rate || 0), 0);
    }

    res.json({ inventoryDiff, employeeDiff });
  });

  app.post("/api/management/import/apply", (req, res) => {
    const { address, diff } = req.body;
    const user = db.prepare("SELECT id FROM users WHERE address = ?").get(address) as any;
    if (!user) return res.status(404).json({ error: "User not found" });

    const { inventoryDiff, employeeDiff } = diff;

    // Apply Inventory Changes
    const insertInv = db.prepare("INSERT INTO inventory (user_id, name, description, price, image_url) VALUES (?, ?, ?, ?, ?)");
    const updateInv = db.prepare("UPDATE inventory SET price = ?, description = ?, image_url = ? WHERE id = ? AND user_id = ?");

    inventoryDiff.new.forEach((item: any) => insertInv.run(user.id, item.name, item.description, item.price, item.image_url));
    inventoryDiff.updated.forEach((item: any) => updateInv.run(item.price, item.description, item.image_url, item.id, user.id));

    // Apply Employee Changes
    const insertEmp = db.prepare("INSERT INTO employees (user_id, name, dob, ssn, image_url, occupation, pay_rate, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    const updateEmp = db.prepare("UPDATE employees SET pay_rate = ?, occupation = ?, description = ? WHERE id = ? AND user_id = ?");

    employeeDiff.new.forEach((emp: any) => insertEmp.run(user.id, emp.name, emp.dob, emp.ssn, emp.image_url, emp.occupation, emp.pay_rate, emp.description));
    employeeDiff.updated.forEach((emp: any) => updateEmp.run(emp.pay_rate, emp.occupation, emp.description, emp.id, user.id));

    res.json({ success: true });
  });

  // Transfer Assets
  app.post("/api/transfer", (req, res) => {
    const { fromAddress, toAddress, currency, amount } = req.body;
    
    if (!fromAddress || !toAddress || !currency || !amount) {
        return res.status(400).json({ error: "Missing fields" });
    }

    const sender = db.prepare("SELECT id FROM users WHERE address = ?").get(fromAddress) as any;
    if (!sender) return res.status(404).json({ error: "Sender not found" });

    // Check Balance
    const balanceRow = db.prepare("SELECT amount FROM balances WHERE user_id = ? AND currency = ?").get(sender.id, currency) as any;
    if (!balanceRow || balanceRow.amount < amount) {
      return res.status(400).json({ error: "Insufficient balance" });
    }

    // Get or Create Receiver
    let receiver = db.prepare("SELECT id FROM users WHERE address = ?").get(toAddress) as any;
    if (!receiver) {
        const info = db.prepare("INSERT INTO users (address) VALUES (?)").run(toAddress);
        receiver = { id: info.lastInsertRowid };
    }

    // Execute Transfer
    const transferStmt = db.transaction(() => {
        // Deduct from Sender
        db.prepare("UPDATE balances SET amount = amount - ? WHERE user_id = ? AND currency = ?").run(amount, sender.id, currency);
        
        // Add to Receiver
        db.prepare(`
            INSERT INTO balances (user_id, currency, amount) 
            VALUES (?, ?, ?) 
            ON CONFLICT(user_id, currency) DO UPDATE SET amount = amount + ?
        `).run(receiver.id, currency, amount, amount);

        // Record Transaction for Sender
        db.prepare(`
            INSERT INTO transactions (user_id, type, from_currency, to_currency, amount_out, timestamp) 
            VALUES (?, 'SEND', ?, ?, ?, ?)
        `).run(sender.id, currency, toAddress, amount, new Date().toISOString());

        // Record Transaction for Receiver
        db.prepare(`
            INSERT INTO transactions (user_id, type, from_currency, to_currency, amount_in, timestamp) 
            VALUES (?, 'RECEIVE', ?, ?, ?, ?)
        `).run(receiver.id, fromAddress, currency, amount, new Date().toISOString());
    });

    transferStmt();

    res.json({ success: true });
  });

  // --- Settings Endpoints ---

  // Get Settings
  app.get("/api/settings/:address", (req, res) => {
    const { address } = req.params;
    const user = db.prepare("SELECT id, email FROM users WHERE address = ?").get(address) as any;
    if (!user) return res.status(404).json({ error: "User not found" });

    // Ensure tables exist (lazy migration for this feature)
    db.exec(`
      CREATE TABLE IF NOT EXISTS user_connections (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        type TEXT, -- 'wallet', 'bank', 'card'
        value TEXT,
        label TEXT,
        FOREIGN KEY(user_id) REFERENCES users(id)
      );
      CREATE TABLE IF NOT EXISTS user_security (
        user_id INTEGER PRIMARY KEY,
        two_fa_email BOOLEAN DEFAULT 0,
        two_fa_phone BOOLEAN DEFAULT 0,
        two_fa_auth_app BOOLEAN DEFAULT 0,
        password_hash TEXT,
        pin_hash TEXT,
        encryption_key_hash TEXT,
        FOREIGN KEY(user_id) REFERENCES users(id)
      );
    `);

    const connections = db.prepare("SELECT * FROM user_connections WHERE user_id = ?").all(user.id);
    let security = db.prepare("SELECT * FROM user_security WHERE user_id = ?").get(user.id) as any;

    if (!security) {
      db.prepare("INSERT INTO user_security (user_id) VALUES (?)").run(user.id);
      security = { two_fa_email: 0, two_fa_phone: 0, two_fa_auth_app: 0 };
    }

    res.json({
      email: user.email,
      connections,
      security: {
        twoFaEmail: !!security.two_fa_email,
        twoFaPhone: !!security.two_fa_phone,
        twoFaAuthApp: !!security.two_fa_auth_app,
        passwordSet: !!security.password_hash,
        pinSet: !!security.pin_hash,
        encryptionKeySet: !!security.encryption_key_hash
      }
    });
  });

  // Update Settings (Generic)
  app.post("/api/settings/update", (req, res) => {
    const { address, type, value } = req.body;
    const user = db.prepare("SELECT id FROM users WHERE address = ?").get(address) as any;
    if (!user) return res.status(404).json({ error: "User not found" });

    if (type === 'email') {
      // Add email column if not exists
      try {
        db.prepare("ALTER TABLE users ADD COLUMN email TEXT").run();
      } catch (e) { /* ignore if exists */ }
      
      db.prepare("UPDATE users SET email = ? WHERE id = ?").run(value, user.id);
    }

    res.json({ success: true });
  });

  // Add Connection
  app.post("/api/settings/connections/add", (req, res) => {
    const { address, type, value, label } = req.body;
    const user = db.prepare("SELECT id FROM users WHERE address = ?").get(address) as any;
    if (!user) return res.status(404).json({ error: "User not found" });

    db.prepare("INSERT INTO user_connections (user_id, type, value, label) VALUES (?, ?, ?, ?)").run(user.id, type, value, label);
    res.json({ success: true });
  });

  // Remove Connection
  app.post("/api/settings/connections/remove", (req, res) => {
    const { address, id } = req.body;
    const user = db.prepare("SELECT id FROM users WHERE address = ?").get(address) as any;
    if (!user) return res.status(404).json({ error: "User not found" });

    db.prepare("DELETE FROM user_connections WHERE id = ? AND user_id = ?").run(id, user.id);
    res.json({ success: true });
  });

  // Toggle Security
  app.post("/api/settings/security/toggle", (req, res) => {
    const { address, type, enabled } = req.body;
    const user = db.prepare("SELECT id FROM users WHERE address = ?").get(address) as any;
    if (!user) return res.status(404).json({ error: "User not found" });

    const colMap: any = {
      'twoFaEmail': 'two_fa_email',
      'twoFaPhone': 'two_fa_phone',
      'twoFaAuthApp': 'two_fa_auth_app'
    };

    const col = colMap[type];
    if (col) {
      db.prepare(`UPDATE user_security SET ${col} = ? WHERE user_id = ?`).run(enabled ? 1 : 0, user.id);
    }

    res.json({ success: true });
  });

  // --- GitHub Integration ---

  // 1. Get Auth URL
  app.get('/api/auth/github/url', (req, res) => {
    const clientId = process.env.GITHUB_CLIENT_ID;
    if (!clientId) {
        return res.status(500).json({ error: "GitHub Client ID not configured" });
    }

    // Determine redirect URI based on request host or environment
    // In this environment, we rely on the client to construct the callback URL or use a fixed one
    // But for the OAuth provider, we must send the exact registered callback URL.
    // We'll assume the client sends the base URL or we use the APP_URL env var.
    
    // However, the safest way is to let the client handle the popup and just return the URL.
    // The redirect_uri must match what is in GitHub settings.
    // We will use <APP_URL>/auth/github/callback
    
    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    const redirectUri = `${appUrl}/auth/github/callback`;
    
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: 'repo user', // Scope to create repos
      state: Math.random().toString(36).substring(7)
    });

    const url = `https://github.com/login/oauth/authorize?${params}`;
    res.json({ url });
  });

  // 2. Callback Handler (This serves the HTML that closes the popup)
  app.get('/auth/github/callback', async (req, res) => {
    const { code } = req.query;
    
    // Exchange code for token
    try {
        const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                client_id: process.env.GITHUB_CLIENT_ID,
                client_secret: process.env.GITHUB_CLIENT_SECRET,
                code
            })
        });
        
        const tokenData = await tokenRes.json();
        
        if (tokenData.error) {
            throw new Error(tokenData.error_description);
        }

        const accessToken = tokenData.access_token;

        // Send success message to opener
        res.send(`
            <html>
            <body>
                <script>
                if (window.opener) {
                    window.opener.postMessage({ type: 'GITHUB_AUTH_SUCCESS', token: '${accessToken}' }, '*');
                    window.close();
                } else {
                    document.write('Authentication successful. You can close this window.');
                }
                </script>
                <p>Authentication successful. Closing...</p>
            </body>
            </html>
        `);

    } catch (error: any) {
        res.status(500).send(`Authentication failed: ${error.message}`);
    }
  });

  // 3. Create Repository Proxy
  app.post('/api/github/create-repo', async (req, res) => {
    const { token, name, description, isPrivate } = req.body;
    
    if (!token) return res.status(401).json({ error: "Missing access token" });

    try {
        const githubRes = await fetch('https://api.github.com/user/repos', {
            method: 'POST',
            headers: {
                'Authorization': `token ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/vnd.github.v3+json'
            },
            body: JSON.stringify({
                name,
                description,
                private: !!isPrivate,
                auto_init: true
            })
        });

        const data = await githubRes.json();
        
        if (!githubRes.ok) {
            throw new Error(data.message || "Failed to create repository");
        }

        res.json({ success: true, repo: data });

    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
  });


  // --- End API Routes ---

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
