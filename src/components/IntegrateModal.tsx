import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { generateIntegration } from '../lib/api';
import { Code2, Copy, Check, X, Terminal, ShieldCheck, Building, ArrowRight } from 'lucide-react';

export function IntegrateModal({ isOpen, onClose, address }: { isOpen: boolean, onClose: () => void, address: string | null }) {
  const [label, setLabel] = useState('');
  const [appFee, setAppFee] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!address) return;
    setLoading(true);
    try {
      const res = await generateIntegration(address, label || 'My App', appFee);
      setResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
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
            className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                  <Code2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Integrate Fiat Protocol</h3>
                  <p className="text-xs text-gray-500">Generate API keys for your dApp</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar">
              {!result ? (
                <div className="space-y-6">
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-sm text-blue-800">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4" />
                      Protocol Rules Enforced
                    </h4>
                    <ul className="list-disc list-inside space-y-1 opacity-80">
                      <li><strong>20%</strong> allocated to Fiat Reserves</li>
                      <li><strong>5%</strong> allocated to Founder Fee</li>
                      <li><strong>≥ 50%</strong> allocated to Token Holders (Default: 75%)</li>
                    </ul>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Application Label</label>
                    <input
                      type="text"
                      value={label}
                      onChange={(e) => setLabel(e.target.value)}
                      placeholder="e.g. My DeFi App"
                      className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ecosystem App Fee (%) <span className="text-gray-400 font-normal">(Optional, 0-25%)</span></label>
                    <input
                      type="number"
                      value={appFee}
                      onChange={(e) => setAppFee(e.target.value)}
                      placeholder="0"
                      max="25"
                      className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Fee collected by your app from the yield.
                    </p>
                  </div>

                  <button
                    onClick={handleGenerate}
                    disabled={loading || !address}
                    className="w-full py-3 px-4 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors shadow-lg shadow-indigo-200"
                  >
                    {loading ? 'Generating...' : 'Generate API Key & Mapped Address'}
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Check className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Integration Ready</h3>
                    <p className="text-sm text-gray-500">Use these credentials to interact with the protocol programmatically.</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">API Key</label>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 p-3 bg-gray-900 text-green-400 rounded-lg font-mono text-sm break-all">
                          {result.apiKey}
                        </code>
                        <button 
                          onClick={() => copyToClipboard(result.apiKey)}
                          className="p-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 transition-colors"
                        >
                          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Mapped Stellar Address</label>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 p-3 bg-gray-50 text-gray-800 rounded-lg font-mono text-sm break-all border border-gray-200">
                          {result.mappedAddress}
                        </code>
                        <button 
                          onClick={() => copyToClipboard(result.mappedAddress)}
                          className="p-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 transition-colors"
                        >
                          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        Funds sent here are routed via 20/5/75 split.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Digital Fiat Contract (Import)</label>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 p-3 bg-indigo-50 text-indigo-800 rounded-lg font-mono text-sm break-all border border-indigo-100">
                          {result.digitalFiatContract}
                        </code>
                        <button 
                          onClick={() => copyToClipboard(result.digitalFiatContract)}
                          className="p-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 transition-colors"
                        >
                          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        Use this address to call/import Digital Fiat Tokens in your dApp.
                      </p>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <h4 className="font-bold text-slate-700 mb-2 flex items-center gap-2">
                        <Building className="w-4 h-4" /> Real Estate & Banking Integration
                      </h4>
                      <div className="space-y-2 text-xs text-slate-600">
                        <div className="flex items-center gap-2">
                          <span className="font-mono bg-white px-1 border rounded">Bank</span>
                          <ArrowRight className="w-3 h-3" />
                          <span className="font-mono bg-indigo-100 text-indigo-700 px-1 border border-indigo-200 rounded">Soroban Contract</span>
                          <ArrowRight className="w-3 h-3" />
                          <span className="font-mono bg-white px-1 border rounded">Bank</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono bg-white px-1 border rounded">Wallet</span>
                          <ArrowRight className="w-3 h-3" />
                          <span className="font-mono bg-indigo-100 text-indigo-700 px-1 border border-indigo-200 rounded">Soroban Contract</span>
                          <ArrowRight className="w-3 h-3" />
                          <span className="font-mono bg-white px-1 border rounded">Wallet</span>
                        </div>
                        <p className="mt-2 text-slate-500 italic">
                          Supports migration, issuance, and benefit distribution for property owners.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-900 rounded-xl p-4 text-xs text-gray-400 font-mono overflow-x-auto">
                    <div className="flex items-center gap-2 text-gray-500 mb-2 border-b border-gray-800 pb-2">
                      <Terminal className="w-3 h-3" />
                      <span>Integration Config</span>
                    </div>
                    <pre>
{JSON.stringify(result.config, null, 2)}
                    </pre>
                  </div>
                  
                  <button
                    onClick={() => setResult(null)}
                    className="w-full py-3 text-gray-600 font-medium hover:text-gray-900"
                  >
                    Generate Another
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
