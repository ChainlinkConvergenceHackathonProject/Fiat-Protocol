import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Layers, Coins, ArrowRightLeft, TrendingUp, Wallet, CheckCircle2, Bitcoin, Banknote, Zap, X, ArrowLeft, Clock, Activity, Globe, Building } from 'lucide-react';
import { fetchFarmData, stakeFarm, claimFarmRewards, processFarmYield } from '../lib/api';

interface StakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  address: string;
  onUpdate?: () => void;
}

type StakeType = 'gold' | 'silver' | 'digital-dollar' | 'bitcoin' | 'ethereum' | 'xTSLA' | 'xAAPL' | 'xGOOGL' | 'HOOD' | 'OUSG' | 'LINK';

interface StakeConfig {
  id: StakeType;
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

const STAKES: StakeConfig[] = [
  {
    id: 'gold',
    name: 'Gold Stake',
    apr: 14.5,
    rewardToken: 'GOLD',
    description: '30 Day Min Lock',
    Icon: Coins,
    theme: {
      primary: 'bg-amber-600',
      hover: 'hover:bg-amber-700',
      text: 'text-amber-700',
      light: 'bg-amber-50',
      border: 'border-amber-200',
      gradient: 'from-amber-500 to-yellow-700',
      shadow: 'shadow-amber-200',
      ring: 'focus:ring-amber-600'
    }
  },
  {
    id: 'silver',
    name: 'Silver Stake',
    apr: 12.0,
    rewardToken: 'SLVR',
    description: '30 Day Min Lock',
    Icon: Coins,
    theme: {
      primary: 'bg-slate-700',
      hover: 'hover:bg-slate-800',
      text: 'text-slate-700',
      light: 'bg-slate-50',
      border: 'border-slate-300',
      gradient: 'from-slate-400 to-slate-600',
      shadow: 'shadow-slate-300',
      ring: 'focus:ring-slate-600'
    }
  },
  {
    id: 'digital-dollar',
    name: 'Digital Dollar Stake',
    apr: 18.0,
    rewardToken: 'Digital Dollars',
    description: '30 Day Min Lock',
    Icon: Banknote,
    theme: {
      primary: 'bg-emerald-700',
      hover: 'hover:bg-emerald-800',
      text: 'text-emerald-700',
      light: 'bg-emerald-50',
      border: 'border-emerald-300',
      gradient: 'from-emerald-500 to-teal-700',
      shadow: 'shadow-emerald-300',
      ring: 'focus:ring-emerald-600'
    }
  },
  {
    id: 'bitcoin',
    name: 'Bitcoin Stake',
    apr: 7.0,
    rewardToken: 'yBTC',
    description: '30 Day Min Lock',
    Icon: Bitcoin,
    theme: {
      primary: 'bg-orange-600',
      hover: 'hover:bg-orange-700',
      text: 'text-orange-700',
      light: 'bg-orange-50',
      border: 'border-orange-300',
      gradient: 'from-orange-500 to-red-600',
      shadow: 'shadow-orange-300',
      ring: 'focus:ring-orange-600'
    }
  },
  {
    id: 'ethereum',
    name: 'Ethereum Stake',
    apr: 8.0,
    rewardToken: 'yETH',
    description: '30 Day Min Lock',
    Icon: Zap,
    theme: {
      primary: 'bg-violet-700',
      hover: 'hover:bg-violet-800',
      text: 'text-violet-700',
      light: 'bg-violet-50',
      border: 'border-violet-300',
      gradient: 'from-violet-500 to-purple-700',
      shadow: 'shadow-violet-300',
      ring: 'focus:ring-violet-600'
    }
  },
  {
    id: 'xTSLA',
    name: 'Tesla Stake',
    apr: 14.5,
    rewardToken: 'TSLA',
    description: '30 Day Min Lock',
    Icon: Activity,
    theme: {
      primary: 'bg-red-700',
      hover: 'hover:bg-red-800',
      text: 'text-red-700',
      light: 'bg-red-50',
      border: 'border-red-300',
      gradient: 'from-red-600 to-red-800',
      shadow: 'shadow-red-300',
      ring: 'focus:ring-red-600'
    }
  },
  {
    id: 'xAAPL',
    name: 'Apple Stake',
    apr: 10.0,
    rewardToken: 'AAPL',
    description: '30 Day Min Lock',
    Icon: Activity,
    theme: {
      primary: 'bg-slate-700',
      hover: 'hover:bg-slate-800',
      text: 'text-slate-700',
      light: 'bg-slate-50',
      border: 'border-slate-300',
      gradient: 'from-slate-600 to-slate-800',
      shadow: 'shadow-slate-300',
      ring: 'focus:ring-slate-600'
    }
  },
  {
    id: 'xGOOGL',
    name: 'Google Stake',
    apr: 11.5,
    rewardToken: 'GOOGL',
    description: '30 Day Min Lock',
    Icon: Globe,
    theme: {
      primary: 'bg-blue-700',
      hover: 'hover:bg-blue-800',
      text: 'text-blue-700',
      light: 'bg-blue-50',
      border: 'border-blue-300',
      gradient: 'from-blue-600 to-blue-800',
      shadow: 'shadow-blue-300',
      ring: 'focus:ring-blue-600'
    }
  },
  {
    id: 'HOOD',
    name: 'Robinhood Stake',
    apr: 17.0,
    rewardToken: 'HOOD',
    description: '30 Day Min Lock',
    Icon: Activity,
    theme: {
      primary: 'bg-green-700',
      hover: 'hover:bg-green-800',
      text: 'text-green-700',
      light: 'bg-green-50',
      border: 'border-green-300',
      gradient: 'from-green-600 to-emerald-800',
      shadow: 'shadow-green-300',
      ring: 'focus:ring-green-600'
    }
  },
  {
    id: 'OUSG',
    name: 'Ondo Gov Stake',
    apr: 6.5,
    rewardToken: 'OUSG',
    description: '30 Day Min Lock',
    Icon: Building,
    theme: {
      primary: 'bg-indigo-700',
      hover: 'hover:bg-indigo-800',
      text: 'text-indigo-700',
      light: 'bg-indigo-50',
      border: 'border-indigo-300',
      gradient: 'from-indigo-600 to-purple-800',
      shadow: 'shadow-indigo-300',
      ring: 'focus:ring-indigo-600'
    }
  },
  {
    id: 'LINK',
    name: 'Chainlink Stake',
    apr: 13.0,
    rewardToken: 'LINK',
    description: '30 Day Min Lock',
    Icon: Activity,
    theme: {
      primary: 'bg-blue-600',
      hover: 'hover:bg-blue-700',
      text: 'text-blue-600',
      light: 'bg-blue-50',
      border: 'border-blue-300',
      gradient: 'from-blue-500 to-cyan-700',
      shadow: 'shadow-blue-300',
      ring: 'focus:ring-blue-600'
    }
  }
];

export function StakeModal({ isOpen, onClose, address, onUpdate }: StakeModalProps) {
  // Reuse farm API for now as the backend logic would handle the specific rules based on the "type" parameter if we had a real backend.
  // In a real app, we'd have specific endpoints like /stake/deposit.
  
  const [staked, setStaked] = useState<Record<StakeType, number>>({
    gold: 0, silver: 0, 'digital-dollar': 0, bitcoin: 0, ethereum: 0,
    xTSLA: 0, xAAPL: 0, xGOOGL: 0, HOOD: 0, OUSG: 0, LINK: 0
  });
  
  const [rewards, setRewards] = useState<Record<StakeType, number>>({
    gold: 0, silver: 0, 'digital-dollar': 0, bitcoin: 0, ethereum: 0,
    xTSLA: 0, xAAPL: 0, xGOOGL: 0, HOOD: 0, OUSG: 0, LINK: 0
  });

  const [view, setView] = useState<'list' | 'deposit'>('list');
  const [activeStakeId, setActiveStakeId] = useState<StakeType>('gold');
  const [depositAmount, setDepositAmount] = useState('');
  const [selectedAsset, setSelectedAsset] = useState('USDC');
  const [loading, setLoading] = useState(false);
  const [swapStatus, setSwapStatus] = useState<'idle' | 'swapping' | 'staking'>('idle');
  const [showSuccess, setShowSuccess] = useState(false);

  const activeStake = STAKES.find(f => f.id === activeStakeId) || STAKES[0];

  const loadData = async () => {
    if (!address) return;
    try {
        const data = await fetchFarmData(address); // Reusing farm data structure for demo
        const newStaked: any = { ...staked };
        const newRewards: any = { ...rewards };
        
        Object.keys(data).forEach((key) => {
            if (newStaked[key] !== undefined) {
                newStaked[key] = data[key].staked;
                newRewards[key] = data[key].rewards;
            }
        });
        setStaked(newStaked);
        setRewards(newRewards);
    } catch (e) {
        console.error("Failed to load stake data", e);
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

  const openDepositModal = (id: StakeType) => {
    setActiveStakeId(id);
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
        setSwapStatus('staking');
        
        // We reuse stakeFarm but conceptually this is a "Stake" action with 30 day lock
        await stakeFarm(address, activeStakeId, selectedAsset, Number(depositAmount));
        
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

  const handleClaim = async (id: StakeType) => {
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
                  <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                    <Layers className="w-6 h-6" />
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {view === 'deposit' ? `Stake in ${activeStake.name}` : 'Staking Pools'}
                  </h2>
                  <p className="text-gray-500 text-sm">
                    {view === 'deposit' 
                      ? '30 Day Minimum Lock Period' 
                      : 'Higher APY with 30-day minimum lock'}
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
                  {STAKES.map((stake) => (
                    <div key={stake.id} className={`bg-white rounded-2xl border ${stake.theme.border} shadow-sm overflow-hidden relative group hover:shadow-md transition-all`}>
                      <div className="absolute top-0 right-0 p-4">
                        <div className={`px-3 py-1 ${stake.theme.light} ${stake.theme.text} text-xs font-bold rounded-full border ${stake.theme.border} flex items-center gap-1`}>
                          <Clock className="w-3 h-3" />
                          30 Days
                        </div>
                      </div>
                      
                      <div className="p-6 border-b border-gray-100">
                        <div className="flex items-center gap-4 mb-4">
                          <div className={`w-12 h-12 bg-gradient-to-br ${stake.theme.gradient} rounded-full flex items-center justify-center text-white shadow-lg ${stake.theme.shadow}`}>
                            <stake.Icon className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">{stake.name}</h3>
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <span className={`font-bold ${stake.theme.text}`}>{stake.apr}% APR</span>
                            </div>
                          </div>
                        </div>

                        <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                          Interest Allocation:<br/>
                          <span className="font-medium text-gray-900">30% Staker</span>, 
                          <span className="font-medium text-gray-900"> 30% Stake Pool</span>,<br/>
                          <span className="font-medium text-gray-900">20% Fiat Reserves</span>, 
                          <span className="font-medium text-gray-900"> 20% Swap Reserves</span>.
                        </p>

                        <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">Staked Balance</span>
                            <span className="font-mono font-bold text-gray-900">${staked[stake.id].toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">Rewards</span>
                            <span className={`font-mono font-bold ${stake.theme.text}`}>{rewards[stake.id].toFixed(6)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-gray-50 flex gap-3">
                        <button
                          onClick={() => openDepositModal(stake.id)}
                          className={`flex-1 py-2.5 ${stake.theme.primary} ${stake.theme.hover} text-white rounded-xl font-bold transition-colors shadow-lg ${stake.theme.shadow} flex items-center justify-center gap-2`}
                        >
                          <Wallet className="w-4 h-4" />
                          Stake
                        </button>
                        <button
                          onClick={() => handleClaim(stake.id)}
                          disabled={rewards[stake.id] <= 0}
                          className={`flex-1 py-2.5 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 border ${
                            rewards[stake.id] > 0
                              ? `bg-white ${stake.theme.border} ${stake.theme.text} ${stake.theme.light}`
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
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Select Asset to Stake</label>
                        <div className="grid grid-cols-3 gap-2">
                          {['USDC', 'USDT', 'PYUSD', 'BTC', 'ETH', 'XLM', 'xTSLA', 'xAAPL', 'xGOOGL', 'HOOD', 'OUSG', 'LINK'].map((asset) => (
                            <button
                              key={asset}
                              onClick={() => setSelectedAsset(asset)}
                              className={`py-3 rounded-xl text-sm font-medium transition-colors ${
                                selectedAsset === asset
                                  ? `${activeStake.theme.light} ${activeStake.theme.text} border ${activeStake.theme.border} ring-2 ${activeStake.theme.ring} ring-offset-2`
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
                            className={`w-full pl-4 pr-16 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:border-transparent outline-none font-mono text-xl ${activeStake.theme.ring}`}
                          />
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">
                            {selectedAsset}
                          </div>
                        </div>
                      </div>

                      <div className="bg-blue-50 p-4 rounded-xl flex items-start gap-3 border border-blue-100">
                        <ArrowRightLeft className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div className="text-sm text-blue-700">
                          <span className="font-bold">Async Swap:</span> Your {selectedAsset} will be automatically converted to Digital Dollars and staked for a minimum of 30 days.
                        </div>
                      </div>

                      <button
                        onClick={handleDeposit}
                        disabled={loading || !depositAmount}
                        className={`w-full py-4 text-white rounded-xl font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all ${activeStake.theme.primary} ${activeStake.theme.hover} ${activeStake.theme.shadow}`}
                      >
                        {loading ? (
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>{swapStatus === 'swapping' ? `Swapping ${selectedAsset} to USD...` : 'Staking USD...'}</span>
                          </div>
                        ) : (
                          <>
                            Confirm Stake
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
                  <span className="font-medium">Stake Successful! 30 Day Lock Active.</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
