import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bitcoin, ArrowRightLeft, CheckCircle2, X, Shield, AlertTriangle, Loader2 } from 'lucide-react';

interface BitcoinMigrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BitcoinMigrationModal({ isOpen, onClose }: BitcoinMigrationModalProps) {
  const [step, setStep] = useState<'intro' | 'input' | 'processing' | 'success'>('intro');
  const [btcAddress, setBtcAddress] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [loading, setLoading] = useState(false);

  const handleMigrate = async () => {
    if (!btcAddress || !privateKey) return;
    setLoading(true);
    setStep('processing');
    
    try {
      // Simulate migration process
      await new Promise(resolve => setTimeout(resolve, 3000));
      setLoading(false);
      setStep('success');
    } catch (e) {
      console.error(e);
      setLoading(false);
      alert("Migration failed. Please verify credentials.");
      setStep('input');
    }
  };

  const reset = () => {
    setStep('intro');
    setBtcAddress('');
    setPrivateKey('');
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
            className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="bg-orange-500 p-6 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Bitcoin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Bitcoin Migration</h2>
                  <p className="text-orange-100 text-sm">Legacy BTC to Digital Dollar Swap</p>
                </div>
              </div>
              <button onClick={reset} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {step === 'intro' && (
                <div className="space-y-6">
                  <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 text-orange-800 text-sm">
                    <p className="font-bold mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Important Notice
                    </p>
                    This tool is for migrating legacy Bitcoin addresses to the Digital Dollar protocol. 
                    Your BTC will be swapped to Digital Dollars and staked automatically.
                  </div>

                  <ul className="space-y-3 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      Instant Swap to Digital Dollars
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      Auto-Stake for Yield Generation
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      Secure Private Key Handling
                    </li>
                  </ul>

                  <button
                    onClick={() => setStep('input')}
                    className="w-full py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-colors shadow-lg shadow-orange-200"
                  >
                    Start Migration
                  </button>
                </div>
              )}

              {step === 'input' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bitcoin Address</label>
                    <input
                      type="text"
                      value={btcAddress}
                      onChange={(e) => setBtcAddress(e.target.value)}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-mono text-sm"
                      placeholder="bc1q..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Private Key (WIF)</label>
                    <input
                      type="password"
                      value={privateKey}
                      onChange={(e) => setPrivateKey(e.target.value)}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-mono text-sm"
                      placeholder="L5..."
                    />
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      Keys are processed securely in memory and never stored.
                    </p>
                  </div>

                  <button
                    onClick={handleMigrate}
                    disabled={!btcAddress || !privateKey}
                    className="w-full py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-colors shadow-lg shadow-orange-200 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                  >
                    Migrate Assets
                  </button>
                </div>
              )}

              {step === 'processing' && (
                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                  <Loader2 className="w-12 h-12 text-orange-600 animate-spin" />
                  <div className="text-center">
                    <h3 className="text-lg font-bold text-gray-900">Migrating Assets...</h3>
                    <p className="text-sm text-gray-500">Verifying blockchain data and swapping to Digital Dollars.</p>
                  </div>
                </div>
              )}

              {step === 'success' && (
                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-gray-900">Migration Complete!</h3>
                    <p className="text-sm text-gray-500 mb-6">Your assets have been swapped and staked.</p>
                    <button
                      onClick={reset}
                      className="px-6 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
