#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, Symbol, token, Vec};

#[contracttype]
pub enum DataKey {
    Admin,
    Token, // The backing yUSDC token address
    Reserves, // Address for 20% reserves
    Founder, // Address for 5% founder fee
    TotalBackedValue, // Total value in USD/yUSDC locked
}

#[contract]
pub struct FiatProtocolContract;

#[contractimpl]
impl FiatProtocolContract {
    // Initialize the contract
    pub fn init(env: Env, admin: Address, token: Address, reserves: Address, founder: Address) {
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::Token, &token);
        env.storage().instance().set(&DataKey::Reserves, &reserves);
        env.storage().instance().set(&DataKey::Founder, &founder);
        env.storage().instance().set(&DataKey::TotalBackedValue, &0i128);
    }

    // Mint a specific Digital Token (e.g., $10Dollar)
    // In a real implementation, this would likely be a factory that deploys a new token contract
    // or mints an NFT/SFT. Here we simulate the logic of locking yUSDC.
    // 
    // CHAINLINK RUNTIME ENVIRONMENT INTEGRATION:
    // This function can be called via CCIP from the EVM FiatProtocol.sol contract.
    // EVM Asset -> Bridge -> Soroban Contract -> Mint Digital Token
    pub fn mint_token(env: Env, from: Address, amount_usdc_needed: i128, token_symbol: Symbol) {
        from.require_auth();
        
        let token_addr: Address = env.storage().instance().get(&DataKey::Token).unwrap();
        let client = token::Client::new(&env, &token_addr);

        // Transfer yUSDC from user to this contract (Backing)
        client.transfer(&from, &env.current_contract_address(), &amount_usdc_needed);

        // Update Total Backed Value
        let mut total_backed: i128 = env.storage().instance().get(&DataKey::TotalBackedValue).unwrap_or(0);
        total_backed += amount_usdc_needed;
        env.storage().instance().set(&DataKey::TotalBackedValue, &total_backed);
        
        // Emit event that user minted 'token_symbol'
        env.events().publish(
            (Symbol::new(&env, "mint"), token_symbol),
            amount_usdc_needed
        );
    }

    // Bridge In from EVM (Simulated)
    // Called by the bridge contract when an EVM event is verified
    pub fn bridge_in_evm_asset(env: Env, to: Address, amount: i128, asset_symbol: Symbol) {
        // Only the bridge admin can call this
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();

        // Logic to mint/release the Stellar equivalent of the EVM asset
        // e.g. Mint USDC (Stellar) to 'to' address
        
        env.events().publish(
            (Symbol::new(&env, "bridge_in"), asset_symbol),
            amount
        );
    }

    // Address Encryption Extension
    // Maps a Soroban address to an EVM address for cross-chain tracking
    pub fn map_soroban_to_evm(env: Env, from: Address, evm_address: Symbol) {
        from.require_auth();
        // Store mapping
        // env.storage().persistent().set(&DataKey::AddressMap(from), &evm_address);
        
        env.events().publish(
            (Symbol::new(&env, "map_addr"), from),
            evm_address
        );
    }

    // View function to check if an address is mapped (Simulated)
    pub fn get_evm_address(env: Env, soroban_addr: Address) -> Symbol {
        // return env.storage().persistent().get(&DataKey::AddressMap(soroban_addr)).unwrap();
        Symbol::new(&env, "0x0000000000000000000000000000000000000000")
    }

    // Distribute Yield
    // 20% Reserves, 5% Founder, 75% Token Holders (Paid in yUSDC)
    pub fn distribute_yield(env: Env, amount: i128) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();

        let reserves_addr: Address = env.storage().instance().get(&DataKey::Reserves).unwrap();
        let founder_addr: Address = env.storage().instance().get(&DataKey::Founder).unwrap();
        let token_addr: Address = env.storage().instance().get(&DataKey::Token).unwrap();
        
        let client = token::Client::new(&env, &token_addr);

        // Calculate splits
        let reserves_share = (amount * 20) / 100;
        let founder_share = (amount * 5) / 100;
        let holders_share = (amount * 75) / 100;

        // Transfer to Reserves
        client.transfer(&env.current_contract_address(), &reserves_addr, &reserves_share);

        // Transfer to Founder
        client.transfer(&env.current_contract_address(), &founder_addr, &founder_share);

        // The holders_share is kept in the contract to be claimed or distributed.
        // In this simplified model, we just log it. In reality, we'd update a dividend pool.
        
        env.events().publish(
            (Symbol::new(&env, "yield_dist"),),
            (reserves_share, founder_share, holders_share)
        );
    }
}
