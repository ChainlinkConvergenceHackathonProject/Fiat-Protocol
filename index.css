import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wallet, X, Loader2, Landmark, Bitcoin } from 'lucide-react';

export function WalletConnect({ address, onConnect }: { address: string | null, onConnect: (addr: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [connecting, setConnecting] = useState<string | null>(null);

  const handleConnect = (wallet: string, type: 'EVM' | 'Stellar' | 'Cronos' | 'Solana' | 'Bank' | 'Bitcoin') => {
    setConnecting(wallet);
    // Simulate connection delay
    setTimeout(() => {
      let mockAddress = '';
      if (type === 'EVM') {
        mockAddress = `0x${Math.random().toString(16).substring(2, 42)}`;
      } else if (type === 'Cronos') {
        mockAddress = `cro${Math.random().toString(36).substring(2, 40)}`;
      } else if (type === 'Solana') {
        mockAddress = `${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}...${Math.random().toString(36).substring(2, 6)}`; // Base58-ish
      } else if (type === 'Bank') {
        mockAddress = `bank_${Math.random().toString(36).substring(2, 12)}`;
      } else if (type === 'Bitcoin') {
        mockAddress = wallet.includes('Lightning') || wallet === 'ZBD' || wallet === 'Strike' 
          ? `lnbc1${Math.random().toString(36).substring(2, 20)}...` 
          : `bc1q${Math.random().toString(36).substring(2, 30)}`;
      } else {
        mockAddress = `G${Math.random().toString(36).substring(2, 15).toUpperCase()}...${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      }
      onConnect(mockAddress);
      setConnecting(null);
      setIsOpen(false);
    }, 1500);
  };

  const EVM_WALLETS = ['Metamask', 'Zerion', 'WalletConnect'];
  const STELLAR_WALLETS = ['Freighter', 'Albedo', 'xBull', 'Lobstr', 'WalletConnect'];
  const CRONOS_WALLETS = ['Cronos DeFi Wallet', 'WalletConnect (Cronos/ICP)'];
  const SOLANA_WALLETS = ['Phantom', 'Solflare', 'Backpack', 'WalletConnect'];
  const BANK_WALLETS = ['Connect Bank (Plaid)', 'Zelle', 'CashApp', 'PayPal', 'Forex'];
  const BITCOIN_WALLETS = ['Bitcoin.com', 'ZBD (Lightning)', 'Strike', 'WalletConnect (BTC)'];

  return (
    <>
      {address ? (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm flex items-center gap-2 text-sm font-mono text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <div className={`w-2 h-2 rounded-full ${
            address.startsWith('0x') ? 'bg-blue-500' : 
            address.startsWith('cro') ? 'bg-indigo-500' : 
            address.startsWith('bank_') ? 'bg-slate-800' : 
            address.startsWith('bc1') || address.startsWith('lnbc') ? 'bg-orange-500' : // Bitcoin check
            address.length > 40 && !address.startsWith('G') ? 'bg-purple-500' : 
            'bg-emerald-500'
          }`}></div>
          {address}
        </button>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-indigo-600 text-white px-5 py-2 rounded-full shadow-md hover:bg-indigo-700 transition-all flex items-center gap-2 font-medium"
        >
          <Wallet className="w-4 h-4" />
          Connect Wallet
        </button>
      )}

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <div className="p-4 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                <h3 className="font-semibold text-gray-900">Connect Wallet</h3>
                <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-gray-100 rounded-full text-gray-500">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Backing Visualization */}
              <div className="bg-slate-50 border-b border-slate-100 p-4 overflow-x-auto">
                <div className="flex items-center gap-4 text-xs font-mono whitespace-nowrap min-w-max mx-auto justify-center">
                  <div className="flex items-center gap-2 text-slate-500">
                    <span className="font-bold text-blue-600">$USDC</span>
                    <span className="text-slate-300">→</span>
                    <span className="font-bold text-emerald-600">$USDY</span>
                  </div>
                  <div className="w-px h-4 bg-slate-300"></div>
                  <div className="flex items-center gap-2 text-slate-500">
                    <span className="font-bold text-blue-500">$PYUSD</span>
                    <span className="text-slate-300">→</span>
                    <span className="font-bold text-blue-600">$USDC</span>
                    <span className="text-slate-300">→</span>
                    <span className="font-bold text-indigo-600">$yUSDC</span>
                  </div>
                  <div className="w-px h-4 bg-slate-300"></div>
                  <div className="flex items-center gap-2 text-slate-500">
                    <span className="font-bold text-green-600">$USDT</span>
                    <span className="text-slate-300">→</span>
                    <span className="font-bold text-emerald-600">$USDY</span>
                  </div>
                  <div className="w-px h-4 bg-slate-300"></div>
                  <div className="flex items-center gap-2 text-slate-500">
                    <span className="font-bold text-slate-700">BANK</span>
                    <span className="text-slate-300">→</span>
                    <span className="font-bold text-emerald-600">$USDY</span>
                  </div>
                </div>
                <div className="text-[10px] text-center text-slate-400 mt-2 uppercase tracking-wider">
                  Digital Dollar Issuance & Backing Flows
                </div>
              </div>
              
              <div className="p-6 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Ethereum Section */}
                  <div>
                    <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      Ethereum (EVM)
                    </h4>
                    <div className="space-y-3">
                      {EVM_WALLETS.map((wallet) => (
                        <button
                          key={wallet}
                          onClick={() => handleConnect(wallet, 'EVM')}
                          disabled={!!connecting}
                          className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all group"
                        >
                          <span className="font-medium text-gray-900">{wallet}</span>
                          {connecting === wallet ? (
                            <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border border-gray-300 group-hover:border-blue-500" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Stellar Section */}
                  <div>
                    <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                      Stellar Network
                    </h4>
                    <div className="space-y-3">
                      {STELLAR_WALLETS.map((wallet) => (
                        <button
                          key={wallet}
                          onClick={() => handleConnect(wallet, 'Stellar')}
                          disabled={!!connecting}
                          className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-200 hover:border-emerald-500 hover:bg-emerald-50 transition-all group"
                        >
                          <span className="font-medium text-gray-900">{wallet}</span>
                          {connecting === wallet ? (
                            <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border border-gray-300 group-hover:border-emerald-500" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Cronos Section */}
                  <div>
                    <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
                      Cronos Chain (Cosmos/EVM)
                    </h4>
                    <div className="space-y-3">
                      {CRONOS_WALLETS.map((wallet) => (
                        <button
                          key={wallet}
                          onClick={() => handleConnect(wallet, 'Cronos')}
                          disabled={!!connecting}
                          className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-200 hover:border-indigo-600 hover:bg-indigo-50 transition-all group"
                        >
                          <span className="font-medium text-gray-900">{wallet}</span>
                          {connecting === wallet ? (
                            <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border border-gray-300 group-hover:border-indigo-600" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Solana Section */}
                  <div>
                    <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                      Solana Network
                    </h4>
                    <div className="space-y-3">
                      {SOLANA_WALLETS.map((wallet) => (
                        <button
                          key={wallet}
                          onClick={() => handleConnect(wallet, 'Solana')}
                          disabled={!!connecting}
                          className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-200 hover:border-purple-500 hover:bg-purple-50 transition-all group"
                        >
                          <span className="font-medium text-gray-900">{wallet}</span>
                          {connecting === wallet ? (
                            <Loader2 className="w-4 h-4 text-purple-600 animate-spin" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border border-gray-300 group-hover:border-purple-500" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Bitcoin Section */}
                  <div>
                    <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                      Bitcoin (L1 & Lightning)
                    </h4>
                    <div className="space-y-3">
                      {BITCOIN_WALLETS.map((wallet) => (
                        <button
                          key={wallet}
                          onClick={() => handleConnect(wallet, 'Bitcoin')}
                          disabled={!!connecting}
                          className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-200 hover:border-orange-500 hover:bg-orange-50 transition-all group"
                        >
                          <span className="font-medium text-gray-900">{wallet}</span>
                          {connecting === wallet ? (
                            <Loader2 className="w-4 h-4 text-orange-500 animate-spin" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border border-gray-300 group-hover:border-orange-500" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Bank Section */}
                  <div>
                    <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-slate-800"></div>
                      Bank & Fintech Integrations
                    </h4>
                    <div className="space-y-3">
                      {BANK_WALLETS.map((wallet) => (
                        <div key={wallet} className="border border-gray-200 rounded-xl p-3 hover:border-slate-800 transition-colors">
                          <button
                            onClick={() => handleConnect(wallet, 'Bank')}
                            disabled={!!connecting}
                            className="w-full flex items-center justify-between mb-2"
                          >
                            <span className="font-medium text-gray-900">{wallet}</span>
                            {connecting === wallet ? (
                              <Loader2 className="w-4 h-4 text-slate-800 animate-spin" />
                            ) : (
                              <div className="w-4 h-4 rounded-full border border-gray-300" />
                            )}
                          </button>
                          
                          {/* Auth Fields for Bank */}
                          <div className="space-y-2 mt-2 pt-2 border-t border-gray-100 text-xs">
                            <input type="email" placeholder="Email" className="w-full p-2 bg-gray-50 rounded border border-gray-200" />
                            <input type="tel" placeholder="Phone Number" className="w-full p-2 bg-gray-50 rounded border border-gray-200" />
                            <input type="password" placeholder="Password" className="w-full p-2 bg-gray-50 rounded border border-gray-200" />
                            <input type="text" placeholder="2FA Code" className="w-full p-2 bg-gray-50 rounded border border-gray-200" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 text-xs text-center text-gray-500 border-t border-gray-100 sticky bottom-0">
                Connecting enables cross-chain swaps via Chainlink Runtime Environment.
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
