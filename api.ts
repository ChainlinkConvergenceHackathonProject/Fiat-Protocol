import { useState } from 'react';
import { distributeYield } from '../lib/api';
import { motion } from 'motion/react';
import { TrendingUp, PieChart, Loader2 } from 'lucide-react';

export function YieldCard({ stats, onUpdate }: { stats: any, onUpdate: () => void }) {
  const [loading, setLoading] = useState(false);

  const handleSimulateYield = async () => {
    setLoading(true);
    try {
      // Simulate generating 1000 units of yield
      await distributeYield(1000);
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
      transition={{ delay: 0.2 }}
      className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
    >
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-amber-600" />
        Protocol Yield
      </h2>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
          <div className="text-xs text-amber-700 font-medium mb-1 uppercase tracking-wider">Total Supply</div>
          <div className="text-2xl font-bold text-gray-900 font-mono">
            {stats.total_usdy_supply?.toLocaleString() ?? 0} <span className="text-sm text-gray-500">USDY</span>
          </div>
        </div>
        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
          <div className="text-xs text-blue-700 font-medium mb-1 uppercase tracking-wider">Fiat Reserves (50%)</div>
          <div className="text-2xl font-bold text-gray-900 font-mono">
            ${stats.fiat_reserves?.toLocaleString() ?? 0}
          </div>
        </div>
        <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
          <div className="text-xs text-purple-700 font-medium mb-1 uppercase tracking-wider">Founder Fees (20%)</div>
          <div className="text-2xl font-bold text-gray-900 font-mono">
            ${stats.founder_fees?.toLocaleString() ?? 0}
          </div>
        </div>
        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
          <div className="text-xs text-emerald-700 font-medium mb-1 uppercase tracking-wider">Holder Yield (30%)</div>
          <div className="text-sm text-emerald-800">
            Distributed as <strong>yUSDC</strong> to all Digital Token holders.
          </div>
        </div>
      </div>
      <p className="text-xs text-center text-gray-500 mt-3">
        Yield accrues from underlying assets and distributes according to protocol rules.
      </p>
    </motion.div>
  );
}
