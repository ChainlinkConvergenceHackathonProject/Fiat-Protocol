import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { withdrawAsset } from '../lib/api';
import { ASSETS } from '../lib/constants';

export function SendModal({ isOpen, onClose, address, balances, onUpdate }: { isOpen: boolean, onClose: () => void, address: string, balances: any[], onUpdate: () => void }) {
  const [step, setStep] = useState<'input' | 'confirm' | 'success'>('input');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedAsset, setSelectedAsset] = useState('BTC');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async () => {
    setLoading(true);
    setError('');
    try {
      // Use withdrawAsset to handle async swaps (e.g. yBTC -> BTC)
      await withdrawAsset(address, recipient, selectedAsset, parseFloat(amount));
      setStep('success');
      onUpdate();
    } catch (e: any) {
      setError(e.message || 'Transfer failed');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep('input');
    setRecipient('');
    setAmount('');
    setError('');
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
            className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="bg-slate-900 text-white p-6 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Send className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight">Send Assets</h2>
                  <div className="text-xs text-slate-400 font-mono">Transfer to another wallet</div>
                </div>
              </div>
              <button onClick={reset} className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {step === 'input' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Recipient Address</label>
                    <input 
                      type="text" 
                      placeholder="G..." 
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Asset to Send</label>
                      <select 
                        value={selectedAsset}
                        onChange={(e) => setSelectedAsset(e.target.value)}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                      >
                        {ASSETS.map((a) => (
                          <option key={a.code} value={a.code}>{a.code} ({a.label})</option>
                        ))}
                      </select>
                      <p className="text-xs text-slate-400 mt-1">
                        Select the asset the recipient should receive. We'll automatically swap from your holdings (e.g. yBTC {'->'} BTC).
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Amount</label>
                      <input 
                        type="number" 
                        placeholder="0.00" 
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {error}
                    </div>
                  )}

                  <button 
                    onClick={() => setStep('confirm')}
                    disabled={!recipient || !amount}
                    className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    Review Transfer <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {step === 'confirm' && (
                <div className="space-y-6">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Recipient</span>
                      <span className="font-mono font-medium text-slate-900 truncate max-w-[200px]">{recipient}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Amount</span>
                      <span className="font-bold text-slate-900">{amount} {selectedAsset}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Network Fee</span>
                      <span className="font-mono text-slate-900">0.00 XLM</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button 
                      onClick={() => setStep('input')}
                      className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
                    >
                      Back
                    </button>
                    <button 
                      onClick={handleSend}
                      disabled={loading}
                      className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {loading ? 'Sending...' : 'Confirm Send'}
                    </button>
                  </div>
                </div>
              )}

              {step === 'success' && (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Transfer Successful</h3>
                  <p className="text-slate-500 mb-6">
                    You sent <span className="font-bold text-slate-900">{amount} {selectedAsset}</span> to <span className="font-mono text-slate-700">{recipient.slice(0, 4)}...{recipient.slice(-4)}</span>
                  </p>
                  <button 
                    onClick={reset}
                    className="w-full py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
