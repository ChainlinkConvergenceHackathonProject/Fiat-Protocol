import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TrendingUp, ArrowRightLeft, Wallet, CheckCircle2, X, ArrowLeft, Activity, Globe, Building } from 'lucide-react';
import { fetchFarmData, stakeFarm, claimFarmRewards } from '../lib/api';

interface StockFarmModalProps {
  isOpen: boolean;
  onClose: () => void;
  address: string;
  onUpdate?: () => void;
}

type StockType = 'xTSLA' | 'xAAPL' | 'xGOOGL' | 'HOOD' | 'OUSG' | 'LINK';

interface StockConfig {
  id: StockType;
  name: string;
  ticker: string;
  apr: number;
  provider: string;
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

const STOCKS: StockConfig[] = [
  {
    id: 'xTSLA',
    name: 'Tesla (xStock)',
    ticker: 'TSLA',
    apr: 12.5,
    provider: 'Mirrored / Chainlink',
    description: 'Synthetics on Stellar',
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
    name: 'Apple (xStock)',
    ticker: 'AAPL',
    apr: 8.0,
    provider: 'Mirrored / Chainlink',
    description: 'Synthetics on Stellar',
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
    name: 'Google (xStock)',
    ticker: 'GOOGL',
    apr: 9.5,
    provider: 'Mirrored / Chainlink',
    description: 'Synthetics on Stellar',
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
    name: 'Robinhood',
    ticker: 'HOOD',
    apr: 15.0,
    provider: 'Robinhood Connect',
    description: 'Direct Stock Integration',
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
    name: 'Ondo US Gov',
    ticker: 'OUSG',
    apr: 5.2,
    provider: 'Ondo Finance',
    description: 'Tokenized US Treasuries',
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
    name: 'Chainlink',
    ticker: 'LINK',
    apr: 11.0,
    provider: 'Chainlink Oracle',
    description: 'Oracle Network Token',
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

export function StockFarmModal({ isOpen, onClose, address, onUpdate }: StockFarmModalProps) {
  const [staked, setStaked] = useState<Record<string, number>>({});
  const [rewards, setRewards] = useState<Record<string, number>>({});
  const [view, setView] = useState<'list' | 'deposit'>('list');
  const [activeStockId, setActiveStockId] = useState<StockType>('xTSLA');
  const [depositAmount, setDepositAmount] = useState('');
  const [selectedAsset, setSelectedAsset] = useState('USDC');
  const [loading, setLoading] = useState(false);
  const [swapStatus, setSwapStatus] = useState<'idle' | 'swapping' | 'staking'>('idle');
  const [showSuccess, setShowSuccess] = useState(false);

  const activeStock = STOCKS.find(f => f.id === activeStockId) || STOCKS[0];

  const loadData = async () => {
    if (!address) return;
    try {
        const data = await fetchFarmData(address);
        const newStaked: any = { ...staked };
        const newRewards: any = { ...rewards };
        
        Object.keys(data).forEach((key) => {
            newStaked[key] = data[key].staked;
            newRewards[key] = data[key].rewards;
        });
        setStaked(newStaked);
        setRewards(newRewards);
    } catch (e) {
        console.error("Failed to load stock farm data", e);
    }
  };

  useEffect(() => {
    loadData();
  }, [address]);

  const openDepositModal = (id: StockType) => {
    setActiveStockId(id);
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
        
        await stakeFarm(address, activeStockId, selectedAsset, Number(depositAmount));
        
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

  const handleClaim = async (id: StockType) => {
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
                  <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                    <Activity className="w-6 h-6" />
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {view === 'deposit' ? `Farm ${activeStock.name}` : 'Stock Farms'}
                  </h2>
                  <p className="text-gray-500 text-sm">
                    {view === 'deposit' 
                      ? 'Deposit stocks to earn yield via Soroban Contracts' 
                      : 'Tokenized Stocks & RWA Yield Farming'}
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
                  {STOCKS.map((stock) => (
                    <div key={stock.id} className={`bg-white rounded-2xl border ${stock.theme.border} shadow-sm overflow-hidden relative group hover:shadow-md transition-all`}>
                      <div className="absolute top-0 right-0 p-4">
                        <div className={`px-3 py-1 ${stock.theme.light} ${stock.theme.text} text-xs font-bold rounded-full border ${stock.theme.border} flex items-center gap-1`}>
                          <Globe className="w-3 h-3" />
                          {stock.provider}
                        </div>
                      </div>
                      
                      <div className="p-6 border-b border-gray-100">
                        <div className="flex items-center gap-4 mb-4">
                          <div className={`w-12 h-12 bg-gradient-to-br ${stock.theme.gradient} rounded-full flex items-center justify-center text-white shadow-lg ${stock.theme.shadow}`}>
                            <stock.Icon className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">{stock.name}</h3>
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <span className={`font-bold ${stock.theme.text}`}>{stock.apr}% APR</span>
                            </div>
                          </div>
                        </div>

                        <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                          Interest Allocation:<br/>
                          <span className="font-medium text-gray-900">25% Farmer ({stock.ticker})</span>,<br/>
                          <span className="font-medium text-gray-900">25% Farm Balance (USD)</span>,<br/>
                          <span className="font-medium text-gray-900">50% Fiat Reserves (yUSDC)</span>.
                        </p>

                        <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">Staked Balance</span>
                            <span className="font-mono font-bold text-gray-900">${(staked[stock.id] || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">Rewards</span>
                            <span className={`font-mono font-bold ${stock.theme.text}`}>{(rewards[stock.id] || 0).toFixed(6)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-gray-50 flex gap-3">
                        <button
                          onClick={() => openDepositModal(stock.id)}
                          className={`flex-1 py-2.5 ${stock.theme.primary} ${stock.theme.hover} text-white rounded-xl font-bold transition-colors shadow-lg ${stock.theme.shadow} flex items-center justify-center gap-2`}
                        >
                          <Wallet className="w-4 h-4" />
                          Deposit
                        </button>
                        <button
                          onClick={() => handleClaim(stock.id)}
                          disabled={(rewards[stock.id] || 0) <= 0}
                          className={`flex-1 py-2.5 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 border ${
                            (rewards[stock.id] || 0) > 0
                              ? `bg-white ${stock.theme.border} ${stock.theme.text} ${stock.theme.light}`
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
                          {['USDC', 'USDT', 'PYUSD', 'xTSLA', 'xAAPL', 'xGOOGL', 'HOOD', 'OUSG', 'LINK'].map((asset) => (
                            <button
                              key={asset}
                              onClick={() => setSelectedAsset(asset)}
                              className={`py-3 rounded-xl text-sm font-medium transition-colors ${
                                selectedAsset === asset
                                  ? `${activeStock.theme.light} ${activeStock.theme.text} border ${activeStock.theme.border} ring-2 ${activeStock.theme.ring} ring-offset-2`
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
                            className={`w-full pl-4 pr-16 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:border-transparent outline-none font-mono text-xl ${activeStock.theme.ring}`}
                          />
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">
                            {selectedAsset}
                          </div>
                        </div>
                      </div>

                      <div className="bg-blue-50 p-4 rounded-xl flex items-start gap-3 border border-blue-100">
                        <ArrowRightLeft className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div className="text-sm text-blue-700">
                          <span className="font-bold">Async Swap:</span> {selectedAsset} is converted to Digital Dollars and deposited into the Soroban Contract.
                        </div>
                      </div>

                      <button
                        onClick={handleDeposit}
                        disabled={loading || !depositAmount}
                        className={`w-full py-4 text-white rounded-xl font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all ${activeStock.theme.primary} ${activeStock.theme.hover} ${activeStock.theme.shadow}`}
                      >
                        {loading ? (
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>{swapStatus === 'swapping' ? `Swapping ${selectedAsset}...` : 'Depositing...'}</span>
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
                  <span className="font-medium">Stock Farm Deposit Successful!</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
