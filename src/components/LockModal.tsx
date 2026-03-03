import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Coins, ArrowRightLeft, TrendingUp, Wallet, CheckCircle2, Bitcoin, Banknote, Zap, X, ArrowLeft, Shield, Activity, Globe, Building } from 'lucide-react';
import { fetchFarmData, stakeFarm, claimFarmRewards, processFarmYield } from '../lib/api';

interface LockModalProps {
  isOpen: boolean;
  onClose: () => void;
  address: string;
  onUpdate?: () => void;
}

type LockType = 'gold' | 'silver' | 'digital-dollar' | 'bitcoin' | 'ethereum' | 'xTSLA' | 'xAAPL' | 'xGOOGL' | 'HOOD' | 'OUSG' | 'LINK';

interface LockConfig {
  id: LockType;
  name: string;
  apr: number;
  rewardToken: string;
  description: string;
  Icon: any;
  theme: {
    primary: string;
    hover: string;
    text: string;
    light: string;
    border: string;
    gradient: string;
    shadow: string;
    ring: string;
  };
}

const LOCKS: LockConfig[] = [
  {
    id: 'gold',
    name: 'Gold Lock',
    apr: 22.5,
    rewardToken: 'GOLD',
    description: 'No Withdrawal',
    Icon: Coins,
    theme: {
      primary: 'bg-amber-800',
      hover: 'hover:bg-amber-900',
      text: 'text-amber-800',
      light: 'bg-amber-50',
      border: 'border-amber-300',
      gradient: 'from-amber-700 to-yellow-900',
      shadow: 'shadow-amber-300',
      ring: 'focus:ring-amber-700'
    }
  },
  {
    id: 'silver',
    name: 'Silver Lock',
    apr: 18.0,
    rewardToken: 'SLVR',
    description: 'No Withdrawal',
    Icon: Coins,
    theme: {
      primary: 'bg-slate-800',
      hover: 'hover:bg-slate-900',
      text: 'text-slate-800',
      light: 'bg-slate-50',
      border: 'border-slate-300',
      gradient: 'from-slate-600 to-slate-800',
      shadow: 'shadow-slate-300',
      ring: 'focus:ring-slate-700'
    }
  },
  {
    id: 'digital-dollar',
    name: 'Digital Dollar Lock',
    apr: 25.0,
    rewardToken: 'Digital Dollars',
    description: 'No Withdrawal',
    Icon: Banknote,
    theme: {
      primary: 'bg-emerald-800',
      hover: 'hover:bg-emerald-900',
      text: 'text-emerald-800',
      light: 'bg-emerald-50',
      border: 'border-emerald-300',
      gradient: 'from-emerald-700 to-teal-900',
      shadow: 'shadow-emerald-300',
      ring: 'focus:ring-emerald-700'
    }
  },
  {
    id: 'bitcoin',
    name: 'Bitcoin Lock',
    apr: 12.0,
    rewardToken: 'yBTC',
    description: 'No Withdrawal',
    Icon: Bitcoin,
    theme: {
      primary: 'bg-orange-800',
      hover: 'hover:bg-orange-900',
      text: 'text-orange-800',
      light: 'bg-orange-50',
      border: 'border-orange-300',
      gradient: 'from-orange-700 to-red-800',
      shadow: 'shadow-orange-300',
      ring: 'focus:ring-orange-700'
    }
  },
  {
    id: 'ethereum',
    name: 'Ethereum Lock',
    apr: 14.0,
    rewardToken: 'yETH',
    description: 'No Withdrawal',
    Icon: Zap,
    theme: {
      primary: 'bg-violet-800',
      hover: 'hover:bg-violet-900',
      text: 'text-violet-800',
      light: 'bg-violet-50',
      border: 'border-violet-300',
      gradient: 'from-violet-700 to-purple-900',
      shadow: 'shadow-violet-300',
      ring: 'focus:ring-violet-700'
    }
  },
  {
    id: 'xTSLA',
    name: 'Tesla Lock',
    apr: 22.5,
    rewardToken: 'TSLA',
    description: 'No Withdrawal',
    Icon: Activity,
    theme: {
      primary: 'bg-red-800',
      hover: 'hover:bg-red-900',
      text: 'text-red-800',
      light: 'bg-red-50',
      border: 'border-red-300',
      gradient: 'from-red-700 to-red-900',
      shadow: 'shadow-red-300',
      ring: 'focus:ring-red-700'
    }
  },
  {
    id: 'xAAPL',
    name: 'Apple Lock',
    apr: 18.0,
    rewardToken: 'AAPL',
    description: 'No Withdrawal',
    Icon: Activity,
    theme: {
      primary: 'bg-slate-800',
      hover: 'hover:bg-slate-900',
      text: 'text-slate-800',
      light: 'bg-slate-50',
      border: 'border-slate-300',
      gradient: 'from-slate-700 to-slate-900',
      shadow: 'shadow-slate-300',
      ring: 'focus:ring-slate-700'
    }
  },
  {
    id: 'xGOOGL',
    name: 'Google Lock',
    apr: 19.5,
    rewardToken: 'GOOGL',
    description: 'No Withdrawal',
    Icon: Globe,
    theme: {
      primary: 'bg-blue-800',
      hover: 'hover:bg-blue-900',
      text: 'text-blue-800',
      light: 'bg-blue-50',
      border: 'border-blue-300',
      gradient: 'from-blue-700 to-blue-900',
      shadow: 'shadow-blue-300',
      ring: 'focus:ring-blue-700'
    }
  },
  {
    id: 'HOOD',
    name: 'Robinhood Lock',
    apr: 25.0,
    rewardToken: 'HOOD',
    description: 'No Withdrawal',
    Icon: Activity,
    theme: {
      primary: 'bg-green-800',
      hover: 'hover:bg-green-900',
      text: 'text-green-800',
      light: 'bg-green-50',
      border: 'border-green-300',
      gradient: 'from-green-700 to-emerald-900',
      shadow: 'shadow-green-300',
      ring: 'focus:ring-green-700'
    }
  },
  {
    id: 'OUSG',
    name: 'Ondo Gov Lock',
    apr: 10.5,
    rewardToken: 'OUSG',
    description: 'No Withdrawal',
    Icon: Building,
    theme: {
      primary: 'bg-indigo-800',
      hover: 'hover:bg-indigo-900',
      text: 'text-indigo-800',
      light: 'bg-indigo-50',
      border: 'border-indigo-300',
      gradient: 'from-indigo-700 to-purple-900',
      shadow: 'shadow-indigo-300',
      ring: 'focus:ring-indigo-700'
    }
  },
  {
    id: 'LINK',
    name: 'Chainlink Lock',
    apr: 21.0,
    rewardToken: 'LINK',
    description: 'No Withdrawal',
    Icon: Activity,
    theme: {
      primary: 'bg-blue-700',
      hover: 'hover:bg-blue-800',
      text: 'text-blue-700',
      light: 'bg-blue-50',
      border: 'border-blue-300',
      gradient: 'from-blue-600 to-cyan-800',
      shadow: 'shadow-blue-300',
      ring: 'focus:ring-blue-700'
    }
  }
];

export function LockModal({ isOpen, onClose, address, onUpdate }: LockModalProps) {
  const [locked, setLocked] = useState<Record<LockType, number>>({
    gold: 0, silver: 0, 'digital-dollar': 0, bitcoin: 0, ethereum: 0,
    xTSLA: 0, xAAPL: 0, xGOOGL: 0, HOOD: 0, OUSG: 0, LINK: 0
  });
  
  const [rewards, setRewards] = useState<Record<LockType, number>>({
    gold: 0, silver: 0, 'digital-dollar': 0, bitcoin: 0, ethereum: 0,
    xTSLA: 0, xAAPL: 0, xGOOGL: 0, HOOD: 0, OUSG: 0, LINK: 0
  });

  const [view, setView] = useState<'list' | 'deposit'>('list');
  const [activeLockId, setActiveLockId] = useState<LockType>('gold');
  const [depositAmount, setDepositAmount] = useState('');
  const [selectedAsset, setSelectedAsset] = useState('USDC');
  const [loading, setLoading] = useState(false);
  const [swapStatus, setSwapStatus] = useState<'idle' | 'swapping' | 'locking'>('idle');
  const [showSuccess, setShowSuccess] = useState(false);

  const activeLock = LOCKS.find(f => f.id === activeLockId) || LOCKS[0];

  const loadData = async () => {
    if (!address) return;
    try {
        const data = await fetchFarmData(address); // Reusing farm data structure
        const newLocked: any = { ...locked };
        const newRewards: any = { ...rewards };
        
        Object.keys(data).forEach((key) => {
            if (newLocked[key] !== undefined) {
                newLocked[key] = data[key].staked;
                newRewards[key] = data[key].rewards;
            }
        });
        setLocked(newLocked);
        setRewards(newRewards);
    } catch (e) {
        console.error("Failed to load lock data", e);
    }
  };

  useEffect(() => {
    loadData();
  }, [address]);

  // Simulate Yield Generation (Backend Trigger)
  useEffect(() => {
    if (!address) return;
    
    const interval = setInterval(async () => {
      try {
        await processFarmYield(); // Trigger backend calculation
        await loadData(); // Refresh UI
      } catch (e) {
        console.error("Yield process failed", e);
      }
    }, 5000); // 5 seconds

    return () => clearInterval(interval);
  }, [address]);

  const openDepositModal = (id: LockType) => {
    setActiveLockId(id);
    setView('deposit');
    setDepositAmount('');
    setSwapStatus('idle');
  };

  const handleDeposit = async () => {
    if (!depositAmount || isNaN(Number(depositAmount)) || !address) return;
    setLoading(true);
    setSwapStatus('swapping');
    
    try {
        await new Promise(resolve => setTimeout(resolve, 1500));
        setSwapStatus('locking');
        
        await stakeFarm(address, activeLockId, selectedAsset, Number(depositAmount));
        
        setDepositAmount('');
        setLoading(false);
        setSwapStatus('idle');
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          setView('list');
        }, 2000);
        
        loadData();
        if (onUpdate) onUpdate();
    } catch (e) {
        console.error(e);
        setLoading(false);
        setSwapStatus('idle');
        alert("Deposit failed. Check console.");
    }
  };

  const handleClaim = async (id: LockType) => {
    if (!address) return;
    try {
        const res = await claimFarmRewards(address, id);
        if (res.success) {
            alert(`Claimed ${res.claimed.toFixed(6)} ${res.token}!`);
            loadData();
            if (onUpdate) onUpdate();
        } else {
            alert(res.error || "Claim failed");
        }
    } catch (e) {
        console.error(e);
        alert("Claim failed");
    }
  };

  const reset = () => {
    setView('list');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={reset}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="bg-white border-b border-gray-100 p-6 flex justify-between items-center sticky top-0 z-10">
              <div className="flex items-center gap-3">
                {view === 'deposit' ? (
                  <button 
                    onClick={() => setView('list')}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors mr-2"
                  >
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                  </button>
                ) : (
                  <div className="p-2 bg-rose-100 rounded-lg text-rose-600">
                    <Lock className="w-6 h-6" />
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {view === 'deposit' ? `Lock in ${activeLock.name}` : 'Locked Vaults'}
                  </h2>
                  <p className="text-gray-500 text-sm">
                    {view === 'deposit' 
                      ? 'Funds are permanently locked for maximum yield' 
                      : 'Highest APY. No Withdrawal Permitted.'}
                  </p>
                </div>
              </div>
              <button onClick={reset} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 bg-gray-50 flex-1">
              {view === 'list' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {LOCKS.map((lock) => (
                    <div key={lock.id} className={`bg-white rounded-2xl border ${lock.theme.border} shadow-sm overflow-hidden relative group hover:shadow-md transition-all`}>
                      <div className="absolute top-0 right-0 p-4">
                        <div className={`px-3 py-1 ${lock.theme.light} ${lock.theme.text} text-xs font-bold rounded-full border ${lock.theme.border} flex items-center gap-1`}>
                          <Shield className="w-3 h-3" />
                          Locked
                        </div>
                      </div>
                      
                      <div className="p-6 border-b border-gray-100">
                        <div className="flex items-center gap-4 mb-4">
                          <div className={`w-12 h-12 bg-gradient-to-br ${lock.theme.gradient} rounded-full flex items-center justify-center text-white shadow-lg ${lock.theme.shadow}`}>
                            <lock.Icon className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">{lock.name}</h3>
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <span className={`font-bold ${lock.theme.text}`}>{lock.apr}% APR</span>
                            </div>
                          </div>
                        </div>

                        <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                          Interest Allocation:<br/>
                          <span className="font-medium text-gray-900">40% Locker ({lock.rewardToken})</span>,<br/>
                          <span className="font-medium text-gray-900">30% Lock Balance</span>,<br/>
                          <span className="font-medium text-gray-900">15% Fiat Reserves</span>,<br/>
                          <span className="font-medium text-gray-900">15% Swap Reserves</span>.
                        </p>

                        <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">Locked Balance</span>
                            <span className="font-mono font-bold text-gray-900">${locked[lock.id].toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">Rewards</span>
                            <span className={`font-mono font-bold ${lock.theme.text}`}>{rewards[lock.id].toFixed(6)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-gray-50 flex gap-3">
                        <button
                          onClick={() => openDepositModal(lock.id)}
                          className={`flex-1 py-2.5 ${lock.theme.primary} ${lock.theme.hover} text-white rounded-xl font-bold transition-colors shadow-lg ${lock.theme.shadow} flex items-center justify-center gap-2`}
                        >
                          <Lock className="w-4 h-4" />
                          Lock
                        </button>
                        <button
                          onClick={() => handleClaim(lock.id)}
                          disabled={rewards[lock.id] <= 0}
                          className={`flex-1 py-2.5 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 border ${
                            rewards[lock.id] > 0
                              ? `bg-white ${lock.theme.border} ${lock.theme.text} ${lock.theme.light}`
                              : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          <TrendingUp className="w-4 h-4" />
                          Claim
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="max-w-xl mx-auto">
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="space-y-6">
                      <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex items-start gap-3">
                        <Shield className="w-5 h-5 text-red-600 mt-0.5" />
                        <div className="text-sm text-red-700">
                          <span className="font-bold">Warning:</span> Funds deposited into the Lock Vault cannot be withdrawn. They are permanently locked to generate maximum yield.
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Select Asset to Lock</label>
                        <div className="grid grid-cols-3 gap-2">
                          {['USDC', 'USDT', 'PYUSD', 'BTC', 'ETH', 'XLM', 'xTSLA', 'xAAPL', 'xGOOGL', 'HOOD', 'OUSG', 'LINK'].map((asset) => (
                            <button
                              key={asset}
                              onClick={() => setSelectedAsset(asset)}
                              className={`py-3 rounded-xl text-sm font-medium transition-colors ${
                                selectedAsset === asset
                                  ? `${activeLock.theme.light} ${activeLock.theme.text} border ${activeLock.theme.border} ring-2 ${activeLock.theme.ring} ring-offset-2`
                                  : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                              }`}
                            >
                              {asset}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                        <div className="relative">
                          <input
                            type="number"
                            value={depositAmount}
                            onChange={(e) => setDepositAmount(e.target.value)}
                            placeholder="0.00"
                            className={`w-full pl-4 pr-16 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:border-transparent outline-none font-mono text-xl ${activeLock.theme.ring}`}
                          />
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">
                            {selectedAsset}
                          </div>
                        </div>
                      </div>

                      <div className="bg-blue-50 p-4 rounded-xl flex items-start gap-3 border border-blue-100">
                        <ArrowRightLeft className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div className="text-sm text-blue-700">
                          <span className="font-bold">Async Swap:</span> Your {selectedAsset} will be automatically converted to Digital Dollars and permanently locked.
                        </div>
                      </div>

                      <button
                        onClick={handleDeposit}
                        disabled={loading || !depositAmount}
                        className={`w-full py-4 text-white rounded-xl font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all ${activeLock.theme.primary} ${activeLock.theme.hover} ${activeLock.theme.shadow}`}
                      >
                        {loading ? (
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>{swapStatus === 'swapping' ? `Swapping ${selectedAsset} to USD...` : 'Locking Funds...'}</span>
                          </div>
                        ) : (
                          <>
                            Confirm Lock
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Success Toast */}
            <AnimatePresence>
              {showSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 50 }}
                  className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 bg-green-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3"
                >
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  <span className="font-medium">Funds Locked Successfully!</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
