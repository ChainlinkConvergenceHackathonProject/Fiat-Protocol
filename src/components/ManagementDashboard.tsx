import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Package, Users, Settings, Plus, Trash2, ToggleLeft, ToggleRight, Lock, Eye, EyeOff, Briefcase, DollarSign, Calendar, AlertTriangle, LayoutDashboard, TrendingUp, TrendingDown, Wallet, Upload, FileJson, ArrowRight, CheckCircle, AlertCircle, Building, RefreshCw } from 'lucide-react';
import { ASSETS } from '../lib/constants';
import { fetchManagementData, addInventoryItem, removeInventoryItem, toggleAssetSetting, addEmployee, removeEmployee, previewImport, applyImport, addProperty, swapProperty, transferProperty, tradeProperty, depositPropertyVault } from '../lib/managementApi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { SettingsModal } from './SettingsModal';
import { SendModal } from './SendModal';
import { ReceiveModal } from './ReceiveModal';

export function ManagementDashboard({ isOpen, onClose, address }: { isOpen: boolean, onClose: () => void, address: string }) {
  const [activeTab, setActiveTab] = useState<'overview' | 'inventory' | 'assets' | 'personnel' | 'wallet' | 'properties'>('overview');
  const [data, setData] = useState<any>({ inventory: [], assetSettings: [], employees: [], properties: [], balances: [] });
  const [loading, setLoading] = useState(false);
  
  // Import States
  const [showImport, setShowImport] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showSend, setShowSend] = useState(false);
  const [showReceive, setShowReceive] = useState(false);
  const [importStep, setImportStep] = useState<'upload' | 'preview' | 'success'>('upload');
  const [importText, setImportText] = useState('');
  const [importDiff, setImportDiff] = useState<any>(null);

  // Form States
  const [newItem, setNewItem] = useState({ name: '', description: '', price: '', image_url: '' });
  const [newEmployee, setNewEmployee] = useState({ name: '', dob: '', ssn: '', image_url: '', occupation: '', pay_rate: '', description: '' });
  const [newProperty, setNewProperty] = useState({ property_address: '', description: '', market_cap: '', image_url: '', apn: '', title_number: '', zoning: '', jurisdiction: '' });
  const [swappingId, setSwappingId] = useState<number | null>(null);
  const [transferModal, setTransferModal] = useState<{isOpen: boolean, propertyId: number | null}>({isOpen: false, propertyId: null});
  const [transferAddress, setTransferAddress] = useState('');
  const [swapModal, setSwapModal] = useState<{isOpen: boolean, property: any | null}>({isOpen: false, property: null});
  const [depositModal, setDepositModal] = useState<{isOpen: boolean, property: any | null}>({isOpen: false, property: null});
  const [depositAmount, setDepositAmount] = useState('');
  const [depositCurrency, setDepositCurrency] = useState('USDC');
  const [targetAsset, setTargetAsset] = useState<string>('USD');

  useEffect(() => {
    if (isOpen && address) {
      loadData();
    }
  }, [isOpen, address]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchManagementData(address);
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async () => {
    if (!newItem.name || !newItem.price) return;
    await addInventoryItem(address, newItem);
    setNewItem({ name: '', description: '', price: '', image_url: '' });
    loadData();
  };

  const handleRemoveItem = async (id: number) => {
    await removeInventoryItem(address, id);
    loadData();
  };

  const handleToggleAsset = async (code: string, currentStatus: boolean) => {
    // If currently true (or undefined which defaults to true), we toggle to false
    const newStatus = !currentStatus;
    await toggleAssetSetting(address, code, newStatus);
    loadData();
  };

  const handleAddEmployee = async () => {
    if (!newEmployee.name || !newEmployee.occupation) return;
    await addEmployee(address, newEmployee);
    setNewEmployee({ name: '', dob: '', ssn: '', image_url: '', occupation: '', pay_rate: '', description: '' });
    loadData();
  };

  const handleRemoveEmployee = async (id: number) => {
    const date = new Date().toISOString();
    await removeEmployee(address, id, date);
    loadData();
  };

  const handleAddProperty = async () => {
    if (!newProperty.property_address || !newProperty.market_cap) return;
    await addProperty(address, newProperty);
    setNewProperty({ property_address: '', description: '', market_cap: '', image_url: '', apn: '', title_number: '', zoning: '', jurisdiction: '' });
    loadData();
  };

  const handleTransferProperty = async () => {
    if (!transferModal.propertyId || !transferAddress) return;
    await transferProperty(address, transferModal.propertyId, transferAddress);
    setTransferModal({ isOpen: false, propertyId: null });
    setTransferAddress('');
    loadData();
  };

  const handleTradeProperty = async (id: number) => {
    // For simulation, we just mark it as listed
    await tradeProperty(address, id, 0);
    loadData();
  };

  const handleDepositVault = async () => {
    if (!depositModal.property || !depositAmount) return;
    try {
        await depositPropertyVault(address, depositModal.property.id, depositCurrency, parseFloat(depositAmount));
        setDepositModal({ isOpen: false, property: null });
        setDepositAmount('');
        loadData();
    } catch (e) {
        console.error(e);
    }
  };

  const handleConfirmSwap = async () => {
    if (!swapModal.property) return;
    setSwappingId(swapModal.property.id);
    try {
      await swapProperty(address, swapModal.property.id, targetAsset);
      setSwapModal({ isOpen: false, property: null });
      loadData();
    } catch (e) {
      console.error(e);
    } finally {
      setSwappingId(null);
    }
  };

  const handleImportPreview = async () => {
    try {
      const parsed = JSON.parse(importText);
      const res = await previewImport(address, parsed);
      setImportDiff(res);
      setImportStep('preview');
    } catch (e) {
      alert('Invalid JSON format');
    }
  };

  const handleImportApply = async () => {
    if (!importDiff) return;
    await applyImport(address, importDiff);
    setImportStep('success');
    loadData();
    setTimeout(() => {
      setShowImport(false);
      setImportStep('upload');
      setImportText('');
      setImportDiff(null);
    }, 2000);
  };

  const isAssetEnabled = (code: string) => {
    const setting = data.assetSettings.find((s: any) => s.asset_code === code);
    return setting ? !!setting.enabled : true; // Default to true if not set
  };

  // --- Statistics Calculation ---
  const totalInventoryValue = data.inventory.reduce((acc: number, item: any) => acc + (parseFloat(item.price) || 0), 0);
  const totalEmployees = data.employees.filter((e: any) => e.status !== 'Terminated').length;
  const totalPayrollPerHour = data.employees
    .filter((e: any) => e.status !== 'Terminated')
    .reduce((acc: number, emp: any) => acc + (parseFloat(emp.pay_rate) || 0), 0);
  
  // Mock Profit/Loss Data for Chart
  const profitLossData = [
    { name: 'Jan', profit: 4000, loss: 2400 },
    { name: 'Feb', profit: 3000, loss: 1398 },
    { name: 'Mar', profit: 2000, loss: 9800 },
    { name: 'Apr', profit: 2780, loss: 3908 },
    { name: 'May', profit: 1890, loss: 4800 },
    { name: 'Jun', profit: 2390, loss: 3800 },
    { name: 'Jul', profit: 3490, loss: 4300 },
  ];

  // Employee Salary Distribution Data
  const salaryData = data.employees
    .filter((e: any) => e.status !== 'Terminated')
    .map((e: any) => ({ name: e.name, salary: parseFloat(e.pay_rate) || 0 }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

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
            className="relative bg-white w-full max-w-6xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="bg-slate-900 text-white p-6 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-900/50">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight">Payment Processor & Inventory</h2>
                  <div className="text-xs text-slate-400 font-mono">Non-Custodial Management System</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setShowSettings(true)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors border border-slate-700"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </button>
                <button 
                  onClick={() => setShowImport(true)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors border border-slate-700"
                >
                  <Upload className="w-4 h-4" />
                  Import Data
                </button>
                <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Navigation */}
            <div className="bg-slate-50 border-b border-slate-200 px-6 flex gap-6 overflow-x-auto shrink-0">
              {[
                { id: 'overview', label: 'Overview', icon: LayoutDashboard },
                { id: 'wallet', label: 'Wallet', icon: Wallet },
                { id: 'inventory', label: 'Inventory', icon: Package },
                { id: 'assets', label: 'Accepting Assets', icon: Settings },
                { id: 'personnel', label: 'Personnel', icon: Users },
                { id: 'properties', label: 'Properties', icon: Building },
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
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 custom-scrollbar relative">
              
              {/* Settings Modal */}
              <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} address={address} />
              
              <SendModal
                isOpen={showSend}
                onClose={() => setShowSend(false)}
                address={address}
                balances={data.balances || []}
                onUpdate={loadData}
              />

              <ReceiveModal
                isOpen={showReceive}
                onClose={() => setShowReceive(false)}
                address={address}
              />

              {/* --- IMPORT MODAL --- */}
              <AnimatePresence>
                {showImport && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute inset-0 z-10 bg-white p-6 flex flex-col"
                  >
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <Upload className="w-6 h-6 text-indigo-600" />
                        Import Data
                      </h3>
                      <button onClick={() => setShowImport(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
                        <X className="w-6 h-6" />
                      </button>
                    </div>

                    {importStep === 'upload' && (
                      <div className="flex-1 flex flex-col gap-4">
                        <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex gap-3">
                          <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                          <div className="text-sm text-blue-800">
                            <p className="font-bold mb-1">Data Reconciliation</p>
                            <p>Imported data will be compared against your current on-chain records. You'll have a chance to review changes before applying them.</p>
                          </div>
                        </div>

                        <textarea
                          value={importText}
                          onChange={(e) => setImportText(e.target.value)}
                          placeholder={`Paste JSON data here... e.g.
{
  "inventory": [
    { "name": "New Item", "price": 50, "description": "..." }
  ],
  "employees": [
    { "name": "Jane Doe", "pay_rate": 25, "occupation": "Manager" }
  ]
}`}
                          className="flex-1 w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                        />

                        <div className="flex justify-end gap-3">
                          <button 
                            onClick={() => setImportText(JSON.stringify({
                              inventory: [
                                { name: "Imported Widget A", price: 120, description: "High quality widget", image_url: "" },
                                { name: "Imported Widget B", price: 85, description: "Standard widget", image_url: "" }
                              ],
                              employees: [
                                { name: "Alice Import", pay_rate: 35, occupation: "Consultant", dob: "1990-01-01", ssn: "XXX-XX-1234", image_url: "", description: "External consultant" }
                              ]
                            }, null, 2))}
                            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                          >
                            Load Sample Data
                          </button>
                          <button 
                            onClick={handleImportPreview}
                            disabled={!importText}
                            className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                            Preview Changes <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}

                    {importStep === 'preview' && importDiff && (
                      <div className="flex-1 flex flex-col gap-6 overflow-hidden">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 shrink-0">
                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <h4 className="font-bold text-slate-700 mb-2 flex items-center gap-2">
                              <Package className="w-4 h-4" /> Inventory Impact
                            </h4>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-slate-500">Current Value:</span>
                              <span className="font-mono font-medium">${importDiff.inventoryDiff.stats.currentValue.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-slate-500">Projected Value:</span>
                              <span className="font-mono font-bold text-indigo-600">${importDiff.inventoryDiff.stats.projectedValue.toLocaleString()}</span>
                            </div>
                            <div className="mt-3 flex gap-2 text-xs">
                              <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">+{importDiff.inventoryDiff.new.length} New</span>
                              <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full">{importDiff.inventoryDiff.updated.length} Updates</span>
                            </div>
                          </div>

                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <h4 className="font-bold text-slate-700 mb-2 flex items-center gap-2">
                              <Users className="w-4 h-4" /> Payroll Impact
                            </h4>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-slate-500">Current /hr:</span>
                              <span className="font-mono font-medium">${importDiff.employeeDiff.stats.currentPayroll.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-slate-500">Projected /hr:</span>
                              <span className="font-mono font-bold text-indigo-600">${importDiff.employeeDiff.stats.projectedPayroll.toLocaleString()}</span>
                            </div>
                            <div className="mt-3 flex gap-2 text-xs">
                              <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">+{importDiff.employeeDiff.new.length} New</span>
                              <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full">{importDiff.employeeDiff.updated.length} Updates</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex-1 overflow-y-auto border border-slate-200 rounded-xl">
                          <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                              <tr>
                                <th className="p-3">Type</th>
                                <th className="p-3">Name</th>
                                <th className="p-3">Change</th>
                                <th className="p-3">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {/* Inventory Rows */}
                              {importDiff.inventoryDiff.new.map((item: any, i: number) => (
                                <tr key={`inv-new-${i}`} className="bg-emerald-50/30">
                                  <td className="p-3"><Package className="w-4 h-4 text-slate-400" /></td>
                                  <td className="p-3 font-medium">{item.name}</td>
                                  <td className="p-3 text-emerald-600">+${item.price}</td>
                                  <td className="p-3"><span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">New</span></td>
                                </tr>
                              ))}
                              {importDiff.inventoryDiff.updated.map((item: any, i: number) => (
                                <tr key={`inv-upd-${i}`} className="bg-amber-50/30">
                                  <td className="p-3"><Package className="w-4 h-4 text-slate-400" /></td>
                                  <td className="p-3 font-medium">{item.name}</td>
                                  <td className="p-3 text-amber-600">${item.oldPrice} → ${item.price}</td>
                                  <td className="p-3"><span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded-full">Update</span></td>
                                </tr>
                              ))}

                              {/* Employee Rows */}
                              {importDiff.employeeDiff.new.map((item: any, i: number) => (
                                <tr key={`emp-new-${i}`} className="bg-emerald-50/30">
                                  <td className="p-3"><Users className="w-4 h-4 text-slate-400" /></td>
                                  <td className="p-3 font-medium">{item.name}</td>
                                  <td className="p-3 text-emerald-600">+${item.pay_rate}/hr</td>
                                  <td className="p-3"><span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">New</span></td>
                                </tr>
                              ))}
                              {importDiff.employeeDiff.updated.map((item: any, i: number) => (
                                <tr key={`emp-upd-${i}`} className="bg-amber-50/30">
                                  <td className="p-3"><Users className="w-4 h-4 text-slate-400" /></td>
                                  <td className="p-3 font-medium">{item.name}</td>
                                  <td className="p-3 text-amber-600">${item.oldPay} → ${item.pay_rate}/hr</td>
                                  <td className="p-3"><span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded-full">Update</span></td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                          <button 
                            onClick={() => setImportStep('upload')}
                            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                          >
                            Back
                          </button>
                          <button 
                            onClick={handleImportApply}
                            className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Confirm & Apply Changes
                          </button>
                        </div>
                      </div>
                    )}

                    {importStep === 'success' && (
                      <div className="flex-1 flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                          <CheckCircle className="w-8 h-8" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-2">Import Successful</h3>
                        <p className="text-slate-500 max-w-md">
                          Your inventory and personnel records have been updated. The dashboard will now reflect the latest on-chain state.
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* --- OVERVIEW TAB --- */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                      <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                          <Package className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="text-sm text-slate-500 font-medium">Total Inventory Value</div>
                          <div className="text-2xl font-bold text-slate-900">${totalInventoryValue.toLocaleString()}</div>
                        </div>
                      </div>
                      <div className="text-xs text-slate-400 mt-2">Based on current listing prices</div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                      <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                          <Users className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="text-sm text-slate-500 font-medium">Active Employees</div>
                          <div className="text-2xl font-bold text-slate-900">{totalEmployees}</div>
                        </div>
                      </div>
                      <div className="text-xs text-slate-400 mt-2">Currently on payroll</div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                      <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                          <DollarSign className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="text-sm text-slate-500 font-medium">Hourly Payroll Cost</div>
                          <div className="text-2xl font-bold text-slate-900">${totalPayrollPerHour.toLocaleString()}/hr</div>
                        </div>
                      </div>
                      <div className="text-xs text-slate-400 mt-2">Estimated burn rate</div>
                    </div>
                  </div>

                  {/* Charts Row 1 */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                      <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-indigo-600" />
                        Profit & Loss (YTD)
                      </h3>
                      <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={profitLossData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                            <Tooltip 
                              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                              cursor={{ fill: '#f8fafc' }}
                            />
                            <Bar dataKey="profit" fill="#10b981" radius={[4, 4, 0, 0]} name="Profit" />
                            <Bar dataKey="loss" fill="#ef4444" radius={[4, 4, 0, 0]} name="Loss" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                      <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <Wallet className="w-5 h-5 text-indigo-600" />
                        Payroll Distribution
                      </h3>
                      <div className="h-64 w-full">
                        {salaryData.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={salaryData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="salary"
                              >
                                {salaryData.map((entry: any, index: number) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                            </PieChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                            No employee data available
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 justify-center mt-4">
                        {salaryData.map((entry: any, index: number) => (
                          <div key={index} className="flex items-center gap-1.5 text-xs text-slate-600">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                            {entry.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* --- WALLET TAB --- */}
              {activeTab === 'wallet' && (
                <div className="space-y-6">
                  <div className="flex gap-4 mb-6">
                    <button 
                      onClick={() => setShowReceive(true)}
                      className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 hover:shadow-indigo-300 flex items-center justify-center gap-2"
                    >
                      <ArrowRight className="w-5 h-5 rotate-90" />
                      Deposit
                    </button>
                    <button 
                      onClick={() => setShowSend(true)}
                      className="flex-1 py-4 bg-white text-indigo-600 border border-indigo-100 rounded-2xl font-bold hover:bg-indigo-50 transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                    >
                      <ArrowRight className="w-5 h-5 -rotate-45" />
                      Withdraw
                    </button>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <Wallet className="w-5 h-5 text-indigo-600" />
                      Current Balances
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {data.balances?.map((b: any) => (
                        <div key={b.currency} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                          <div>
                            <div className="text-xs text-slate-500 font-medium mb-1">{b.currency}</div>
                            <div className="text-xl font-bold text-slate-900 font-mono">
                              {b.amount.toLocaleString()}
                            </div>
                          </div>
                          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-slate-100 shadow-sm text-slate-400">
                            <DollarSign className="w-5 h-5" />
                          </div>
                        </div>
                      ))}
                      {(!data.balances || data.balances.length === 0) && (
                        <div className="col-span-full text-center py-8 text-slate-400 italic">
                          No balances found. Deposit assets to get started.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* --- INVENTORY TAB --- */}
              {activeTab === 'inventory' && (
                <div className="space-y-8">
                  {/* Add Item Form */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <Plus className="w-5 h-5 text-indigo-600" />
                      Add Item For Sale
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <input 
                        type="text" 
                        placeholder="Item Name" 
                        value={newItem.name}
                        onChange={e => setNewItem({...newItem, name: e.target.value})}
                        className="p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                      <input 
                        type="number" 
                        placeholder="Price (USD)" 
                        value={newItem.price}
                        onChange={e => setNewItem({...newItem, price: e.target.value})}
                        className="p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                      <input 
                        type="text" 
                        placeholder="Image URL" 
                        value={newItem.image_url}
                        onChange={e => setNewItem({...newItem, image_url: e.target.value})}
                        className="p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                      <input 
                        type="text" 
                        placeholder="Description" 
                        value={newItem.description}
                        onChange={e => setNewItem({...newItem, description: e.target.value})}
                        className="p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                    <button 
                      onClick={handleAddItem}
                      className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
                    >
                      Add to Inventory
                    </button>
                  </div>

                  {/* Inventory List */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {data.inventory.map((item: any) => (
                      <div key={item.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
                        <div className="aspect-video bg-slate-100 relative overflow-hidden">
                          {item.image_url ? (
                            <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                              <Package className="w-12 h-12" />
                            </div>
                          )}
                          <button 
                            onClick={() => handleRemoveItem(item.id)}
                            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold text-slate-900">{item.name}</h4>
                            <span className="font-mono text-indigo-600 font-bold">${item.price.toLocaleString()}</span>
                          </div>
                          <p className="text-sm text-slate-500 line-clamp-2">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* --- ASSETS TAB --- */}
              {activeTab === 'assets' && (
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Manage Accepting Digital Assets</h3>
                    <p className="text-sm text-slate-500 mb-6">
                      Configure how you accept payments. 
                      <span className="text-emerald-600 font-bold mx-1">Enabled</span> means you accept the asset directly. 
                      <span className="text-red-500 font-bold mx-1">Disabled</span> means the asset is automatically swapped to Digital Dollars (USDC Stellar) upon receipt.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {ASSETS.map((asset) => {
                        const enabled = isAssetEnabled(asset.code);
                        return (
                          <div key={asset.code} className={`p-4 rounded-xl border flex items-center justify-between transition-colors ${enabled ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${enabled ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                <asset.icon className="w-5 h-5" />
                              </div>
                              <div>
                                <div className="font-bold text-slate-900">{asset.code}</div>
                                <div className="text-xs text-slate-500">{asset.label}</div>
                              </div>
                            </div>
                            
                            <button 
                              onClick={() => handleToggleAsset(asset.code, enabled)}
                              className={`text-2xl transition-colors ${enabled ? 'text-emerald-500 hover:text-emerald-600' : 'text-red-500 hover:text-red-600'}`}
                            >
                              {enabled ? <ToggleRight className="w-10 h-10" /> : <ToggleLeft className="w-10 h-10" />}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* --- PERSONNEL TAB --- */}
              {activeTab === 'personnel' && (
                <div className="space-y-8">
                  {/* Add Employee Form */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <Users className="w-5 h-5 text-indigo-600" />
                      Add Employee
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="relative">
                        <input 
                          type="text" 
                          placeholder="Full Name (Hybrid)" 
                          value={newEmployee.name}
                          onChange={e => setNewEmployee({...newEmployee, name: e.target.value})}
                          className="w-full p-3 pl-10 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                        <Eye className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                      </div>
                      <div className="relative">
                        <input 
                          type="text" 
                          placeholder="Date of Birth (Private)" 
                          value={newEmployee.dob}
                          onChange={e => setNewEmployee({...newEmployee, dob: e.target.value})}
                          className="w-full p-3 pl-10 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                        <Lock className="w-4 h-4 text-red-400 absolute left-3 top-3.5" />
                      </div>
                      <div className="relative">
                        <input 
                          type="text" 
                          placeholder="Social Security # (Private)" 
                          value={newEmployee.ssn}
                          onChange={e => setNewEmployee({...newEmployee, ssn: e.target.value})}
                          className="w-full p-3 pl-10 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                        <Lock className="w-4 h-4 text-red-400 absolute left-3 top-3.5" />
                      </div>
                      <div className="relative">
                        <input 
                          type="text" 
                          placeholder="Occupation" 
                          value={newEmployee.occupation}
                          onChange={e => setNewEmployee({...newEmployee, occupation: e.target.value})}
                          className="w-full p-3 pl-10 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                        <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                      </div>
                      <div className="relative">
                        <input 
                          type="number" 
                          placeholder="Pay Per Hour (Hybrid)" 
                          value={newEmployee.pay_rate}
                          onChange={e => setNewEmployee({...newEmployee, pay_rate: e.target.value})}
                          className="w-full p-3 pl-10 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                        <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                      </div>
                      <input 
                        type="text" 
                        placeholder="Image URL (Hybrid)" 
                        value={newEmployee.image_url}
                        onChange={e => setNewEmployee({...newEmployee, image_url: e.target.value})}
                        className="p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                    <div className="mb-4">
                        <textarea 
                          placeholder="Description / Notes" 
                          value={newEmployee.description}
                          onChange={e => setNewEmployee({...newEmployee, description: e.target.value})}
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none h-24 resize-none"
                        />
                    </div>
                    <button 
                      onClick={handleAddEmployee}
                      className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
                    >
                      Add Employee
                    </button>
                  </div>

                  {/* Employee List */}
                  <div className="space-y-4">
                    {data.employees.map((emp: any) => (
                      <div key={emp.id} className={`bg-white p-6 rounded-2xl border ${emp.status === 'Terminated' ? 'border-red-100 bg-red-50/30' : 'border-slate-200'} shadow-sm flex flex-col md:flex-row gap-6 items-start`}>
                        <div className="w-20 h-20 bg-slate-100 rounded-full overflow-hidden shrink-0 border border-slate-200">
                          {emp.image_url ? (
                            <img src={emp.image_url} alt={emp.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                              <Users className="w-8 h-8" />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 w-full">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                {emp.name}
                                {emp.status === 'Terminated' && (
                                  <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full font-medium">Terminated</span>
                                )}
                              </h4>
                              <div className="text-indigo-600 font-medium">{emp.occupation}</div>
                            </div>
                            <div className="text-right">
                              <div className="font-mono font-bold text-slate-900">${emp.pay_rate}/hr</div>
                              <div className="text-xs text-slate-500 flex items-center justify-end gap-1">
                                <Eye className="w-3 h-3" /> Hybrid
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4 p-4 bg-slate-50 rounded-xl text-sm border border-slate-100">
                            <div className="flex items-center gap-2 text-slate-600">
                              <Lock className="w-3 h-3 text-red-400" />
                              <span className="font-semibold">DOB:</span> 
                              <span className="font-mono text-slate-500 blur-[2px] hover:blur-0 transition-all cursor-help" title="Private Data">{emp.dob}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-600">
                              <Lock className="w-3 h-3 text-red-400" />
                              <span className="font-semibold">SSN:</span> 
                              <span className="font-mono text-slate-500 blur-[2px] hover:blur-0 transition-all cursor-help" title="Private Data">{emp.ssn}</span>
                            </div>
                          </div>

                          <p className="text-slate-500 text-sm mb-4">{emp.description}</p>

                          {emp.status !== 'Terminated' && (
                            <button 
                              onClick={() => handleRemoveEmployee(emp.id)}
                              className="px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors flex items-center gap-2"
                            >
                              <Trash2 className="w-4 h-4" />
                              Terminate & Calculate Final Schedule
                            </button>
                          )}
                          {emp.status === 'Terminated' && (
                            <div className="text-xs text-red-500 font-mono mt-2">
                              Terminated on: {new Date(emp.termination_date).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* --- PROPERTIES TAB --- */}
              {activeTab === 'properties' && (
                <div className="space-y-8">
                  {/* Add Property Form */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <Building className="w-5 h-5 text-indigo-600" />
                      Add Property
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <input 
                        type="text" 
                        placeholder="Property Address / Title" 
                        value={newProperty.property_address}
                        onChange={e => setNewProperty({...newProperty, property_address: e.target.value})}
                        className="p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                      <input 
                        type="number" 
                        placeholder="Market Cap (Equity Value)" 
                        value={newProperty.market_cap}
                        onChange={e => setNewProperty({...newProperty, market_cap: e.target.value})}
                        className="p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                      <input 
                        type="text" 
                        placeholder="APN (Assessor's Parcel Number)" 
                        value={newProperty.apn}
                        onChange={e => setNewProperty({...newProperty, apn: e.target.value})}
                        className="p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                      <input 
                        type="text" 
                        placeholder="Title / Deed Number" 
                        value={newProperty.title_number}
                        onChange={e => setNewProperty({...newProperty, title_number: e.target.value})}
                        className="p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                      <input 
                        type="text" 
                        placeholder="Zoning Code" 
                        value={newProperty.zoning}
                        onChange={e => setNewProperty({...newProperty, zoning: e.target.value})}
                        className="p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                      <input 
                        type="text" 
                        placeholder="Jurisdiction" 
                        value={newProperty.jurisdiction}
                        onChange={e => setNewProperty({...newProperty, jurisdiction: e.target.value})}
                        className="p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                      <input 
                        type="text" 
                        placeholder="Image URL" 
                        value={newProperty.image_url}
                        onChange={e => setNewProperty({...newProperty, image_url: e.target.value})}
                        className="p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                      <input 
                        type="text" 
                        placeholder="Description" 
                        value={newProperty.description}
                        onChange={e => setNewProperty({...newProperty, description: e.target.value})}
                        className="p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                    <button 
                      onClick={handleAddProperty}
                      className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
                    >
                      Add Property
                    </button>
                  </div>

                  {/* Properties List */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {data.properties?.map((item: any) => (
                      <div key={item.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col">
                        <div className="aspect-video bg-slate-100 relative overflow-hidden shrink-0">
                          {item.image_url ? (
                            <img src={item.image_url} alt={item.address} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                              <Building className="w-12 h-12" />
                            </div>
                          )}
                          <div className="absolute top-2 right-2 px-2 py-1 bg-black/50 backdrop-blur-md text-white text-xs rounded-lg font-medium">
                            {item.status}
                          </div>
                        </div>
                        <div className="p-4 flex-1 flex flex-col">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold text-slate-900 line-clamp-1" title={item.address}>{item.address}</h4>
                            <span className="font-mono text-indigo-600 font-bold">${item.market_cap.toLocaleString()}</span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 mb-3 bg-slate-50 p-2 rounded-lg">
                            <div><span className="font-semibold">APN:</span> {item.apn || 'N/A'}</div>
                            <div><span className="font-semibold">Zoning:</span> {item.zoning || 'N/A'}</div>
                            <div><span className="font-semibold">Title:</span> {item.title_number || 'N/A'}</div>
                            <div><span className="font-semibold">Jurisdiction:</span> {item.jurisdiction || 'N/A'}</div>
                          </div>

                          <p className="text-sm text-slate-500 line-clamp-2 mb-4 flex-1">{item.description}</p>
                          
                          <div className="space-y-2 mt-auto">
                            {item.status === 'Active' && (
                              <>
                                <button 
                                  onClick={() => { setTargetAsset('USD'); setSwapModal({ isOpen: true, property: item }); }}
                                  disabled={swappingId === item.id}
                                  className="w-full py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 text-xs"
                                  title="100% to Owner (minus $0.01 fee)"
                                >
                                  {swappingId === item.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                                  Swap Equity (100% to Owner)
                                </button>
                                <div className="flex gap-2">
                                  <button 
                                    onClick={() => setDepositModal({ isOpen: true, property: item })}
                                    className="flex-1 py-2 bg-indigo-50 text-indigo-700 rounded-lg font-medium hover:bg-indigo-100 transition-colors text-xs flex items-center justify-center gap-1"
                                  >
                                    <DollarSign className="w-3 h-3" /> Deposit
                                  </button>
                                  <button 
                                    onClick={() => setTransferModal({ isOpen: true, propertyId: item.id })}
                                    className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors text-xs"
                                  >
                                    Transfer
                                  </button>
                                </div>
                                <button 
                                  onClick={() => handleTradeProperty(item.id)}
                                  className="w-full py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors text-xs"
                                >
                                  List Trade
                                </button>
                              </>
                            )}
                            {item.status === 'Swapped' && (
                               <>
                               <div className="w-full py-2 bg-slate-100 text-slate-500 rounded-lg font-medium flex items-center justify-center gap-2 cursor-not-allowed text-xs mb-2">
                                 <CheckCircle className="w-3 h-3" />
                                 Equity Swapped (Inactive)
                               </div>
                               <button 
                                    onClick={() => setDepositModal({ isOpen: true, property: item })}
                                    className="w-full py-2 bg-indigo-50 text-indigo-700 rounded-lg font-medium hover:bg-indigo-100 transition-colors text-xs flex items-center justify-center gap-1"
                                  >
                                    <DollarSign className="w-3 h-3" /> Deposit to Reactivate
                               </button>
                               </>
                            )}
                            {item.status === 'Listed' && (
                               <div className="w-full py-2 bg-amber-100 text-amber-700 rounded-lg font-medium flex items-center justify-center gap-2 cursor-not-allowed text-xs">
                                 <CheckCircle className="w-3 h-3" />
                                 Listed for Trade
                               </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {(!data.properties || data.properties.length === 0) && (
                      <div className="col-span-full text-center py-12 text-slate-400 italic bg-slate-50 rounded-2xl border border-slate-200 border-dashed">
                        No properties found. Add one to get started.
                      </div>
                    )}
                  </div>

                  {/* Transfer Modal */}
                  <AnimatePresence>
                    {transferModal.isOpen && (
                      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          onClick={() => setTransferModal({ isOpen: false, propertyId: null })}
                          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="relative bg-white w-full max-w-md rounded-2xl shadow-xl p-6"
                        >
                          <h3 className="text-lg font-bold text-slate-900 mb-4">Transfer Property Ownership</h3>
                          <input 
                            type="text" 
                            placeholder="Recipient Address (e.g. G...)" 
                            value={transferAddress}
                            onChange={(e) => setTransferAddress(e.target.value)}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none mb-4"
                          />
                          <div className="flex gap-3">
                            <button 
                              onClick={() => setTransferModal({ isOpen: false, propertyId: null })}
                              className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200"
                            >
                              Cancel
                            </button>
                            <button 
                              onClick={handleTransferProperty}
                              className="flex-1 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700"
                            >
                              Confirm Transfer
                            </button>
                          </div>
                        </motion.div>
                      </div>
                    )}
                  </AnimatePresence>

                  {/* Deposit Modal */}
                  <AnimatePresence>
                    {depositModal.isOpen && depositModal.property && (
                      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          onClick={() => setDepositModal({ isOpen: false, property: null })}
                          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="relative bg-white w-full max-w-md rounded-2xl shadow-xl p-6"
                        >
                          <h3 className="text-lg font-bold text-slate-900 mb-4">Deposit to Property Vault</h3>
                          <p className="text-sm text-slate-500 mb-4">
                            Assets deposited here increase the property's equity value and generate yield.
                            Supported: BTC, ETH, XLM, USDC, USDT, PYUSD.
                          </p>
                          
                          <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">Asset</label>
                                <select 
                                    value={depositCurrency}
                                    onChange={(e) => setDepositCurrency(e.target.value)}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                >
                                    {['USDC', 'USDT', 'PYUSD', 'BTC', 'ETH', 'XLM'].map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">Amount</label>
                                <input 
                                    type="number" 
                                    placeholder="0.00" 
                                    value={depositAmount}
                                    onChange={(e) => setDepositAmount(e.target.value)}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                          </div>

                          <div className="flex gap-3 mt-6">
                            <button 
                              onClick={() => setDepositModal({ isOpen: false, property: null })}
                              className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200"
                            >
                              Cancel
                            </button>
                            <button 
                              onClick={handleDepositVault}
                              className="flex-1 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700"
                            >
                              Confirm Deposit
                            </button>
                          </div>
                        </motion.div>
                      </div>
                    )}
                  </AnimatePresence>

                  {/* Swap Modal */}
                  <AnimatePresence>
                    {swapModal.isOpen && swapModal.property && (
                      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          onClick={() => setSwapModal({ isOpen: false, property: null })}
                          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="relative bg-white w-full max-w-lg rounded-2xl shadow-xl p-6"
                        >
                          <h3 className="text-xl font-bold text-slate-900 mb-2">Swap Property Equity</h3>
                          <p className="text-slate-500 text-sm mb-6">
                            This action will liquidate the property's market cap + vault assets.
                            You will receive 100% of the value minus a $0.01 transaction fee.
                          </p>

                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 space-y-3">
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-500">Total Equity Value:</span>
                              <span className="font-mono font-bold">${(swapModal.property.market_cap + (swapModal.property.equity_balance || 0)).toLocaleString()}</span>
                            </div>
                            <div className="h-px bg-slate-200 my-2" />
                            <div className="grid grid-cols-2 gap-y-2 text-xs">
                              <div className="text-slate-500">Transaction Fee:</div>
                              <div className="text-right font-mono text-red-500">-$0.01</div>
                              
                              <div className="text-indigo-600 font-bold text-lg mt-2">Your Allocation:</div>
                              <div className="text-right font-mono text-indigo-600 font-bold text-lg mt-2">
                                ${(swapModal.property.market_cap + (swapModal.property.equity_balance || 0) - 0.01).toLocaleString()}
                              </div>
                            </div>
                          </div>

                          <div className="mb-6">
                            <label className="block text-sm font-medium text-slate-700 mb-2">Receive Allocation In:</label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto custom-scrollbar p-1">
                              {ASSETS.map(asset => (
                                <button
                                  key={asset.code}
                                  onClick={() => setTargetAsset(asset.code)}
                                  className={`p-2 rounded-lg border text-left flex items-center gap-2 transition-all ${
                                    targetAsset === asset.code 
                                      ? 'bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500' 
                                      : 'bg-white border-slate-200 hover:border-slate-300'
                                  }`}
                                >
                                  <div className={`p-1.5 rounded-md ${targetAsset === asset.code ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>
                                    <asset.icon className="w-4 h-4" />
                                  </div>
                                  <div className="min-w-0">
                                    <div className={`text-xs font-bold truncate ${targetAsset === asset.code ? 'text-indigo-900' : 'text-slate-700'}`}>{asset.code}</div>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="flex gap-3">
                            <button 
                              onClick={() => setSwapModal({ isOpen: false, property: null })}
                              className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200"
                            >
                              Cancel
                            </button>
                            <button 
                              onClick={handleConfirmSwap}
                              disabled={swappingId === swapModal.property.id}
                              className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                              {swappingId === swapModal.property.id ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                              Confirm Swap
                            </button>
                          </div>
                        </motion.div>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              )}

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
