import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ArrowRightLeft, Loader2, Coins, Wallet, CheckCircle, AlertCircle } from 'lucide-react';
import { swapToToken, fetchConfig, fetchRates } from '../lib/api';
import { ASSETS } from '../lib/constants';

export function SwapModal({ isOpen, onClose, address, balances, onUpdate }: { isOpen: boolean, onClose: () => void, address: string, balances: any[], onUpdate: () => void }) {
  const [tokens, setTokens] = useState<any[]>([]);
  const [rates, setRates] = useState<Record<string, number>>({});
  const [amount, setAmount] = useState('');
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [selectedTokenId, setSelectedTokenId] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchConfig().then(data => {
        setTokens(data.tokens);
        if (data.tokens.length > 0 && !selectedTokenId) setSelectedTokenId(data.tokens[5]?.id || data.tokens[0].id);
      });
      fetchRates().then(setRates);
      setSuccess(false);
      setError('');
      setAmount('');
    }
  }, [isOpen]);

  const handleSwap = async () => {
    if (!amount) return;
    setLoading(true);
    setError('');
    try {
      const res = await swapToToken(address, fromCurrency, selectedTokenId, parseFloat(amount));
      if (res.error) {
        setError(res.error);
      } else {
        setSuccess(true);
        onUpdate();
      }
    } catch (e: any) {
      console.error(e);
      setError('Swap failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setSuccess(false);
    setError('');
    setAmount('');
    onClose();
  };

  const availableCurrencies = balances.filter(b => !b.currency.startsWith('$') && b.amount > 0);
  const selectedToken = tokens.find(t => t.id === selectedTokenId);
  
  // Get details for the selected "Pay With" currency
  const fromAsset = ASSETS.find(a => a.code === fromCurrency) || { code: fromCurrency, label: fromCurrency, icon: Coins };
  const fromBalance = balances.find(b => b.currency === fromCurrency)?.amount || 0;
  const fromRate = rates[fromCurrency] || 0;

  // Group tokens by type
  const tokensByType = tokens.reduce((acc, token) => {
    if (!acc[token.type]) acc[token.type] = [];
    acc[token.type].push(token);
    return acc;
  }, {} as Record<string, any[]>);

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
            className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="bg-indigo-50 p-6 flex justify-between items-center border-b border-indigo-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg text-white">
                  <ArrowRightLeft className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-indigo-900 tracking-tight">Swap Tokens</h2>
                  <div className="text-xs text-indigo-600 font-medium">Exchange assets instantly</div>
                </div>
              </div>
              <button onClick={reset} className="p-2 hover:bg-indigo-100 rounded-full transition-colors text-indigo-400 hover:text-indigo-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar">
              {success ? (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Swap Successful</h3>
                  <p className="text-slate-500 mb-6">
                    You successfully swapped for <span className="font-bold text-slate-900">{amount} {selectedToken?.symbol}</span>
                  </p>
                  <button 
                    onClick={reset}
                    className="w-full py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {availableCurrencies.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                      Mint some generic fiat (USD, EUR, MXN) or Stellar assets first to swap into specific digital tokens.
                    </div>
                  ) : (
                    <>
                      {/* Source Currency Selection */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Pay With</label>
                        <select 
                          value={fromCurrency}
                          onChange={(e) => setFromCurrency(e.target.value)}
                          className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
                        >
                          {availableCurrencies.map(b => (
                            <option key={b.currency} value={b.currency}>
                              {b.currency}
                            </option>
                          ))}
                        </select>

                        {/* Selected Asset Details Card */}
                        <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-indigo-600">
                              <fromAsset.icon className="w-6 h-6" />
                            </div>
                            <div>
                              <div className="font-bold text-gray-900">{fromAsset.label}</div>
                              <div className="text-xs text-indigo-600 font-mono">{fromAsset.code}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900 flex items-center justify-end gap-1">
                              <Wallet className="w-3 h-3 text-gray-400" />
                              {fromBalance.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-500">
                              ${fromRate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Target Token Selection */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Select Digital Token</label>
                        <div className="space-y-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar border border-gray-100 rounded-xl p-2">
                          {Object.entries(tokensByType).map(([type, groupTokens]) => (
                            <div key={type}>
                              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 sticky top-0 bg-white py-1">{type} Tokens</div>
                              <div className="grid grid-cols-3 gap-2">
                                {(groupTokens as any[]).map((t: any) => (
                                  <button
                                    key={t.id}
                                    onClick={() => setSelectedTokenId(t.id)}
                                    className={`p-2 rounded-lg border text-sm font-medium transition-all ${
                                      selectedTokenId === t.id
                                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700 ring-1 ring-indigo-500'
                                        : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                                    }`}
                                  >
                                    {t.symbol}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Amount */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Quantity (Number of Tokens)</label>
                        <div className="relative">
                          <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="1"
                            className="w-full p-3 pl-10 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                          />
                          <Coins className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                        </div>
                        {selectedToken && amount && (
                          <p className="text-xs text-right text-gray-500 mt-1">
                            Est. Cost: ~${(selectedToken.val * parseFloat(amount) * (rates[selectedToken.type] || 1)).toFixed(2)} USD
                          </p>
                        )}
                      </div>

                      {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          {error}
                        </div>
                      )}

                      <button
                        onClick={handleSwap}
                        disabled={loading || !amount}
                        className="w-full py-3 px-4 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors shadow-lg shadow-indigo-200"
                      >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Swap'}
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
