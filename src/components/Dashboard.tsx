import { useEffect, useState } from 'react';
import { fetchUser, fetchStats, fetchTransactions } from '../lib/api';
import { MintCard } from './MintCard';
import { YieldCard } from './YieldCard';
import { TransactionHistory } from './TransactionHistory';
import { WalletConnect } from './WalletConnect';
import { IntegrateModal } from './IntegrateModal';
import { ChainlinkRuntimeModal } from './ChainlinkRuntimeModal';
import { UseCasesSection } from './UseCasesSection';
import { ManagementDashboard } from './ManagementDashboard';
import { SettingsModal } from './SettingsModal';
import { SendModal } from './SendModal';
import { ReceiveModal } from './ReceiveModal';
import { SwapModal } from './SwapModal';
import { RefreshCw, Code2, Link2, Briefcase, AlertTriangle, Settings, Send, ArrowDownLeft, ArrowRightLeft, Sprout, Lock, Layers, TrendingUp, TrendingDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FarmModal } from './FarmModal';
import { StockFarmModal } from './StockFarmModal';
import { ComingSoonModal } from './ComingSoonModal';
import { ExampleIntegrationsModal } from './ExampleIntegrationsModal';
import { StakeModal } from './StakeModal';
import { LockModal } from './LockModal';
import { LendModal } from './LendModal';
import { BorrowModal } from './BorrowModal';

import { BitcoinMigrationModal } from './BitcoinMigrationModal';

export default function Dashboard() {
  const [address, setAddress] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [showIntegrate, setShowIntegrate] = useState(false);
  const [showRuntime, setShowRuntime] = useState(false);
  const [showExamples, setShowExamples] = useState(false);
  const [showMigration, setShowMigration] = useState(false);
  const [showManagement, setShowManagement] = useState(false);
  const [showManagementConfirm, setShowManagementConfirm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showSend, setShowSend] = useState(false);
  const [showReceive, setShowReceive] = useState(false);
  const [showSwap, setShowSwap] = useState(false);
  const [showFarm, setShowFarm] = useState(false);
  const [showStockFarm, setShowStockFarm] = useState(false);
  const [showStake, setShowStake] = useState(false);
  const [showLock, setShowLock] = useState(false);
  const [showLend, setShowLend] = useState(false);
  const [showBorrow, setShowBorrow] = useState(false);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [comingSoonFeature, setComingSoonFeature] = useState('');

  const handleComingSoon = (feature: string) => {
    setComingSoonFeature(feature);
    setShowComingSoon(true);
  };

  const loadData = async () => {
    if (!address) return;
    setLoading(true);
    try {
      const [userRes, statsRes, txRes] = await Promise.all([
        fetchUser(address),
        fetchStats(),
        fetchTransactions(address)
      ]);
      setUserData(userRes);
      setStats(statsRes);
      setTransactions(txRes);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (address) {
      loadData();
    } else {
      setUserData(null);
    }
  }, [address]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8 font-sans relative pb-24">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Fiat Protocol</h1>
            <p className="text-gray-500 mt-1">Stellar-based Yield Bearing Stablecoin Wrapper</p>
          </div>
          <div className="flex items-center gap-4">
            <WalletConnect address={address} onConnect={setAddress} />
            {address && (
              <button 
                onClick={loadData}
                className="p-2 bg-white rounded-full border border-gray-200 shadow-sm hover:bg-gray-50 text-gray-600"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            )}
          </div>
        </header>

        {!address ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm text-center">
            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6">
              <RefreshCw className="w-8 h-8 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Connect your Wallet</h2>
            <p className="text-gray-500 max-w-md mb-8">
              Connect your Stellar wallet (Freighter, Albedo, or xBull) to view your balances, mint digital fiat, and earn yield.
            </p>
            <WalletConnect address={address} onConnect={setAddress} />
            
            <UseCasesSection />
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Balances & Minting */}
            <div className="lg:col-span-2 space-y-6">
              {/* Balances */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold mb-4 text-gray-900">Your Wallet</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {userData?.balances?.map((b: any) => (
                    <div key={b.currency} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="text-xs text-gray-500 font-medium mb-1 truncate" title={b.currency}>{b.currency}</div>
                      <div className="text-xl font-bold text-gray-900 font-mono">
                        {b.amount.toLocaleString()}
                      </div>
                    </div>
                  ))}
                  {(!userData?.balances || userData.balances.length === 0) && (
                    <div className="col-span-full text-gray-400 text-sm italic">No balances yet. Mint some tokens below.</div>
                  )}
                </div>
              </div>

              {/* Send / Receive / Swap Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setShowSend(true)}
                  className="flex items-center justify-center gap-2 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transform hover:-translate-y-0.5"
                >
                  <Send className="w-5 h-5" />
                  Send
                </button>
                <button 
                  onClick={() => setShowReceive(true)}
                  className="flex items-center justify-center gap-2 py-4 bg-white text-indigo-600 border border-indigo-100 rounded-2xl font-bold hover:bg-indigo-50 transition-all shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                >
                  <ArrowDownLeft className="w-5 h-5" />
                  Receive
                </button>
                <button 
                  onClick={() => setShowSwap(true)}
                  className="col-span-2 flex items-center justify-center gap-2 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 hover:shadow-slate-300 transform hover:-translate-y-0.5"
                >
                  <ArrowRightLeft className="w-5 h-5" />
                  Swap
                </button>

                {/* Farm, Stake, Lock, Stock Farm */}
                <div className="col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <button 
                    onClick={() => setShowFarm(true)}
                    className="flex flex-col sm:flex-row items-center justify-center gap-2 py-3 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl font-bold hover:bg-amber-100 transition-all shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                  >
                    <Sprout className="w-5 h-5" />
                    Farm
                  </button>
                  <button 
                    onClick={() => setShowStockFarm(true)}
                    className="flex flex-col sm:flex-row items-center justify-center gap-2 py-3 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl font-bold hover:bg-blue-100 transition-all shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                  >
                    <TrendingUp className="w-5 h-5" />
                    Stocks
                  </button>
                  <button 
                    onClick={() => setShowStake(true)}
                    className="flex flex-col sm:flex-row items-center justify-center gap-2 py-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl font-bold hover:bg-emerald-100 transition-all shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                  >
                    <Layers className="w-5 h-5" />
                    Stake
                  </button>
                  <button 
                    onClick={() => setShowLock(true)}
                    className="flex flex-col sm:flex-row items-center justify-center gap-2 py-3 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl font-bold hover:bg-rose-100 transition-all shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                  >
                    <Lock className="w-5 h-5" />
                    Lock
                  </button>
                </div>

                {/* Lend, Borrow */}
                <div className="col-span-2 grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => setShowLend(true)}
                    className="flex items-center justify-center gap-2 py-3 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold hover:bg-slate-50 transition-all shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                  >
                    <TrendingUp className="w-5 h-5 text-indigo-500" />
                    Lend
                  </button>
                  <button 
                    onClick={() => setShowBorrow(true)}
                    className="flex items-center justify-center gap-2 py-3 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold hover:bg-slate-50 transition-all shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                  >
                    <TrendingDown className="w-5 h-5 text-orange-500" />
                    Borrow
                  </button>
                </div>
              </div>

              <MintCard address={address} onUpdate={loadData} />
            </div>

            {/* Right Column: Protocol Stats & Yield */}
            <div className="space-y-6">
              <YieldCard stats={stats} onUpdate={loadData} />
              
              <TransactionHistory transactions={transactions} />

              {/* Management Button */}
              <button
                onClick={() => setShowManagementConfirm(true)}
                className="w-full py-3 px-4 bg-slate-800 text-white rounded-xl font-medium hover:bg-slate-900 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-slate-200"
              >
                <Briefcase className="w-4 h-4" />
                Management
              </button>

              {/* Settings Button */}
              <button
                onClick={() => setShowSettings(true)}
                className="w-full py-3 px-4 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <Settings className="w-4 h-4" />
                Settings
              </button>
            </div>
          </div>
        </div>
        )}
      </div>

      {/* Floating Buttons */}
      {address && (
        <div className="fixed bottom-8 right-8 z-40 flex flex-col gap-3 items-end">
          <button
            onClick={() => setShowIntegrate(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-full shadow-xl hover:bg-gray-800 transition-all transform hover:scale-105 font-medium border border-gray-700"
          >
            <Code2 className="w-5 h-5" />
            Integrate API
          </button>

          <button
            onClick={() => setShowExamples(true)}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-full shadow-xl hover:bg-indigo-700 transition-all transform hover:scale-105 font-medium border border-indigo-500"
          >
            <Briefcase className="w-5 h-5" />
            Example Integrations
          </button>
          
          <button
            onClick={() => setShowRuntime(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-full shadow-xl hover:bg-blue-700 transition-all transform hover:scale-105 font-medium border border-blue-500"
          >
            <Link2 className="w-5 h-5" />
            Chainlink Runtime
          </button>

          <button
            onClick={() => setShowMigration(true)}
            className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-full shadow-xl hover:bg-orange-700 transition-all transform hover:scale-105 font-medium border border-orange-500"
          >
            <ArrowRightLeft className="w-5 h-5" />
            Migrate BTC
          </button>
        </div>
      )}

      <IntegrateModal 
        isOpen={showIntegrate} 
        onClose={() => setShowIntegrate(false)} 
        address={address} 
      />

      <ExampleIntegrationsModal
        isOpen={showExamples}
        onClose={() => setShowExamples(false)}
      />

      <BitcoinMigrationModal
        isOpen={showMigration}
        onClose={() => setShowMigration(false)}
      />

      <ChainlinkRuntimeModal 
        isOpen={showRuntime} 
        onClose={() => setShowRuntime(false)} 
        address={address}
      />

      <ManagementDashboard
        isOpen={showManagement}
        onClose={() => setShowManagement(false)}
        address={address || ''}
      />

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        address={address || ''}
      />

      <SendModal
        isOpen={showSend}
        onClose={() => setShowSend(false)}
        address={address || ''}
        balances={userData?.balances || []}
        onUpdate={loadData}
      />

      <ReceiveModal
        isOpen={showReceive}
        onClose={() => setShowReceive(false)}
        address={address || ''}
      />

      <SwapModal
        isOpen={showSwap}
        onClose={() => setShowSwap(false)}
        address={address || ''}
        balances={userData?.balances || []}
        onUpdate={loadData}
      />

      <FarmModal
        isOpen={showFarm}
        onClose={() => setShowFarm(false)}
        address={address || ''}
        onUpdate={loadData}
      />

      <StakeModal
        isOpen={showStake}
        onClose={() => setShowStake(false)}
        address={address || ''}
        onUpdate={loadData}
      />

      <LockModal
        isOpen={showLock}
        onClose={() => setShowLock(false)}
        address={address || ''}
        onUpdate={loadData}
      />

      <LendModal
        isOpen={showLend}
        onClose={() => setShowLend(false)}
        address={address || ''}
        onUpdate={loadData}
      />

      <BorrowModal
        isOpen={showBorrow}
        onClose={() => setShowBorrow(false)}
        address={address || ''}
        onUpdate={loadData}
      />

      <ComingSoonModal
        isOpen={showComingSoon}
        onClose={() => setShowComingSoon(false)}
        feature={comingSoonFeature}
      />

      {/* Management Confirmation Modal */}
      <AnimatePresence>
        {showManagementConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowManagementConfirm(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white w-full max-w-md rounded-2xl shadow-xl p-6 border border-gray-100"
            >
              <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mb-4 text-amber-600 mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-center text-gray-900 mb-2">Non-Custodial Management</h3>
              <p className="text-center text-gray-500 mb-6">
                Managing Inventory, Personnel, and Finances is non-custodial. Do you wish to continue?
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowManagementConfirm(false)}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    setShowManagementConfirm(false);
                    setShowManagement(true);
                  }}
                  className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
                >
                  Continue
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
