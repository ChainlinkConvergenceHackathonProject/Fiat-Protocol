import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Terminal, Link2, Shield, Eye, Database, Activity, Globe, Server, ArrowRightLeft, ArrowRight, CheckCircle2, Loader2, Landmark, Bitcoin, AlertTriangle, Sprout, Lock, HandCoins, PiggyBank, Layers, Zap, Calendar, Play } from 'lucide-react';
import { ASSETS } from '../lib/constants';
import { fetchRates, simulateRecovery, runChainlinkAutomation, performSecurityAudit, migrateBtc } from '../lib/api';

const CCIP_CHAINS = [
  { id: 'ethereum', name: 'Ethereum Sepolia', icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=026', type: 'EVM' },
  { id: 'avalanche', name: 'Avalanche Fuji', icon: 'https://cryptologos.cc/logos/avalanche-avax-logo.svg?v=026', type: 'EVM' },
  { id: 'polygon', name: 'Polygon Amoy', icon: 'https://cryptologos.cc/logos/polygon-matic-logo.svg?v=026', type: 'EVM' },
  { id: 'base', name: 'Base Sepolia', icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=026', type: 'EVM' }, // Using ETH logo for Base for now
  { id: 'optimism', name: 'Optimism Sepolia', icon: 'https://cryptologos.cc/logos/optimism-ethereum-op-logo.svg?v=026', type: 'EVM' },
  { id: 'arbitrum', name: 'Arbitrum Sepolia', icon: 'https://cryptologos.cc/logos/arbitrum-arb-logo.svg?v=026', type: 'EVM' },
  { id: 'bsc', name: 'BNB Chain Testnet', icon: 'https://cryptologos.cc/logos/bnb-bnb-logo.svg?v=026', type: 'EVM' },
];

const CCIP_ASSETS = [
  { code: 'CCIP-BnM', name: 'Burn & Mint Token' },
  { code: 'CCIP-LnM', name: 'Lock & Mint Token' },
  { code: 'USDC', name: 'USD Coin' },
  { code: 'LINK', name: 'Chainlink' },
  { code: 'ETH', name: 'Ethereum' },
  { code: 'WBTC', name: 'Wrapped Bitcoin' },
  { code: 'AAVE', name: 'Aave' },
  { code: 'UNI', name: 'Uniswap' },
];

const DeveloperTab = () => {
  const [githubToken, setGithubToken] = useState<string | null>(null);
  const [repoName, setRepoName] = useState('');
  const [repoDesc, setRepoDesc] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createdRepo, setCreatedRepo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'GITHUB_AUTH_SUCCESS' && event.data?.token) {
        setGithubToken(event.data.token);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const connectGitHub = async () => {
    try {
      const res = await fetch('/api/auth/github/url');
      const { url } = await res.json();
      window.open(url, 'github_oauth', 'width=600,height=700');
    } catch (e) {
      console.error(e);
      setError("Failed to start GitHub authentication");
    }
  };

  const createRepo = async () => {
    if (!githubToken) return;
    setCreating(true);
    setError(null);
    setCreatedRepo(null);

    try {
      const res = await fetch('/api/github/create-repo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: githubToken,
          name: repoName,
          description: repoDesc,
          isPrivate
        })
      });
      
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      setCreatedRepo(data.repo);
      setRepoName('');
      setRepoDesc('');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white" aria-hidden="true"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">GitHub Integration</h3>
              <p className="text-sm text-gray-500">Connect your account to create repositories directly from the app.</p>
            </div>
          </div>
          {!githubToken ? (
            <button 
              onClick={connectGitHub}
              className="px-4 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center gap-2"
            >
              Connect GitHub
            </button>
          ) : (
            <div className="flex items-center gap-2 text-emerald-600 font-medium bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
              <CheckCircle2 className="w-4 h-4" />
              Connected
            </div>
          )}
        </div>

        {githubToken && (
          <div className="space-y-4 border-t border-gray-100 pt-6">
            <h4 className="font-semibold text-gray-900">Create New Repository</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Repository Name</label>
                <input 
                  type="text" 
                  value={repoName}
                  onChange={(e) => setRepoName(e.target.value)}
                  placeholder="my-awesome-project"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Visibility</label>
                <select 
                  value={isPrivate ? 'private' : 'public'}
                  onChange={(e) => setIsPrivate(e.target.value === 'private')}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea 
                value={repoDesc}
                onChange={(e) => setRepoDesc(e.target.value)}
                placeholder="A brief description of your project..."
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none h-24 resize-none"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                {error}
              </div>
            )}

            {createdRepo && (
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                <div className="flex items-center gap-2 text-emerald-800 font-semibold mb-2">
                  <CheckCircle2 className="w-5 h-5" />
                  Repository Created Successfully!
                </div>
                <a 
                  href={createdRepo.html_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline flex items-center gap-1 text-sm font-medium"
                >
                  {createdRepo.full_name} <Link2 className="w-3 h-3" />
                </a>
              </div>
            )}

            <div className="flex justify-end">
              <button 
                onClick={createRepo}
                disabled={!repoName || creating}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Terminal className="w-4 h-4" />}
                Create Repository
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export function ChainlinkRuntimeModal({ isOpen, onClose, address }: { isOpen: boolean, onClose: () => void, address?: string | null }) {
  const [activeTab, setActiveTab] = useState<'overview' | 'swap' | 'functions' | 'encryption' | 'feeds' | 'security' | 'automation'>('overview');
  const [rates, setRates] = useState<any>(null);
  const [recovering, setRecovering] = useState(false);
  const [recoveryResult, setRecoveryResult] = useState<any>(null);
  const [auditResults, setAuditResults] = useState<any>(null);
  const [auditing, setAuditing] = useState(false);
  
  // Automation State
  const [automationResult, setAutomationResult] = useState<any>(null);
  const [runningAutomation, setRunningAutomation] = useState(false);

  // BTC Migration State
  const [migratingBtc, setMigratingBtc] = useState(false);
  const [btcMigrationResult, setBtcMigrationResult] = useState<any>(null);
  const [btcAmount, setBtcAmount] = useState('0.1');

  // Swap State
  const [sourceChain, setSourceChain] = useState('ethereum');
  const [targetChain, setTargetChain] = useState('stellar');
  const [fromAsset, setFromAsset] = useState('CCIP-BnM');
  const [amount, setAmount] = useState('');
  const [swapStatus, setSwapStatus] = useState<'idle' | 'oracle' | 'bridging' | 'complete'>('idle');
  const [selectedDefiAction, setSelectedDefiAction] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchRates().then(setRates);
    }
  }, [isOpen]);

  const handleAudit = async () => {
    setAuditing(true);
    setAuditResults(null);
    try {
      const res = await performSecurityAudit();
      setAuditResults(res.results);
    } catch (e) {
      console.error(e);
    } finally {
      setAuditing(false);
    }
  };

  const handleSimulateRecovery = async () => {
    if (!address) return;
    setRecovering(true);
    setRecoveryResult(null);
    try {
      const res = await simulateRecovery(address);
      setRecoveryResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setRecovering(false);
    }
  };

  const handleSwap = () => {
    setSwapStatus('oracle');
    setTimeout(() => setSwapStatus('bridging'), 1500);
    setTimeout(() => setSwapStatus('complete'), 3500);
    setTimeout(() => {
      setSwapStatus('idle');
      setAmount('');
      setSelectedDefiAction(null);
    }, 5500);
  };

  const handleRunAutomation = async () => {
    setRunningAutomation(true);
    setAutomationResult(null);
    try {
      const res = await runChainlinkAutomation();
      setAutomationResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setRunningAutomation(false);
    }
  };

  const handleMigrateBtc = async () => {
    if (!address) return;
    setMigratingBtc(true);
    setBtcMigrationResult(null);
    try {
      const res = await migrateBtc(address, Number(btcAmount));
      setBtcMigrationResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setMigratingBtc(false);
    }
  };

  const getAssetDetails = (code: string) => ASSETS.find(a => a.code === code);
  const rate = rates?.[fromAsset] || 1; // Default to 1 for mock assets

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
            className="relative bg-white w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="bg-gray-900 text-white p-6 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/50">
                  <Link2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight">Chainlink Runtime Environment</h2>
                  <div className="flex items-center gap-2 text-xs text-blue-200 font-mono">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    CCIP ENABLED
                    <span className="text-gray-600">|</span>
                    <span className="text-gray-400">v2.1.0</span>
                  </div>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Navigation */}
            <div className="bg-gray-50 border-b border-gray-200 px-6 flex gap-6 overflow-x-auto shrink-0">
              {[
                { id: 'overview', label: 'Overview', icon: Globe },
                { id: 'feeds', label: 'Data Feeds & Oracles', icon: Activity },
                { id: 'swap', label: 'CCIP Swap & DeFi', icon: ArrowRightLeft },
                { id: 'automation', label: 'Automation', icon: Calendar },
                { id: 'functions', label: 'Functions', icon: Terminal },
                { id: 'encryption', label: 'Address Encryption', icon: Shield },
                { id: 'security', label: 'Security & Recovery', icon: AlertTriangle },
                { id: 'developer', label: 'Developer', icon: Terminal },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id 
                      ? 'border-blue-600 text-blue-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50 custom-scrollbar">
              {activeTab === 'developer' && (
                <DeveloperTab />
              )}
              {activeTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Bridge Status */}
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 text-gray-900 font-bold">
                        <ArrowRightLeft className="w-5 h-5 text-blue-600" />
                        <h3>Bridge Status</h3>
                      </div>
                      <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                        Active
                      </span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">EVM Network</span>
                        <span className="font-mono text-gray-900">Connected</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Stellar Network</span>
                        <span className="font-mono text-gray-900">Connected</span>
                      </div>
                      <div className="h-px bg-gray-100 my-2"></div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Pending Tx</span>
                        <span className="font-mono text-gray-900">0</span>
                      </div>
                    </div>
                  </div>

                  {/* Equilibrium Status */}
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 text-gray-900 font-bold">
                        <Activity className="w-5 h-5 text-purple-600" />
                        <h3>Equilibrium</h3>
                      </div>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                        Balanced
                      </span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Collateral Ratio</span>
                        <span className="font-mono text-gray-900">100%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Yield Distribution</span>
                        <span className="font-mono text-gray-900">Optimal</span>
                      </div>
                      <div className="h-px bg-gray-100 my-2"></div>
                      <div className="text-xs text-gray-400 italic">
                        "Price * CirculatingSupply = MarketCap"
                      </div>
                    </div>
                  </div>

                  {/* Oracle Health */}
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 text-gray-900 font-bold">
                        <Database className="w-5 h-5 text-indigo-600" />
                        <h3>Oracle Health</h3>
                      </div>
                      <span className="text-xs text-gray-500 font-mono">Last heartbeat: 2s ago</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {['Chainlink', 'Band', 'CoinGecko', 'Aquarius'].map(o => (
                        <div key={o} className="bg-gray-50 p-2 rounded border border-gray-100 flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                          <span className="text-xs font-medium text-gray-700">{o}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Identity Mapping */}
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 text-gray-900 font-bold">
                        <Shield className="w-5 h-5 text-emerald-600" />
                        <h3>Identity Map</h3>
                      </div>
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full">
                        Secure
                      </span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Mapped Addresses</span>
                        <span className="font-mono text-gray-900">1,240</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Encryption</span>
                        <span className="font-mono text-gray-900">AES-256</span>
                      </div>
                      <div className="h-px bg-gray-100 my-2"></div>
                      <div className="text-xs text-blue-600 hover:underline cursor-pointer" onClick={() => setActiveTab('encryption')}>
                        View Encryption Details &rarr;
                      </div>
                    </div>
                  </div>

                  {/* Bitcoin Migration */}
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm md:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 text-gray-900 font-bold">
                        <Bitcoin className="w-5 h-5 text-orange-600" />
                        <h3>Bitcoin Migration (L1 &rarr; Soroban)</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <input 
                          type="number" 
                          value={btcAmount}
                          onChange={(e) => setBtcAmount(e.target.value)}
                          className="w-24 p-1.5 border border-gray-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-orange-500 outline-none"
                          placeholder="Amount"
                        />
                        <button 
                          onClick={handleMigrateBtc}
                          disabled={migratingBtc || !address}
                          className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-bold hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-orange-200"
                        >
                          {migratingBtc ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRightLeft className="w-4 h-4" />}
                          Migrate BTC
                        </button>
                      </div>
                    </div>
                    
                    {btcMigrationResult ? (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="bg-orange-50 border border-orange-100 p-4 rounded-xl"
                      >
                        <div className="flex items-center gap-2 text-orange-800 font-bold mb-2">
                          <CheckCircle2 className="w-4 h-4 text-orange-600" />
                          Migration Successful
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div className="space-y-1">
                            <div className="text-gray-500 uppercase font-bold text-[10px]">Source (Bitcoin L1)</div>
                            <div className="font-mono text-gray-700">-{btcMigrationResult.amount} BTC</div>
                            <div className="text-gray-400 truncate">bc1q...{address?.slice(-4)}</div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-gray-500 uppercase font-bold text-[10px]">Target (Soroban)</div>
                            <div className="font-mono text-emerald-600">+{btcMigrationResult.received} yBTC</div>
                            <div className="text-gray-400 truncate">G...{address?.slice(-4)}</div>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-orange-200 flex justify-between items-center text-[10px] text-orange-600 font-mono">
                          <span>DLC Proof: {btcMigrationResult.dlcProof}</span>
                          <span>CCIP Hash: 0x{Math.random().toString(16).slice(2, 10)}...</span>
                        </div>
                      </motion.div>
                    ) : (
                      <p className="text-xs text-gray-500 leading-relaxed">
                        Securely migrate your Bitcoin L1 assets to the Soroban Runtime Environment. 
                        This process uses <strong>Chainlink DLCs (Discreet Log Contracts)</strong> to anchor BTC value 
                        directly to your Stellar wallet as <strong>yBTC</strong>, enabling yield farming and DeFi participation.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'swap' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Swap Interface */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                      <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <ArrowRightLeft className="w-5 h-5 text-blue-600" />
                        Cross-Chain Swap & DeFi
                      </h4>
                      
                      <div className="space-y-4">
                        {/* Source Chain */}
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                          <div className="flex justify-between items-center mb-2">
                            <label className="text-xs font-semibold text-gray-500 uppercase">From (Source Chain)</label>
                            <span className="text-xs text-gray-400 font-mono">CCIP Router: 0x5a...9e2</span>
                          </div>
                          <div className="flex gap-4 mb-3">
                             <select 
                              value={sourceChain}
                              onChange={(e) => setSourceChain(e.target.value)}
                              className="bg-white p-2 rounded-lg border border-gray-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 w-1/2"
                            >
                              {CCIP_CHAINS.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                              ))}
                            </select>
                            <div className="flex-1 flex items-center justify-end gap-2 text-xs text-gray-500">
                              <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                              Connected
                            </div>
                          </div>

                          <div className="flex gap-4">
                            <select 
                              value={fromAsset}
                              onChange={(e) => setFromAsset(e.target.value)}
                              className="bg-white p-2 rounded-lg border border-gray-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 w-32"
                            >
                              {CCIP_ASSETS.map(a => (
                                <option key={a.code} value={a.code}>{a.code}</option>
                              ))}
                            </select>
                            <input 
                              type="number" 
                              placeholder="0.00"
                              value={amount}
                              onChange={(e) => setAmount(e.target.value)}
                              className="flex-1 bg-transparent text-right font-mono text-lg focus:outline-none"
                            />
                          </div>
                          <div className="text-right text-xs text-gray-500 mt-1">
                            Balance: 12.5 {fromAsset}
                          </div>
                        </div>

                        <div className="flex justify-center -my-2 relative z-10">
                          <div className="bg-white p-2 rounded-full border border-gray-200 shadow-sm">
                            <ArrowRight className="w-4 h-4 text-gray-400 rotate-90" />
                          </div>
                        </div>

                        {/* Target Chain */}
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                           <div className="flex justify-between items-center mb-2">
                            <label className="text-xs font-semibold text-gray-500 uppercase">To (Destination Chain)</label>
                            <span className="text-xs text-gray-400 font-mono">Soroban Contract: C...9X2</span>
                          </div>
                          <div className="flex gap-4 mb-3">
                             <div className="bg-white p-2 rounded-lg border border-gray-300 text-sm font-medium w-1/2 flex items-center gap-2">
                                <img src="https://cryptologos.cc/logos/stellar-xlm-logo.svg?v=026" className="w-4 h-4" alt="Stellar" />
                                Stellar Soroban Testnet
                             </div>
                          </div>

                          <div className="flex gap-4">
                            <div className="bg-white p-2 rounded-lg border border-gray-300 text-sm font-medium w-32 flex items-center justify-between">
                              {fromAsset}
                              <span className="text-xs text-gray-400">(Wrapped)</span>
                            </div>
                            <div className="flex-1 text-right font-mono text-lg text-gray-700">
                              {amount ? amount : '0.00'}
                            </div>
                          </div>
                        </div>

                        {/* DeFi Actions */}
                        <div className="grid grid-cols-4 gap-2">
                          {[
                            { id: 'farm', label: 'Farm', icon: Sprout, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
                            { id: 'stake', label: 'Stake', icon: Lock, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
                            { id: 'lend', label: 'Lend', icon: HandCoins, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
                            { id: 'borrow', label: 'Borrow', icon: PiggyBank, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
                          ].map(action => (
                            <button
                              key={action.id}
                              onClick={() => setSelectedDefiAction(selectedDefiAction === action.id ? null : action.id)}
                              className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                                selectedDefiAction === action.id 
                                  ? `${action.bg} ${action.border} ring-2 ring-offset-1 ring-${action.color.split('-')[1]}`
                                  : 'bg-white border-gray-200 hover:bg-gray-50'
                              }`}
                            >
                              <action.icon className={`w-5 h-5 mb-1 ${action.color}`} />
                              <span className="text-xs font-medium text-gray-700">{action.label}</span>
                            </button>
                          ))}
                        </div>

                        {selectedDefiAction && (
                          <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-700 flex items-center gap-2">
                            <Zap className="w-4 h-4" />
                            <span>
                              Programmable Token Transfer: Assets will be automatically 
                              <strong> {selectedDefiAction}ed</strong> upon arrival on Stellar.
                            </span>
                          </div>
                        )}

                        <button
                          onClick={handleSwap}
                          disabled={!amount || swapStatus !== 'idle'}
                          className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                        >
                          {swapStatus === 'idle' && 'Execute CCIP Swap'}
                          {swapStatus === 'oracle' && <><Loader2 className="w-4 h-4 animate-spin" /> Verifying Oracle Data...</>}
                          {swapStatus === 'bridging' && <><Loader2 className="w-4 h-4 animate-spin" /> Bridging Assets...</>}
                          {swapStatus === 'complete' && <><CheckCircle2 className="w-4 h-4" /> Swap Complete</>}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Runtime Data Panel */}
                  <div className="space-y-4">
                    <div className="bg-slate-900 p-5 rounded-xl text-white shadow-lg">
                      <div className="flex items-center gap-2 mb-4 text-blue-400">
                        <Database className="w-4 h-4" />
                        <h4 className="font-bold text-sm uppercase tracking-wider">Oracle Aggregation</h4>
                      </div>
                      <div className="space-y-3 text-xs font-mono">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Feed</span>
                          <span>{fromAsset} / USD</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Latest Price</span>
                          <span className="text-emerald-400">${rate.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Oracle ID</span>
                          <span className="text-gray-500">0x5f...3b2</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Last Update</span>
                          <span>12s ago</span>
                        </div>
                        <div className="h-px bg-gray-800 my-2"></div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Sources</span>
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-blue-500 rounded-full" title="Chainlink"></div>
                            <div className="w-2 h-2 bg-purple-500 rounded-full" title="Band"></div>
                            <div className="w-2 h-2 bg-yellow-500 rounded-full" title="Binance"></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                      <div className="flex items-center gap-2 mb-4 text-gray-900">
                        <Terminal className="w-4 h-4" />
                        <h4 className="font-bold text-sm uppercase tracking-wider">Contract Routing</h4>
                      </div>
                      <div className="space-y-3 text-xs">
                        <div className="p-2 bg-gray-50 rounded border border-gray-100">
                          <div className="font-semibold text-gray-700 mb-1">Source ({CCIP_CHAINS.find(c => c.id === sourceChain)?.name})</div>
                          <div className="font-mono text-gray-500 break-all">0x71C...9A2</div>
                        </div>
                        <div className="flex justify-center">
                          <ArrowRight className="w-3 h-3 text-gray-400 rotate-90" />
                        </div>
                        <div className="p-2 bg-gray-50 rounded border border-gray-100">
                          <div className="font-semibold text-gray-700 mb-1">Bridge (CCIP)</div>
                          <div className="font-mono text-gray-500 break-all">0xCCIP...Bridge</div>
                        </div>
                        <div className="flex justify-center">
                          <ArrowRight className="w-3 h-3 text-gray-400 rotate-90" />
                        </div>
                        <div className="p-2 bg-gray-50 rounded border border-gray-100">
                          <div className="font-semibold text-gray-700 mb-1">Target (Soroban)</div>
                          <div className="font-mono text-gray-500 break-all">GB7...2X9</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'feeds' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Forex & Fiat */}
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                      <div className="flex items-center gap-2 mb-3 text-emerald-700">
                        <Globe className="w-4 h-4" />
                        <h4 className="font-bold text-sm uppercase tracking-wider">Forex & Fiat</h4>
                      </div>
                      <div className="space-y-2">
                        {['EUR/USD', 'JPY/USD', 'GBP/USD', 'MXN/USD', 'CNY/USD'].map(pair => (
                          <div key={pair} className="flex justify-between items-center text-xs font-mono p-2 bg-gray-50 rounded border border-gray-100">
                            <span className="font-semibold text-gray-700">{pair}</span>
                            <span className="text-emerald-600 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                              Active
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Crypto Aggregators */}
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                      <div className="flex items-center gap-2 mb-3 text-blue-700">
                        <Activity className="w-4 h-4" />
                        <h4 className="font-bold text-sm uppercase tracking-wider">Market Aggregators</h4>
                      </div>
                      <div className="space-y-2">
                        {[
                          { name: 'CoinMarketCap', status: 'Synced' },
                          { name: 'CoinGecko', status: 'Synced' },
                          { name: 'Aquarius Protocol', status: 'Live' },
                          { name: 'Cronos Explorer', status: 'Live' }
                        ].map(source => (
                          <div key={source.name} className="flex justify-between items-center text-xs font-mono p-2 bg-gray-50 rounded border border-gray-100">
                            <span className="font-semibold text-gray-700">{source.name}</span>
                            <span className="text-blue-600 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                              {source.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Cronos Feeds */}
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                      <div className="flex items-center gap-2 mb-3 text-indigo-700">
                        <Globe className="w-4 h-4" />
                        <h4 className="font-bold text-sm uppercase tracking-wider">Cronos Feeds</h4>
                      </div>
                      <div className="space-y-2">
                        {['CRO/USD', 'USDC/CRO', 'VVS/USD', 'TONIC/USD'].map(pair => (
                          <div key={pair} className="flex justify-between items-center text-xs font-mono p-2 bg-gray-50 rounded border border-gray-100">
                            <span className="font-semibold text-gray-700">{pair}</span>
                            <span className="text-indigo-600 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                              Active
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Solana Feeds */}
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                      <div className="flex items-center gap-2 mb-3 text-purple-700">
                        <Activity className="w-4 h-4" />
                        <h4 className="font-bold text-sm uppercase tracking-wider">Solana Feeds (Pyth)</h4>
                      </div>
                      <div className="space-y-2">
                        {['SOL/USD', 'USDC/SOL', 'JUP/USD', 'PYTH/USD'].map(pair => (
                          <div key={pair} className="flex justify-between items-center text-xs font-mono p-2 bg-gray-50 rounded border border-gray-100">
                            <span className="font-semibold text-gray-700">{pair}</span>
                            <span className="text-purple-600 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></span>
                              Active
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bank Feeds */}
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                      <div className="flex items-center gap-2 mb-3 text-slate-700">
                        <Landmark className="w-4 h-4" />
                        <h4 className="font-bold text-sm uppercase tracking-wider">TradFi Integrations</h4>
                      </div>
                      <div className="space-y-2">
                        {['USD/Bank', 'Zelle/USD', 'PayPal/USD', 'CashApp/USD'].map(pair => (
                          <div key={pair} className="flex justify-between items-center text-xs font-mono p-2 bg-gray-50 rounded border border-gray-100">
                            <span className="font-semibold text-gray-700">{pair}</span>
                            <span className="text-slate-600 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-pulse"></span>
                              Verified
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bitcoin Feeds */}
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                      <div className="flex items-center gap-2 mb-3 text-orange-700">
                        <Bitcoin className="w-4 h-4" />
                        <h4 className="font-bold text-sm uppercase tracking-wider">Bitcoin Feeds</h4>
                      </div>
                      <div className="space-y-2">
                        {['BTC/USD', 'SATS/USD', 'LBTC/USD', 'BTC/XLM'].map(pair => (
                          <div key={pair} className="flex justify-between items-center text-xs font-mono p-2 bg-gray-50 rounded border border-gray-100">
                            <span className="font-semibold text-gray-700">{pair}</span>
                            <span className="text-orange-600 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>
                              Active
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Oracle Networks */}
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                      <div className="flex items-center gap-2 mb-3 text-indigo-700">
                        <Link2 className="w-4 h-4" />
                        <h4 className="font-bold text-sm uppercase tracking-wider">Decentralized Oracles</h4>
                      </div>
                      <div className="space-y-2">
                        {[
                          { name: 'Chainlink', type: 'DON (Decentralized Oracle Network)' },
                          { name: 'Band Protocol', type: 'Cross-Chain Data Oracle' }
                        ].map(oracle => (
                          <div key={oracle.name} className="p-2 bg-gray-50 rounded border border-gray-100">
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-semibold text-xs text-gray-900">{oracle.name}</span>
                              <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">Verified</span>
                            </div>
                            <div className="text-[10px] text-gray-500">{oracle.type}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Infrastructure */}
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                      <div className="flex items-center gap-2 mb-3 text-slate-700">
                        <Server className="w-4 h-4" />
                        <h4 className="font-bold text-sm uppercase tracking-wider">Infrastructure</h4>
                      </div>
                      <div className="space-y-2">
                        <div className="p-2 bg-gray-50 rounded border border-gray-100">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-semibold text-xs text-gray-900">Node & State</span>
                          </div>
                          <div className="text-[10px] text-gray-500">
                            Real-time state synchronization across EVM and Stellar nodes.
                          </div>
                        </div>
                        <div className="flex gap-2 mt-2">
                          <div className="flex-1 bg-slate-100 p-2 rounded text-center">
                            <div className="text-[10px] text-slate-500 uppercase">Uptime</div>
                            <div className="text-xs font-bold text-slate-800">99.99%</div>
                          </div>
                          <div className="flex-1 bg-slate-100 p-2 rounded text-center">
                            <div className="text-[10px] text-slate-500 uppercase">Latency</div>
                            <div className="text-xs font-bold text-slate-800">~200ms</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'encryption' && (
                <div className="space-y-6">
                  <div className="bg-slate-900 rounded-xl p-6 text-white">
                    <div className="flex items-center justify-between mb-8">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-2 border border-blue-500/50">
                          <img src="https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=026" className="w-6 h-6 invert" alt="ETH" />
                        </div>
                        <div className="text-xs font-mono text-blue-300">EVM Address</div>
                        <div className="text-xs text-gray-400">0x71C...9A2</div>
                      </div>

                      <div className="flex-1 px-4 flex flex-col items-center">
                        <div className="h-0.5 w-full bg-gradient-to-r from-blue-500 to-emerald-500 relative">
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900 px-2">
                            <Shield className="w-4 h-4 text-gray-400" />
                          </div>
                        </div>
                        <div className="text-[10px] text-gray-500 mt-2 uppercase tracking-wider">Encrypted Mapping</div>
                      </div>

                      <div className="text-center">
                        <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-2 border border-orange-500/50">
                          <Bitcoin className="w-6 h-6 text-orange-500" />
                        </div>
                        <div className="text-xs font-mono text-orange-300">Bitcoin Address</div>
                        <div className="text-xs text-gray-400">bc1q...9x2</div>
                      </div>
                    </div>

                    <div className="space-y-3 font-mono text-xs">
                      <div className="flex gap-2">
                        <span className="text-purple-400">function</span>
                        <span className="text-yellow-200">mapEVMToSoroban</span>(string memory sorobanAddr)
                      </div>
                      <div className="pl-4 text-gray-400">
                        // Maps msg.sender (EVM) to a target Soroban identity.<br/>
                        // Allows tracking of cross-chain portfolio value.
                      </div>
                      <div className="flex gap-2 mt-4">
                        <span className="text-purple-400">function</span>
                        <span className="text-yellow-200">mapSolanaToSoroban</span>(string memory sorobanAddr)
                      </div>
                      <div className="pl-4 text-gray-400">
                        // Maps Solana (PDA) address to Soroban.<br/>
                        // Anchors $USDC (Solana) to Soroban contract via Wormhole/CCIP.
                      </div>
                      <div className="flex gap-2 mt-4">
                        <span className="text-purple-400">function</span>
                        <span className="text-yellow-200">mapBankToSoroban</span>(string memory bankId)
                      </div>
                      <div className="pl-4 text-gray-400">
                        // Anchors Bank Account to Soroban Contract via regulated on-ramp.<br/>
                        // Enables view/store/manage of onchain assets from bank interface.
                      </div>
                      <div className="flex gap-2 mt-4">
                        <span className="text-purple-400">function</span>
                        <span className="text-yellow-200">mapBitcoinToSoroban</span>(string memory btcAddr)
                      </div>
                      <div className="pl-4 text-gray-400">
                        // Maps Bitcoin (L1/Lightning) to Soroban.<br/>
                        // Anchors $BTC (Stellar) to Soroban contract via DLCs/CCIP.
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 border border-gray-200 rounded-xl hover:border-blue-300 transition-colors bg-white">
                      <div className="flex items-center gap-2 mb-2 text-blue-700">
                        <Eye className="w-4 h-4" />
                        <h4 className="font-semibold text-sm">Soroban Views</h4>
                      </div>
                      <p className="text-xs text-gray-500">
                        EVM contracts can "view" Stellar asset balances via the Chainlink Oracle, enabling collateralization checks on Ethereum.
                      </p>
                    </div>
                    <div className="p-4 border border-gray-200 rounded-xl hover:border-emerald-300 transition-colors bg-white">
                      <div className="flex items-center gap-2 mb-2 text-emerald-700">
                        <Database className="w-4 h-4" />
                        <h4 className="font-semibold text-sm">State Trackers</h4>
                      </div>
                      <p className="text-xs text-gray-500">
                        Synchronizes "Total Value Locked" (TVL) across both chains to ensure the 1:1 peg and yield distribution accuracy.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'automation' && (
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-indigo-600" />
                          Reserve Schedule Automation
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Automated asset rebalancing and yield distribution based on day of the week.
                        </p>
                      </div>
                      <button 
                        onClick={handleRunAutomation}
                        disabled={runningAutomation}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        {runningAutomation ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                        Run Daily Schedule
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-7 gap-2 mb-8">
                      {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, i) => {
                        const schedule = ['yXLM', 'USDY', 'yUSDC', 'USTRY', 'USDY', 'yUSDC', 'USTRY'];
                        const isToday = new Date().getDay() === i;
                        return (
                          <div key={day} className={`p-3 rounded-xl border flex flex-col items-center text-center ${isToday ? 'bg-indigo-50 border-indigo-200 ring-2 ring-indigo-100' : 'bg-gray-50 border-gray-100'}`}>
                            <div className="text-xs font-bold text-gray-500 uppercase mb-1">{day}</div>
                            <div className={`font-mono font-bold ${isToday ? 'text-indigo-600' : 'text-gray-700'}`}>
                              {schedule[i]}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {automationResult && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-slate-900 text-white p-6 rounded-xl font-mono text-sm"
                      >
                        <div className="flex items-center gap-2 text-emerald-400 mb-4">
                          <CheckCircle2 className="w-5 h-5" />
                          <span className="font-bold">Automation Executed Successfully</span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div>
                            <h4 className="text-gray-400 text-xs uppercase tracking-wider mb-3">Fiat Reserves Allocation</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span>Total Yield:</span>
                                <span className="text-emerald-400">+${automationResult.yields.fiatReserves.total.toFixed(6)}</span>
                              </div>
                              <div className="pl-4 border-l border-gray-700 space-y-1 text-gray-400 text-xs">
                                <div className="flex justify-between">
                                  <span>Founder (25%):</span>
                                  <span>${automationResult.yields.fiatReserves.founder.toFixed(6)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Reinvest ({automationResult.asset}) (50%):</span>
                                  <span>${automationResult.yields.fiatReserves.reinvest.toFixed(6)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>To Swap Reserves (25%):</span>
                                  <span>${automationResult.yields.fiatReserves.toSwap.toFixed(6)}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h4 className="text-gray-400 text-xs uppercase tracking-wider mb-3">Swap Reserves Allocation</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span>Total Yield:</span>
                                <span className="text-emerald-400">+${automationResult.yields.swapReserves.total.toFixed(6)}</span>
                              </div>
                              <div className="pl-4 border-l border-gray-700 space-y-1 text-gray-400 text-xs">
                                <div className="flex justify-between">
                                  <span>Founder (25%):</span>
                                  <span>${automationResult.yields.swapReserves.founder.toFixed(6)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Reinvest (yXLM/USDY) (25%):</span>
                                  <span>${automationResult.yields.swapReserves.reinvest.toFixed(6)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>To Fiat Reserves (50%):</span>
                                  <span>${automationResult.yields.swapReserves.toFiat.toFixed(6)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-gray-800 flex justify-between items-center text-xs text-gray-500">
                          <span>Tx Hash: 0x{Math.random().toString(16).slice(2)}...</span>
                          <span>Block: {Math.floor(Math.random() * 1000000)}</span>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'functions' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      Solidity (EVM) Functions
                    </h4>
                    <div className="space-y-2">
                      {[
                        { name: 'bridgeToSoroban', args: '(string symbol, uint256 amount, string target)', desc: 'Initiates CCIP transfer to Stellar.' },
                        { name: 'mapEVMToSoroban', args: '(string sorobanAddr)', desc: 'Links EVM address to Soroban identity.' },
                        { name: 'updateEquilibrium', args: '(uint256 price, uint256 supply)', desc: 'Ensures backing matches circulating supply.' },
                      ].map((fn) => (
                        <div key={fn.name} className="p-3 bg-white rounded-lg border border-gray-100 font-mono text-xs shadow-sm">
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-blue-700 font-bold">{fn.name}</span>
                            <span className="text-gray-400">{fn.args}</span>
                          </div>
                          <div className="text-gray-500 italic">// {fn.desc}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                      Rust (Soroban) Functions
                    </h4>
                    <div className="space-y-2">
                      {[
                        { name: 'mint_token', args: '(amount: i128, symbol: Symbol)', desc: 'Mints Digital Fiat backed by yUSDC.' },
                        { name: 'bridge_in_evm_asset', args: '(to: Address, amount: i128)', desc: 'Receives bridged assets from EVM.' },
                        { name: 'map_soroban_to_evm', args: '(evm_addr: Symbol)', desc: 'Links Soroban address to EVM identity.' },
                      ].map((fn) => (
                        <div key={fn.name} className="p-3 bg-white rounded-lg border border-gray-100 font-mono text-xs shadow-sm">
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-emerald-700 font-bold">{fn.name}</span>
                            <span className="text-gray-400">{fn.args}</span>
                          </div>
                          <div className="text-gray-500 italic">// {fn.desc}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                 <div className="space-y-6">
                   <SecurityTab recovering={recovering} recoveryResult={recoveryResult} onRecover={handleSimulateRecovery} />
                   
                   <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                          <Shield className="w-5 h-5 text-indigo-600" />
                          Protocol Security Audit
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Real-time vulnerability scanning and compliance check.
                        </p>
                      </div>
                      <button 
                        onClick={handleAudit}
                        disabled={auditing}
                        className="px-6 py-2 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        {auditing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
                        Run Audit
                      </button>
                    </div>

                    {auditResults && (
                      <div className="space-y-4">
                        {auditResults.map((result: any) => (
                          <div key={result.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50 flex gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                              result.status === 'PASS' ? 'bg-emerald-100 text-emerald-600' :
                              result.status === 'WARNING' ? 'bg-yellow-100 text-yellow-600' :
                              'bg-red-100 text-red-600'
                            }`}>
                              {result.status === 'PASS' ? <CheckCircle2 className="w-5 h-5" /> :
                               result.status === 'WARNING' ? <AlertTriangle className="w-5 h-5" /> :
                               <X className="w-5 h-5" />}
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-start mb-1">
                                <h4 className="font-bold text-gray-900 text-sm">{result.name}</h4>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  result.status === 'PASS' ? 'bg-emerald-100 text-emerald-700' :
                                  result.status === 'WARNING' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-red-100 text-red-700'
                                }`}>
                                  {result.status}
                                </span>
                              </div>
                              <p className="text-xs text-gray-600 mb-2">{result.description}</p>
                              {result.recommendation && result.status !== 'PASS' && (
                                <div className="text-xs bg-white p-2 rounded border border-gray-200 text-gray-500">
                                  <span className="font-semibold text-gray-700">Fix: </span>
                                  {result.recommendation}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
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

function SecurityTab({ recovering, recoveryResult, onRecover }: { recovering: boolean, recoveryResult: any, onRecover: () => void }) {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-emerald-600" />
          CCIP Token Recovery System
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          The Chainlink Runtime Environment includes an automated security layer that intercepts tokens sent to incorrect chains or incompatible addresses. 
          Detected assets are automatically swapped to USDC (Stellar) and credited as Digital Dollars to the user's correct wallet.
        </p>

        <div className="relative bg-slate-900 rounded-xl p-6 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-yellow-500 to-emerald-500"></div>
          
          <div className="flex items-center justify-between text-white mb-8 relative z-10">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-2 border border-red-500/50">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <div className="text-xs font-mono text-red-300">Wrong Address</div>
              <div className="text-xs text-gray-400">0x...Dead</div>
            </div>
            
            <div className="flex-1 px-4 flex flex-col items-center">
              <div className="w-full h-0.5 bg-gray-700 relative">
                <div className="absolute inset-0 bg-blue-500/50 animate-pulse"></div>
              </div>
              <div className="bg-gray-800 px-3 py-1 rounded-full text-xs font-mono text-blue-300 -mt-2.5 z-10 border border-gray-700">
                CCIP Interceptor
              </div>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-2 border border-emerald-500/50">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="text-xs font-mono text-emerald-300">Correct Wallet</div>
              <div className="text-xs text-gray-400">G...Safe</div>
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-gray-400">Simulation Status</span>
              <span className="text-xs font-mono text-emerald-400">SYSTEM ACTIVE</span>
            </div>
            
            {recoveryResult ? (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
                <div className="flex items-center gap-2 text-emerald-400 font-medium text-sm mb-1">
                  <CheckCircle2 className="w-4 h-4" />
                  Recovery Successful
                </div>
                <div className="text-xs text-emerald-300/80">
                  Recovered <strong>{recoveryResult.lostAmount} {recoveryResult.lostToken}</strong><br/>
                  Credited <strong>${recoveryResult.recoveredValue.toLocaleString()} Digital Dollars</strong>
                </div>
              </div>
            ) : (
              <button 
                onClick={onRecover}
                disabled={recovering}
                className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                {recovering ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertTriangle className="w-4 h-4" />}
                Simulate Wrong Transfer (0.5 ETH)
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Rocket(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  )
}
