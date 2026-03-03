import { motion, AnimatePresence } from 'motion/react';
import { X, Building, ShoppingBag, Home, Globe } from 'lucide-react';

interface ExampleIntegrationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ExampleIntegrationsModal({ isOpen, onClose }: ExampleIntegrationsModalProps) {
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
            className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="bg-slate-900 text-white p-6 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-700 rounded-xl flex items-center justify-center shadow-lg">
                  <Globe className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight">Example Integrations</h2>
                  <div className="text-xs text-slate-400">Real-world use cases for Digital Dollars</div>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
              
              {/* Banking */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                    <Building className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Banking & Fintech</h3>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                        Integrating Digital Dollars for instant settlement
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                        Issuing & managing real-estate backed equities
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                        Offering Certificates of Deposit (CDs), IRAs, and DeFi yields
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                        Interoperable digital asset swaps & bridging
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Realtors */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                    <Home className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Realtors & Real Estate</h3>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                        Tokenizing property value into Digital Dollars
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                        Creating PropertyNFT marketplaces & auctions
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                        Fractional ownership issuance & management
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                        Seamless cross-border property payments
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Consumer Apps */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Consumer Apps</h3>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                        Native Digital Dollar integration for payments
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                        Building DeFi-powered games & marketplaces
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                        Cross-terrain transactions & overseas remittance
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                        Interoperable asset swaps within apps
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
