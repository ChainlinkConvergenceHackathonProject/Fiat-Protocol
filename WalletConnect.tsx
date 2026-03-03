import { ArrowRightLeft, PlusCircle, TrendingUp, Clock, Shield } from 'lucide-react';

interface Transaction {
  id: number;
  type: 'MINT' | 'SWAP' | 'YIELD' | 'RECOVERY';
  from_currency?: string;
  to_currency?: string;
  amount_in?: number;
  amount_out?: number;
  timestamp: string;
}

export function TransactionHistory({ transactions }: { transactions: Transaction[] }) {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
        <h2 className="text-lg font-semibold mb-4 text-gray-900">Transaction History</h2>
        <div className="text-gray-400 text-sm italic py-4">No transactions found.</div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <h2 className="text-lg font-semibold mb-4 text-gray-900 flex items-center gap-2">
        <Clock className="w-5 h-5 text-gray-500" />
        Transaction History
      </h2>
      <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
        {transactions.map((tx) => (
          <div key={tx.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${
                tx.type === 'MINT' ? 'bg-emerald-100 text-emerald-600' :
                tx.type === 'SWAP' ? 'bg-blue-100 text-blue-600' :
                tx.type === 'RECOVERY' ? 'bg-red-100 text-red-600' :
                'bg-purple-100 text-purple-600'
              }`}>
                {tx.type === 'MINT' && <PlusCircle className="w-4 h-4" />}
                {tx.type === 'SWAP' && <ArrowRightLeft className="w-4 h-4" />}
                {tx.type === 'YIELD' && <TrendingUp className="w-4 h-4" />}
                {tx.type === 'RECOVERY' && <Shield className="w-4 h-4" />}
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-900">
                  {tx.type === 'MINT' ? 'Minted Assets' :
                   tx.type === 'SWAP' ? 'Swapped Tokens' :
                   tx.type === 'RECOVERY' ? 'Asset Recovery' :
                   'Yield Earned'}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(tx.timestamp).toLocaleString()}
                </div>
              </div>
            </div>
            <div className="text-right">
              {tx.type === 'SWAP' ? (
                <>
                  <div className="text-sm font-medium text-gray-900">
                    +{tx.amount_out?.toLocaleString()} {tx.to_currency}
                  </div>
                  <div className="text-xs text-gray-500">
                    -{tx.amount_in?.toLocaleString()} {tx.from_currency}
                  </div>
                </>
              ) : tx.type === 'RECOVERY' ? (
                <>
                  <div className="text-sm font-medium text-emerald-600">
                    +{tx.amount_out?.toLocaleString()} {tx.to_currency}
                  </div>
                  <div className="text-xs text-red-400 line-through">
                    {tx.amount_in?.toLocaleString()} {tx.from_currency}
                  </div>
                </>
              ) : (
                <div className="text-sm font-medium text-emerald-600">
                  +{tx.amount_out?.toLocaleString()} {tx.to_currency || tx.from_currency}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
