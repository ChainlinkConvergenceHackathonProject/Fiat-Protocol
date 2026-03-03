import { useState } from 'react';
import { mintToken } from '../lib/api';
import { motion } from 'motion/react';
import { Banknote } from 'lucide-react';
import { ASSETS } from '../lib/constants';

const DENOMINATIONS = [1, 5, 10, 20, 50, 100, 1000000];

export function MintCard({ address, onUpdate }: { address: string, onUpdate: () => void }) {
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [loading, setLoading] = useState(false);

  const handleMint = async (amount: number) => {
    setLoading(true);
    try {
      await mintToken(address, selectedCurrency, amount);
      onUpdate();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
    >
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Banknote className="w-5 h-5 text-emerald-600" />
        Mint Assets (Testnet Faucet)
      </h2>
      
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 custom-scrollbar">
        {ASSETS.map((c) => (
          <button
            key={c.code}
            onClick={() => setSelectedCurrency(c.code)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
              selectedCurrency === c.code 
                ? 'bg-emerald-100 text-emerald-700 border-emerald-200 border' 
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <c.icon className="w-4 h-4" />
            {c.code}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {DENOMINATIONS.map((amount) => (
          <button
            key={amount}
            disabled={loading}
            onClick={() => handleMint(amount)}
            className="flex flex-col items-center justify-center p-3 rounded-xl border border-gray-200 hover:border-emerald-500 hover:bg-emerald-50 transition-all disabled:opacity-50"
          >
            <span className="text-xs text-gray-500 font-mono mb-1">{selectedCurrency}</span>
            <span className="text-lg font-bold text-gray-900">
              {amount >= 1000000 ? '1M' : `${amount}`}
            </span>
          </button>
        ))}
      </div>
    </motion.div>
  );
}
