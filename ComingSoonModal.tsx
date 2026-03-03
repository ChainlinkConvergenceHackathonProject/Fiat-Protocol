import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TrendingDown, ArrowRightLeft, Wallet, CheckCircle2, X, ArrowLeft, Banknote, Info, AlertTriangle } from 'lucide-react';
import { fetchFarmData, stakeFarm } from '../lib/api';

interface BorrowModalProps {
  isOpen: boolean;
  onClose: () => void;
  address: string;
  onUpdate?: () => void;
}

export function BorrowModal({ isOpen, onClose, address, onUpdate }: BorrowModalProps) {
  const [view, setView] = useState<'overview' | 'borrow' | 'repay'>('overview');
  const [borrowAmount, setBorrowAmount] = useState('');
  const [collateralAmount, setCollateralAmount] = useState('');
  const [selectedAsset, setSelectedAsset] = useState('USDC');
  const [loading, setLoading] = useState(false);
  const [swapStatus, setSwapStatus] = useState<'idle' | 'swapping' | 'borrowing'>('idle');
  const [showSuccess, setShowSuccess] = useState(false);
  const [borrowBalance, setBorrowBalance] = useState(0);
  const [collateralBalance, setCollateralBalance] = useState(0);

  // Mock loading borrow data
  useEffect(() => {
    if (isOpen) {
      setBorrowBalance(500.00); 
      setCollateralBalance(1500.00);
    }
  }, [isOpen]);

  const handleBorrow = async () => {
    if (!collateralAmount || isNaN(Number(collateralAmount)) || !address) return;
    setLoading(true);
    setSwapStatus('swapping');
    
    try {
        await new Promise(resolve => setTimeout(resolve, 1500));
        setSwapStatus('borrowing');
        
        // Simulate API call
        await stakeFarm(address, 'borrow-pool', selectedAsset, Number(collateralAmount));
        
        setCollateralAmount('');
        setBorrowAmount('');
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
        alert("Borrow failed.");
    }
  };

  const calculateBorrowAmount = (collateral: number) => {
    return collateral / 2.7;
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
                {view !== 'overview' ? (
                  <button 
                    onClick={() => setView('overview')}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors mr-2"
                  >
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                  </button>
                ) : (
                  <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                    <TrendingDown className="w-6 h-6" />
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Borrowing Pool</h2>
                  <p className="text-gray-500 text-sm">Borrow against your crypto assets</p>
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
                        <div className="text-sm text-gray-500 mb-1">Outstanding Debt</div>
                        <div className="text-3xl font-bold text-gray-900 font-mono">${borrowBalance.toLocaleString()}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500 mb-1">Collateral Value</div>
                        <div className="text-3xl font-bold text-emerald-600">${collateralBalance.toLocaleString()}</div>
                      </div>
                    </div>

                    <div className="p-4 bg-orange-50 rounded-xl border border-orange-100 mb-6">
                      <h4 className="font-bold text-orange-900 mb-2 flex items-center gap-2">
                        <Info className="w-4 h-4" />
                        Borrow Rules
                      </h4>
                      <div className="grid grid-cols-1 gap-y-2 text-sm text-orange-700">
                        <div>• Max Borrow: Collateral / 2.7</div>
                        <div>• Interest: 5% Fixed APR</div>
                        <div>• Collateral is auto-swapped to Digital Dollars</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => setView('borrow')}
                        className="w-full py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-colors shadow-lg shadow-orange-200 flex items-center justify-center gap-2"
                      >
                        <Wallet className="w-5 h-5" />
                        Borrow More
                      </button>
                      <button
                        onClick={() => setView('repay')}
                        className="w-full py-3 bg-white text-gray-700 border border-gray-200 rounded-xl font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                      >
                        <ArrowRightLeft className="w-5 h-5" />
                        Repay Loan
                      </button>
                    </div>
                  </div>
                </div>
              ) : view === 'borrow' ? (
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Select Collateral Asset</label>
                      <div className="grid grid-cols-3 gap-2 mb-6">
                        {['USDC', 'USDT', 'PYUSD', 'BTC', 'ETH', 'XLM'].map((asset) => (
                          <button
                            key={asset}
                            onClick={() => setSelectedAsset(asset)}
                            className={`py-3 rounded-xl text-sm font-medium transition-colors ${
                              selectedAsset === asset
                                ? 'bg-orange-50 text-orange-700 border border-orange-200 ring-2 ring-orange-500 ring-offset-2'
                                : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                            }`}
                          >
                            {asset}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Collateral Amount</label>
                      <div className="relative mb-6">
                        <input
                          type="number"
                          value={collateralAmount}
                          onChange={(e) => {
                            setCollateralAmount(e.target.value);
                            setBorrowAmount((Number(e.target.value) / 2.7).toFixed(2));
                          }}
                          placeholder="0.00"
                          className="w-full pl-4 pr-16 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:border-transparent outline-none font-mono text-xl focus:ring-orange-500"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">
                          {selectedAsset}
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-500">You Receive (Est.)</span>
                        <span className="font-bold text-gray-900 text-lg">${borrowAmount || '0.00'} USD</span>
                      </div>
                      <div className="text-xs text-gray-400 text-right">
                        Based on 2.7x Collateral Ratio
                      </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-xl flex items-start gap-3 border border-blue-100 mb-6">
                      <ArrowRightLeft className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div className="text-sm text-blue-700">
                        <span className="font-bold">Async Swap:</span> Collateral is converted to Digital Dollars and staked.
                      </div>
                    </div>

                    <button
                      onClick={handleBorrow}
                      disabled={loading || !collateralAmount}
                      className="w-full py-4 bg-orange-600 text-white rounded-xl font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all hover:bg-orange-700"
                    >
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>{swapStatus === 'swapping' ? `Swapping ${selectedAsset}...` : 'Processing Loan...'}</span>
                        </div>
                      ) : (
                        <>
                          Confirm Borrow
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Repay Loan</h3>
                    <p className="text-gray-600 mb-6">
                      Repay your loan to unlock your collateral. A 2% reconsolidation fee applies.
                    </p>
                    
                    <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 mb-6 flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div className="text-sm text-yellow-700">
                        <span className="font-bold">Reconsolidation:</span> Collateral - (Owed + 2%) = Pay Off Amount.
                      </div>
                    </div>

                    <button
                      className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold shadow-lg hover:bg-gray-800 transition-all"
                      onClick={() => alert("Repayment logic coming soon!")}
                    >
                      Repay Full Balance
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
                  <span className="font-medium">Loan Approved! Funds Sent to Wallet.</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
