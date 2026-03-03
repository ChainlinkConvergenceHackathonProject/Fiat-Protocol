import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TrendingUp, ArrowRightLeft, Wallet, CheckCircle2, X, ArrowLeft, Banknote, Info } from 'lucide-react';
import { fetchFarmData, stakeFarm } from '../lib/api';

interface LendModalProps {
  isOpen: boolean;
  onClose: () => void;
  address: string;
  onUpdate?: () => void;
}

export function LendModal({ isOpen, onClose, address, onUpdate }: LendModalProps) {
  const [view, setView] = useState<'overview' | 'deposit'>('overview');
  const [depositAmount, setDepositAmount] = useState('');
  const [selectedAsset, setSelectedAsset] = useState('USDC');
  const [loading, setLoading] = useState(false);
  const [swapStatus, setSwapStatus] = useState<'idle' | 'swapping' | 'lending'>('idle');
  const [showSuccess, setShowSuccess] = useState(false);
  const [lendBalance, setLendBalance] = useState(0);

  // Mock loading lend data
  useEffect(() => {
    if (isOpen) {
      // Simulate fetching lend balance
      setLendBalance(1250.45); 
    }
  }, [isOpen]);

  const handleDeposit = async () => {
    if (!depositAmount || isNaN(Number(depositAmount)) || !address) return;
    setLoading(true);
    setSwapStatus('swapping');
    
    try {
        await new Promise(resolve => setTimeout(resolve, 1500));
        setSwapStatus('lending');
        
        // Simulate API call
        await stakeFarm(address, 'lend-pool', selectedAsset, Number(depositAmount));
        
        setDepositAmount('');
        setLoading(false);
        setSwapStatus('idle');
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          setView('overview');
        }, 2000);
        
        if (onUpdate) onUpdate();
    } catch (e) {
        console.error(e);
        setLoading(false);
        setSwapStatus('idle');
        alert("Lend deposit failed.");
    }
  };

  const reset = () => {
    setView('overview');
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
            className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-white border-b border-gray-100 p-6 flex justify-between items-center">
              <div className="flex items-center gap-3">
                {view === 'deposit' ? (
                  <button 
                    onClick={() => setView('overview')}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors mr-2"
                  >
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                  </button>
                ) : (
                  <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Lending Pool</h2>
                  <p className="text-gray-500 text-sm">Earn yield by lending assets to borrowers</p>
                </div>
              </div>
              <button onClick={reset} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 bg-gray-50 flex-1">
              {view === 'overview' ? (
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <div className="text-sm text-gray-500 mb-1">Your Lend Balance</div>
                        <div className="text-3xl font-bold text-gray-900 font-mono">${lendBalance.toLocaleString()}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500 mb-1">APY</div>
                        <div className="text-3xl font-bold text-emerald-600">8.5%</div>
                      </div>
                    </div>

                    <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100 mb-6">
                      <h4 className="font-bold text-indigo-900 mb-2 flex items-center gap-2">
                        <Info className="w-4 h-4" />
                        Interest Allocation
                      </h4>
                      <div className="grid grid-cols-2 gap-y-2 text-sm text-indigo-700">
                        <div>• 25% to Lender (You)</div>
                        <div>• 25% to Fiat Reserves</div>
                        <div>• 10% to Lend Pool Balance</div>
                        <div>• 40% to Borrow Pool</div>
                      </div>
                    </div>

                    <button
                      onClick={() => setView('deposit')}
                      className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
                    >
                      <Wallet className="w-5 h-5" />
                      Deposit Assets
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Select Asset to Lend</label>
                      <div className="grid grid-cols-3 gap-2 mb-6">
                        {['USDC', 'USDT', 'PYUSD', 'BTC', 'ETH', 'XLM'].map((asset) => (
                          <button
                            key={asset}
                            onClick={() => setSelectedAsset(asset)}
                            className={`py-3 rounded-xl text-sm font-medium transition-colors ${
                              selectedAsset === asset
                                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 ring-2 ring-indigo-500 ring-offset-2'
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
                      <div className="relative mb-6">
                        <input
                          type="number"
                          value={depositAmount}
                          onChange={(e) => setDepositAmount(e.target.value)}
                          placeholder="0.00"
                          className="w-full pl-4 pr-16 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:border-transparent outline-none font-mono text-xl focus:ring-indigo-500"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">
                          {selectedAsset}
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-xl flex items-start gap-3 border border-blue-100 mb-6">
                      <ArrowRightLeft className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div className="text-sm text-blue-700">
                        <span className="font-bold">Async Swap:</span> Assets are converted to Digital Dollars before lending. Minimum 7 day lock.
                      </div>
                    </div>

                    <button
                      onClick={handleDeposit}
                      disabled={loading || !depositAmount}
                      className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all hover:bg-indigo-700"
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
                  <span className="font-medium">Assets Deposited to Lending Pool!</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
