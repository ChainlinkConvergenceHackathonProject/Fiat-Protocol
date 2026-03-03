import { Globe, ArrowRightLeft, Landmark, Users, CreditCard, Building2 } from 'lucide-react';

export function UseCasesSection() {
  return (
    <div className="mt-16 max-w-5xl mx-auto text-left w-full px-4">
      <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Fiat Protocol Use Cases</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4 text-blue-600">
            <Globe className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-gray-900 mb-2 text-lg">Universal Borderless Assets</h4>
          <p className="text-sm text-gray-500 leading-relaxed">
            Bridge digital dollar, digital euro, and digital yen into universal borderless assets. 
            Seamlessly move value across borders without traditional banking friction.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-4 text-emerald-600">
            <CreditCard className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-gray-900 mb-2 text-lg">Global On/Off Ramps</h4>
          <p className="text-sm text-gray-500 leading-relaxed">
            Bringing awareness to $USDT, $PYUSD, $USDC, MoneyGram, Visa, and Mastercard integrations. 
            Making digital assets accessible and "acceptable" for everyday use.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900 mb-4 px-2 text-lg">Real-World Examples</h4>
        
        <div className="bg-white p-5 rounded-xl border border-gray-200 flex gap-5 items-start shadow-sm hover:border-indigo-200 transition-colors">
          <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100 shrink-0">
            <ArrowRightLeft className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h5 className="font-bold text-gray-900 text-base">Cross-Chain Swaps</h5>
            <p className="text-sm text-gray-500 mt-1 leading-relaxed">
              User swaps Asset A (EVM) → Asset B (EVM), or cross-chain: Asset A (EVM) → $USDC (EVM) → USDC (Solana) → Asset B (Solana).
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 flex gap-5 items-start shadow-sm hover:border-purple-200 transition-colors">
          <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 shrink-0">
            <Landmark className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h5 className="font-bold text-gray-900 text-base">Yield Bearing Savings</h5>
            <p className="text-sm text-gray-500 mt-1 leading-relaxed">
              User holds fiat to earn interest from digital dollars, digital euro, digital peso, and digital yen.
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 flex gap-5 items-start shadow-sm hover:border-orange-200 transition-colors">
          <div className="p-3 bg-orange-50 rounded-xl border border-orange-100 shrink-0">
            <Building2 className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h5 className="font-bold text-gray-900 text-base">Corporate Treasury & Payments</h5>
            <p className="text-sm text-gray-500 mt-1 leading-relaxed">
              Companies accepting digital dollars on payment processors or automating transaction workflows.
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 flex gap-5 items-start shadow-sm hover:border-pink-200 transition-colors">
          <div className="p-3 bg-pink-50 rounded-xl border border-pink-100 shrink-0">
            <Users className="w-6 h-6 text-pink-600" />
          </div>
          <div>
            <h5 className="font-bold text-gray-900 text-base">Workforce Management</h5>
            <p className="text-sm text-gray-500 mt-1 leading-relaxed">
              Enhancing workforce ledgers and automating personnel management and payroll via programmable payments.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
