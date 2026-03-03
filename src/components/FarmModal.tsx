import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Tractor, Coins, ArrowRightLeft, TrendingUp, Wallet, CheckCircle2, Bitcoin, Banknote, Zap, X, ArrowLeft, Activity, Globe, Building } from 'lucide-react';
import { fetchFarmData, stakeFarm, claimFarmRewards, processFarmYield } from '../lib/api';

interface FarmModalProps {
  isOpen: boolean;
  onClose: () => void;
  address: string;
  onUpdate?: () => void;
}

type FarmType = 'gold' | 'silver' | 'digital-dollar' | 'bitcoin' | 'ethereum' | 'xTSLA' | 'xAAPL' | 'xGOOGL' | 'HOOD' | 'OUSG' | 'LINK';

interface FarmConfig {
  id: FarmType;
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

const FARMS: FarmConfig[] = [
  {
    id: 'gold',
    name: 'Gold Farm',
    apr: 12.5,
    rewardToken: 'GOLD',
    description: 'Earn $GOLD + Compound',
    Icon: Coins,
    theme: {
      primary: 'bg-amber-500',
      hover: 'hover:bg-amber-600',
      text: 'text-amber-600',
      light: 'bg-amber-50',
      border: 'border-amber-200',
      gradient: 'from-amber-400 to-yellow-600',
      shadow: 'shadow-amber-200',
      ring: 'focus:ring-amber-500'
    }
  },
  {
    id: 'silver',
    name: 'Silver Farm',
    apr: 10.0,
    rewardToken: 'SLVR',
    description: 'Earn $SLVR + Compound',
    Icon: Coins,
    theme: {
      primary: 'bg-slate-600',
      hover: 'hover:bg-slate-700',
      text: 'text-slate-600',
      light: 'bg-slate-50',
      border: 'border-slate-200',
      gradient: 'from-slate-300 to-slate-500',
      shadow: 'shadow-slate-200',
      ring: 'focus:ring-slate-500'
    }
  },
  {
    id: 'digital-dollar',
    name: 'Digital Dollar Farm',
    apr: 15.0,
    rewardToken: 'Digital Dollars',
    description: 'Earn Digital Dollars + Compound',
    Icon: Banknote,
    theme: {
      primary: 'bg-emerald-600',
      hover: 'hover:bg-emerald-700',
      text: 'text-emerald-600',
      light: 'bg-emerald-50',
      border: 'border-emerald-200',
      gradient: 'from-emerald-400 to-teal-600',
      shadow: 'shadow-emerald-200',
      ring: 'focus:ring-emerald-500'
    }
  },
  {
    id: 'bitcoin',
    name: 'Bitcoin Farm',
    apr: 5.0,
    rewardToken: 'yBTC',
    description: 'Earn $yBTC + Compound',
    Icon: Bitcoin,
    theme: {
      primary: 'bg-orange-500',
      hover: 'hover:bg-orange-600',
      text: 'text-orange-600',
      light: 'bg-orange-50',
      border: 'border-orange-200',
      gradient: 'from-orange-400 to-red-500',
      shadow: 'shadow-orange-200',
      ring: 'focus:ring-orange-500'
    }
  },
  {
    id: 'ethereum',
    name: 'Ethereum Farm',
    apr: 6.0,
    rewardToken: 'yETH',
    description: 'Earn $yETH + Compound',
    Icon: Zap,
    theme: {
      primary: 'bg-violet-600',
      hover: 'hover:bg-violet-700',
      text: 'text-violet-600',
      light: 'bg-violet-50',
      border: 'border-violet-200',
      gradient: 'from-violet-400 to-purple-600',
      shadow: 'shadow-violet-200',
      ring: 'focus:ring-violet-500'
    }
  },
  {
    id: 'xTSLA',
    name: 'Tesla Farm',
    apr: 12.5,
    rewardToken: 'TSLA',
    description: 'Earn $TSLA + Compound',
    Icon: Activity,
    theme: {
      primary: 'bg-red-600',
      hover: 'hover:bg-red-700',
      text: 'text-red-600',
      light: 'bg-red-50',
      border: 'border-red-200',
      gradient: 'from-red-500 to-red-700',
      shadow: 'shadow-red-200',
      ring: 'focus:ring-red-600'
    }
  },
  {
    id: 'xAAPL',
    name: 'Apple Farm',
    apr: 8.0,
    rewardToken: 'AAPL',
    description: 'Earn $AAPL + Compound',
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
    name: 'Google Farm',
    apr: 9.5,
    rewardToken: 'GOOGL',
    description: 'Earn $GOOGL + Compound',
    Icon: Globe,
    theme: {
      primary: 'bg-blue-600',
      hover: 'hover:bg-blue-700',
      text: 'text-blue-600',
      light: 'bg-blue-50',
      border: 'border-blue-200',
      gradient: 'from-blue-500 to-blue-700',
      shadow: 'shadow-blue-200',
      ring: 'focus:ring-blue-600'
    }
  },
  {
    id: 'HOOD',
    name: 'Robinhood Farm',
    apr: 15.0,
    rewardToken: 'HOOD',
    description: 'Earn $HOOD + Compound',
    Icon: Activity,
    theme: {
      primary: 'bg-green-600',
      hover: 'hover:bg-green-700',
      text: 'text-green-600',
      light: 'bg-green-50',
      border: 'border-green-200',
      gradient: 'from-green-500 to-emerald-700',
      shadow: 'shadow-green-200',
      ring: 'focus:ring-green-600'
    }
  },
  {
    id: 'OUSG',
    name: 'Ondo Gov Farm',
    apr: 5.2,
    rewardToken: 'OUSG',
    description: 'Earn $OUSG + Compound',
    Icon: Building,
    theme: {
      primary: 'bg-indigo-600',
      hover: 'hover:bg-indigo-700',
      text: 'text-indigo-600',
      light: 'bg-indigo-50',
      border: 'border-indigo-200',
      gradient: 'from-indigo-500 to-purple-700',
      shadow: 'shadow-indigo-200',
      ring: 'focus:ring-indigo-600'
    }
  },
  {
    id: 'LINK',
    name: 'Chainlink Farm',
    apr: 11.0,
    rewardToken: 'LINK',
    description: 'Earn $LINK + Compound',
    Icon: Activity,
    theme: {
      primary: 'bg-blue-500',
      hover: 'hover:bg-blue-600',
      text: 'text-blue-500',
      light: 'bg-blue-50',
      border: 'border-blue-200',
      gradient: 'from-blue-400 to-cyan-600',
      shadow: 'shadow-blue-200',
      ring: 'focus:ring-blue-500'
    }
  }
];

export function FarmModal({ isOpen, onClose, address, onUpdate }: FarmModalProps) {
  // Farm States
  const [staked, setStaked] = useState<Record<FarmType, number>>({
    gold: 0,
    silver: 0,
    'digital-dollar': 0,
    bitcoin: 0,
    ethereum: 0,
    xTSLA: 0,
    xAAPL: 0,
    xGOOGL: 0,
    HOOD: 0,
    OUSG: 0,
    LINK: 0
  });
  
  const [rewards, setRewards] = useState<Record<FarmType, number>>({
    gold: 0,
    silver: 0,
    'digital-dollar': 0,
    bitcoin: 0,
    ethereum: 0,
    xTSLA: 0,
    xAAPL: 0,
    xGOOGL: 0,
    HOOD: 0,
    OUSG: 0,
    LINK: 0
  });

  // UI States
  const [view, setView] = useState<'list' | 'deposit'>('list');
  const [activeFarmId, setActiveFarmId] = useState<FarmType>('gold');
  const [depositAmount, setDepositAmount] = useState('');
  const [selectedAsset, setSelectedAsset] = useState('USDC');
  const [loading, setLoading] = useState(false);
  const [swapStatus, setSwapStatus] = useState<'idle' | 'swapping' | 'staking'>('idle');
  const [showSuccess, setShowSuccess] = useState(false);

  const activeFarm = FARMS.find(f => f.id === activeFarmId) || FARMS[0];

  const loadFarmData = async () => {
    if (!address) return;
    try {
        const data = await fetchFarmData(address);
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
        console.error("Failed to load farm data", e);
    }
  };

  useEffect(() => {
    loadFarmData();
  }, [address]);

  // Simulate Yield Generation (Backend Trigger)
  useEffect(() => {
    if (!address) return;
    
    const interval = setInterval(async () => {
      try {
        await processFarmYield(); // Trigger backend calculation
        await loadFarmData(); // Refresh UI
      } catch (e) {
        console.error("Yield process failed", e);
      }
    }, 5000); // 5 seconds

    return () => clearInterval(interval);
  }, [address]);

  const openDepositModal = (farmId: FarmType) => {
    setActiveFarmId(farmId);
    setView('deposit');
    setDepositAmount('');
    setSwapStatus('idle');
  };

  const handleDeposit = async () => {
    if (!depositAmount || isNaN(Number(depositAmount)) || !address) return;
    setLoading(true);
    setSwapStatus('swapping');
    
    try {
        // Simulate async swap delay for UX
        await new Promise(resolve => setTimeout(resolve, 1500));
        setSwapStatus('staking');
        
        await stakeFarm(address, activeFarmId, selectedAsset, Number(depositAmount));
        
        setDepositAmount('');
        setLoading(false);
        setSwapStatus('idle');
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          setView('list');
        }, 2000);
        
        loadFarmData();
        if (onUpdate) onUpdate();
    } catch (e) {
        console.error(e);
        setLoading(false);
        setSwapStatus('idle');
        alert("Deposit failed. Check console.");
    }
  };

  const handleClaim = async (farmId: FarmType) => {
    if (!address) return;
    try {
        const res = await claimFarmRewards(address, farmId);
        if (res.success) {
            alert(`Claimed ${res.claimed.toFixed(6)} ${res.token}!`);
            loadFarmData();
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
                  <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                    <Tractor className="w-6 h-6" />
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {view === 'deposit' ? `Deposit to ${activeFarm.name}` : 'Yield Farms'}
                  </h2>
                  <p className="text-gray-500 text-sm">
                    {view === 'deposit' 
                      ? 'Assets are auto-swapped to Digital Dollars' 
                      : 'Deposit assets to earn yield in multiple currencies'}
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
                  {FARMS.map((farm) => (
                    <div key={farm.id} className={`bg-white rounded-2xl border ${farm.theme.border} shadow-sm overflow-hidden relative group hover:shadow-md transition-all`}>
                      <div className="absolute top-0 right-0 p-4">
                        <div className={`px-3 py-1 ${farm.theme.light} ${farm.theme.text} text-xs font-bold rounded-full border ${farm.theme.border}`}>
                          {farm.apr}% APR
                        </div>
                      </div>
                      
                      <div className="p-6 border-b border-gray-100">
                        <div className="flex items-center gap-4 mb-4">
                          <div className={`w-12 h-12 bg-gradient-to-br ${farm.theme.gradient} rounded-full flex items-center justify-center text-white shadow-lg ${farm.theme.shadow}`}>
                            <farm.Icon className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">{farm.name}</h3>
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <span className={`font-medium ${farm.theme.text}`}>{farm.description}</span>
                            </div>
                          </div>
                        </div>

                        <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                          Yield split: 
                          <span className="font-medium text-gray-900"> 25% {farm.rewardToken}</span>, 
                          <span className="font-medium text-gray-900"> 25% Compound</span>, 
                          <span className="font-medium text-gray-900"> 50% Reserves</span>.
                        </p>

                        <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">Staked</span>
                            <span className="font-mono font-bold text-gray-900">${staked[farm.id].toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">Rewards</span>
                            <span className={`font-mono font-bold ${farm.theme.text}`}>{rewards[farm.id].toFixed(6)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-gray-50 flex gap-3">
                        <button
                          onClick={() => openDepositModal(farm.id)}
                          className={`flex-1 py-2.5 ${farm.theme.primary} ${farm.theme.hover} text-white rounded-xl font-bold transition-colors shadow-lg ${farm.theme.shadow} flex items-center justify-center gap-2`}
                        >
                          <Wallet className="w-4 h-4" />
                          Deposit
                        </button>
                        <button
                          onClick={() => handleClaim(farm.id)}
                          disabled={rewards[farm.id] <= 0}
                          className={`flex-1 py-2.5 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 border ${
                            rewards[farm.id] > 0
                              ? `bg-white ${farm.theme.border} ${farm.theme.text} ${farm.theme.light}`
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">Select Asset to Deposit</label>
                        <div className="grid grid-cols-3 gap-2">
                          {['USDC', 'USDT', 'PYUSD', 'BTC', 'ETH', 'XLM', 'xTSLA', 'xAAPL', 'xGOOGL', 'HOOD', 'OUSG', 'LINK'].map((asset) => (
                            <button
                              key={asset}
                              onClick={() => setSelectedAsset(asset)}
                              className={`py-3 rounded-xl text-sm font-medium transition-colors ${
                                selectedAsset === asset
                                  ? `${activeFarm.theme.light} ${activeFarm.theme.text} border ${activeFarm.theme.border} ring-2 ${activeFarm.theme.ring} ring-offset-2`
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
                            className={`w-full pl-4 pr-16 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:border-transparent outline-none font-mono text-xl ${activeFarm.theme.ring}`}
                          />
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">
                            {selectedAsset}
                          </div>
                        </div>
                      </div>

                      <div className="bg-blue-50 p-4 rounded-xl flex items-start gap-3 border border-blue-100">
                        <ArrowRightLeft className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div className="text-sm text-blue-700">
                          <span className="font-bold">Async Swap:</span> Your {selectedAsset} will be automatically converted to Digital Dollars at the current market rate before being staked.
                        </div>
                      </div>

                      <button
                        onClick={handleDeposit}
                        disabled={loading || !depositAmount}
                        className={`w-full py-4 text-white rounded-xl font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all ${activeFarm.theme.primary} ${activeFarm.theme.hover} ${activeFarm.theme.shadow}`}
                      >
                        {loading ? (
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>{swapStatus === 'swapping' ? `Swapping ${selectedAsset} to USD...` : 'Staking USD...'}</span>
                          </div>
                        ) : (
                          <>
                            Confirm Deposit
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
                  <span className="font-medium">Deposit Successful! Farming started.</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
