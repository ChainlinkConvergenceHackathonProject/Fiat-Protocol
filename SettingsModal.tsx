import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, QrCode, Copy, CheckCircle } from 'lucide-react';

export function ReceiveModal({ isOpen, onClose, address }: { isOpen: boolean, onClose: () => void, address: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="bg-slate-900 text-white p-6 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <QrCode className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight">Receive Assets</h2>
                  <div className="text-xs text-slate-400 font-mono">Your Wallet Address</div>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 flex flex-col items-center">
              <div className="w-48 h-48 bg-slate-100 rounded-xl flex items-center justify-center mb-6 border border-slate-200">
                {/* Placeholder for QR Code */}
                <QrCode className="w-24 h-24 text-slate-400" />
              </div>

              <div className="w-full bg-slate-50 p-4 rounded-xl border border-slate-200 mb-4 flex items-center justify-between gap-2">
                <span className="font-mono text-sm text-slate-600 truncate">{address}</span>
                <button 
                  onClick={handleCopy}
                  className="p-2 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors"
                >
                  {copied ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <p className="text-xs text-center text-slate-400 max-w-xs">
                Send only Stellar-compatible assets to this address. Sending other assets may result in permanent loss.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
