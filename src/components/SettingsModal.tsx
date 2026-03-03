import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Wallet, Building, CreditCard, Shield, Smartphone, Key, FileKey, Lock, Plus, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { API_BASE } from '../lib/api';

export function SettingsModal({ isOpen, onClose, address }: { isOpen: boolean, onClose: () => void, address: string }) {
  const [activeTab, setActiveTab] = useState<'general' | 'connections' | 'security'>('general');
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<any>({
    email: '',
    connections: [],
    security: {
      twoFaEmail: false,
      twoFaPhone: false,
      twoFaAuthApp: false,
      passwordSet: false,
      pinSet: false,
      encryptionKeySet: false
    }
  });

  // Form States
  const [newEmail, setNewEmail] = useState('');
  const [newConnection, setNewConnection] = useState({ type: 'wallet', value: '', label: '' });
  const [securityForm, setSecurityForm] = useState({ type: '', value: '' });

  useEffect(() => {
    if (isOpen && address) {
      loadSettings();
    }
  }, [isOpen, address]);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/settings/${address}`);
      const data = await res.json();
      setSettings(data);
      setNewEmail(data.email || '');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEmail = async () => {
    await fetch(`${API_BASE}/settings/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address, type: 'email', value: newEmail }),
    });
    loadSettings();
  };

  const handleAddConnection = async () => {
    if (!newConnection.value) return;
    await fetch(`${API_BASE}/settings/connections/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address, ...newConnection }),
    });
    setNewConnection({ type: 'wallet', value: '', label: '' });
    loadSettings();
  };

  const handleRemoveConnection = async (id: number) => {
    await fetch(`${API_BASE}/settings/connections/remove`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address, id }),
    });
    loadSettings();
  };

  const handleToggleSecurity = async (type: string, enabled: boolean) => {
    // For simple toggles like Email/Phone 2FA (simulated)
    await fetch(`${API_BASE}/settings/security/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address, type, enabled }),
    });
    loadSettings();
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
            className="relative bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="bg-slate-900 text-white p-6 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-700 rounded-xl flex items-center justify-center shadow-lg">
                  <SettingsIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight">Account Settings</h2>
                  <div className="text-xs text-slate-400 font-mono">Manage Security & Connections</div>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Navigation */}
            <div className="bg-slate-50 border-b border-slate-200 px-6 flex gap-6 overflow-x-auto shrink-0">
              {[
                { id: 'general', label: 'General', icon: Mail },
                { id: 'connections', label: 'Connections', icon: LinkIcon },
                { id: 'security', label: 'Security & 2FA', icon: Shield },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id 
                      ? 'border-indigo-600 text-indigo-600' 
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 custom-scrollbar">
              
              {/* --- GENERAL TAB --- */}
              {activeTab === 'general' && (
                <div className="max-w-xl mx-auto space-y-6">
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <Mail className="w-5 h-5 text-indigo-600" />
                      Email Address
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Primary Email</label>
                        <div className="flex gap-2">
                          <input 
                            type="email" 
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="your@email.com"
                          />
                          <button 
                            onClick={handleUpdateEmail}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
                          >
                            Update
                          </button>
                        </div>
                        <p className="text-xs text-slate-500 mt-2">
                          Used for notifications and account recovery.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* --- CONNECTIONS TAB --- */}
              {activeTab === 'connections' && (
                <div className="space-y-6">
                  {/* Add Connection */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <Plus className="w-5 h-5 text-indigo-600" />
                      Add New Connection
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <select 
                        value={newConnection.type}
                        onChange={(e) => setNewConnection({...newConnection, type: e.target.value})}
                        className="p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                      >
                        <option value="wallet">Wallet</option>
                        <option value="bank">Bank Account</option>
                        <option value="card">Debit Card</option>
                      </select>
                      <input 
                        type="text" 
                        placeholder={newConnection.type === 'wallet' ? "Wallet Address (0x...)" : newConnection.type === 'bank' ? "Account Number" : "Card Number"}
                        value={newConnection.value}
                        onChange={(e) => setNewConnection({...newConnection, value: e.target.value})}
                        className="md:col-span-2 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                      <button 
                        onClick={handleAddConnection}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
                      >
                        Connect
                      </button>
                    </div>
                  </div>

                  {/* List Connections */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {settings.connections.map((conn: any) => (
                      <div key={conn.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            conn.type === 'wallet' ? 'bg-purple-100 text-purple-600' :
                            conn.type === 'bank' ? 'bg-blue-100 text-blue-600' :
                            'bg-emerald-100 text-emerald-600'
                          }`}>
                            {conn.type === 'wallet' ? <Wallet className="w-5 h-5" /> :
                             conn.type === 'bank' ? <Building className="w-5 h-5" /> :
                             <CreditCard className="w-5 h-5" />}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 capitalize">{conn.type}</div>
                            <div className="text-xs font-mono text-slate-500">{conn.value}</div>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleRemoveConnection(conn.id)}
                          className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {settings.connections.length === 0 && (
                      <div className="col-span-full text-center py-8 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        No connections found. Add a wallet, bank, or card above.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* --- SECURITY TAB --- */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 2FA Methods */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                      <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-indigo-600" />
                        Two-Factor Authentication
                      </h3>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <div className="flex items-center gap-3">
                            <Mail className="w-5 h-5 text-slate-500" />
                            <div>
                              <div className="font-medium text-slate-900">Email 2FA</div>
                              <div className="text-xs text-slate-500">Code sent to email</div>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={settings.security.twoFaEmail} onChange={(e) => handleToggleSecurity('twoFaEmail', e.target.checked)} className="sr-only peer" />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <div className="flex items-center gap-3">
                            <Smartphone className="w-5 h-5 text-slate-500" />
                            <div>
                              <div className="font-medium text-slate-900">SMS 2FA</div>
                              <div className="text-xs text-slate-500">Code sent to phone</div>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={settings.security.twoFaPhone} onChange={(e) => handleToggleSecurity('twoFaPhone', e.target.checked)} className="sr-only peer" />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <div className="flex items-center gap-3">
                            <Lock className="w-5 h-5 text-slate-500" />
                            <div>
                              <div className="font-medium text-slate-900">Authenticator App</div>
                              <div className="text-xs text-slate-500">Google/Authy</div>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={settings.security.twoFaAuthApp} onChange={(e) => handleToggleSecurity('twoFaAuthApp', e.target.checked)} className="sr-only peer" />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Advanced Security */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                      <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <Key className="w-5 h-5 text-indigo-600" />
                        Access Control
                      </h3>

                      <div className="space-y-4">
                         <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <div className="flex items-center gap-3">
                            <div className="font-mono text-lg font-bold text-slate-400">****</div>
                            <div>
                              <div className="font-medium text-slate-900">Password</div>
                              <div className="text-xs text-slate-500">{settings.security.passwordSet ? 'Set' : 'Not Set'}</div>
                            </div>
                          </div>
                          <button className="text-sm text-indigo-600 font-medium hover:underline">
                            {settings.security.passwordSet ? 'Change' : 'Set up'}
                          </button>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <div className="flex items-center gap-3">
                            <div className="font-mono text-lg font-bold text-slate-400">1234</div>
                            <div>
                              <div className="font-medium text-slate-900">4-Digit PIN</div>
                              <div className="text-xs text-slate-500">{settings.security.pinSet ? 'Set' : 'Not Set'}</div>
                            </div>
                          </div>
                          <button className="text-sm text-indigo-600 font-medium hover:underline">
                            {settings.security.pinSet ? 'Change' : 'Set up'}
                          </button>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <div className="flex items-center gap-3">
                            <FileKey className="w-5 h-5 text-slate-500" />
                            <div>
                              <div className="font-medium text-slate-900">Encryption Key</div>
                              <div className="text-xs text-slate-500">{settings.security.encryptionKeySet ? 'Uploaded' : 'Not Uploaded'}</div>
                            </div>
                          </div>
                          <button className="text-sm text-indigo-600 font-medium hover:underline">
                            {settings.security.encryptionKeySet ? 'Replace' : 'Upload'}
                          </button>
                        </div>
                      </div>
                    </div>
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

function SettingsIcon(props: any) {
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
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function LinkIcon(props: any) {
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
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  )
}
