'use client'
import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import api from '@/services/api';
import toast from 'react-hot-toast';
import { 
  Plus, 
  Trash2, 
  History,
  Package,
  XCircle,
  Truck,
  IndianRupee,
  ClipboardList,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronDown,
  Warehouse
} from 'lucide-react';
import Link from 'next/link';

import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';
import MonthYearFilter from '@/components/MonthYearFilter';

const Bottles = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'purchases' | 'ledger'>('ledger');

  const [ledgerData, setLedgerData] = useState<any[]>([]);
  const [bottleTypeFilter, setBottleTypeFilter] = useState('Bottles');
  const [ledgerLoading, setLedgerLoading] = useState(false);

  const [items, setItems] = useState([{
    bottleType: 'New',
    quantity: '',
    pricePerUnit: '',
    totalCost: 0
  }]);

  const [form, setForm] = useState({
    supplier: '',
    date: new Date().toISOString().split('T')[0]
  });

  const addItem = () => {
    setItems([...items, { bottleType: 'New', quantity: '', pricePerUnit: '', totalCost: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    if (field === 'quantity' || field === 'pricePerUnit') {
        newItems[index].totalCost = Number(newItems[index].quantity) * Number(newItems[index].pricePerUnit);
    }
    setItems(newItems);
  };

  const fetchData = async () => {
    try {
      const res = await api.get('/bottles/stock', { params: { month: selectedMonth, year: selectedYear } });
      setData(res.data);
    } catch (error) {
      toast.error('Could not load bottle data');
    } finally {
      setLoading(false);
    }
  };

  const fetchLedger = async () => {
      setLedgerLoading(true);
      try {
          const res = await api.get('/reports/bottle-stock', {
              params: { bottleType: bottleTypeFilter, month: selectedMonth, year: selectedYear }
          });
          const sorted = res.data.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
          setLedgerData(sorted);
      } catch (error) {
          toast.error('Failed to load bottle ledger');
      } finally {
          setLedgerLoading(false);
      }
  };

  useEffect(() => {
    fetchData();
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    if (activeTab === 'ledger') {
        fetchLedger();
    }
  }, [activeTab, bottleTypeFilter, selectedMonth, selectedYear]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Send all items in one request
      await api.post('/bottles/purchase', {
          items: items.map(item => ({
              ...item,
              quantity: Number(item.quantity),
              pricePerUnit: Number(item.pricePerUnit),
              totalCost: Number(item.quantity) * Number(item.pricePerUnit)
          })),
          supplierName: form.supplier,
          date: form.date
      });

      toast.success('Purchases recorded');
      setIsModalOpen(false);
      setItems([{ bottleType: 'New', quantity: '', pricePerUnit: '', totalCost: 0 }]);
      setForm({ supplier: '', date: new Date().toISOString().split('T')[0] });
      fetchData();
      if (activeTab === 'ledger') fetchLedger();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to record purchase');
    }
  };

  if (loading) return (
    <div className="flex h-screen bg-gray-50 items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 lg:ml-64 p-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
           <div>
              <h1 className="text-2xl font-bold text-gray-900">Empty Bottle Management</h1>
              <p className="text-sm text-gray-500 mt-1">Track purchasing and production usage</p>
           </div>
            <div className="flex flex-col md:flex-row items-center gap-4">
                <MonthYearFilter 
                    selectedMonth={selectedMonth} 
                    selectedYear={selectedYear} 
                    onFilterChange={(m, y) => { setSelectedMonth(m); setSelectedYear(y); }} 
                />
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
                >
                    <Plus className="w-5 h-5" />
                    Record Purchase
                </button>
            </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
            <div className="card bg-white border border-gray-200 p-6 flex flex-col justify-between hover:shadow-xl transition-all group">
                <div>
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Buy Bottles</p>
                   <h3 className="text-2xl font-black text-gray-900 italic tracking-tighter">{data?.totalPurchased || 0}</h3>
                </div>
                <div className="flex justify-end">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors"><Truck className="w-5 h-5" /></div>
                </div>
            </div>
            
            <div className="card bg-white border border-gray-200 p-6 flex flex-col justify-between hover:shadow-xl transition-all group">
                <div>
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Production</p>
                   <h3 className="text-2xl font-black text-gray-900 italic tracking-tighter">{data?.totalUsed || 0}</h3>
                </div>
                <div className="flex justify-end">
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors"><ArrowUpRight className="w-5 h-5" /></div>
                </div>
            </div>

            <div className="card bg-white border border-gray-200 p-6 flex flex-col justify-between hover:shadow-xl transition-all group">
                <div>
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Empty Bottles</p>
                   <h3 className="text-2xl font-black text-blue-600 italic tracking-tighter">{data?.availableEmptyBottles || 0}</h3>
                </div>
                <div className="flex justify-end">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors"><Package className="w-5 h-5" /></div>
                </div>
            </div>

            <div className="card bg-slate-900 border border-slate-800 p-6 flex flex-col justify-between hover:shadow-xl transition-all group relative overflow-hidden">
                <div className="z-10">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Caps Inventory</p>
                   <h3 className="text-2xl font-black text-white italic tracking-tighter">{data?.availableCaps || 0}</h3>
                </div>
                <div className="flex justify-end z-10">
                    <div className="p-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"><ClipboardList className="w-5 h-5" /></div>
                </div>
                <div className="absolute -right-4 -bottom-4 opacity-10 rotate-12 scale-150">
                     <Package className="w-24 h-24 text-white" />
                </div>
            </div>
        </div>

        {/* Section Tabs */}
        <div className="flex bg-white p-1 rounded-xl border border-gray-200 w-fit mb-6 shadow-sm">
            <button 
                onClick={() => setActiveTab('ledger')}
                className={cn(
                    "px-6 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2",
                    activeTab === 'ledger' ? "bg-slate-900 text-white shadow-md" : "text-gray-500 hover:bg-slate-50"
                )}
            >
                <ClipboardList className="w-4 h-4" />
                Stock Flow Report
            </button>
            <button 
                onClick={() => setActiveTab('purchases')}
                className={cn(
                    "px-6 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2",
                    activeTab === 'purchases' ? "bg-slate-900 text-white shadow-md" : "text-gray-500 hover:bg-slate-50"
                )}
            >
                <Truck className="w-4 h-4" />
                Purchase History
            </button>
        </div>

        {activeTab === 'purchases' ? (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-10">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/10">
                    <h3 className="font-bold text-gray-900 underline decoration-indigo-500 underline-offset-4">Recent Procurements</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500 text-[10px] font-black uppercase tracking-widest border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Variant</th>
                                <th className="px-6 py-4">Supplier Entity</th>
                                <th className="px-6 py-4 text-center">Batch Quantity</th>
                                <th className="px-6 py-4 text-right">Investment</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {data?.history?.map((h: any, i: number) => (
                                <tr key={i} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-5 text-xs text-gray-600 font-bold">
                                        {new Date(h.date).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={cn(
                                            "px-2.5 py-1 rounded text-[10px] font-black uppercase ring-1 shadow-sm",
                                            h.bottleType === 'New' || h.bottleType === 'Old' ? 'bg-blue-50 text-blue-600 ring-blue-100' : 'bg-orange-50 text-orange-600 ring-orange-100'
                                        )}>{h.bottleType}</span>
                                    </td>
                                    <td className="px-6 py-5 text-sm text-gray-900 font-black italic">{h.supplierName || 'N/A'}</td>
                                    <td className="px-6 py-5 text-center font-black text-gray-800 tracking-tighter">{h.quantity} units</td>
                                    <td className="px-6 py-5 text-right font-black text-blue-600">₹{(h.quantity * h.costPerUnit).toLocaleString()}</td>
                                </tr>
                            ))}
                            {!data?.history?.length && <tr><td colSpan={5} className="p-12 text-center text-gray-400">No purchase records found.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        ) : (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div className="flex bg-white border border-gray-200 p-1 rounded-xl shadow-sm">
                        <button 
                            onClick={() => setBottleTypeFilter('Bottles')}
                            className={cn("px-4 py-1.5 rounded-lg text-xs font-bold transition-all", bottleTypeFilter === 'Bottles' ? "bg-blue-600 text-white shadow-md" : "text-gray-500")}
                        >Bottles</button>
                        <button 
                            onClick={() => setBottleTypeFilter('Caps')}
                            className={cn("px-4 py-1.5 rounded-lg text-xs font-bold transition-all", bottleTypeFilter === 'Caps' ? "bg-blue-600 text-white shadow-md" : "text-gray-500")}
                        >Caps</button>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-slate-50/50">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-600 rounded-lg text-white">
                                <Warehouse className="w-4 h-4" />
                            </div>
                            <h3 className="font-bold text-gray-900 uppercase text-sm tracking-tight italic">Daily Stock Flow Ledger</h3>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-widest border-b border-gray-100">
                                <tr>
                                    <th className="px-8 py-4">Transaction Date</th>
                                    <th className="px-8 py-4 text-center">Opening</th>
                                    <th className="px-8 py-4 text-center text-blue-600">Buy (+)</th>
                                    <th className="px-8 py-4 text-center text-red-600">Used (-)</th>
                                    <th className="px-8 py-4 text-center">Closing Balance</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {ledgerLoading ? (
                                    <tr><td colSpan={5} className="p-12 text-center text-gray-400 font-bold animate-pulse text-[10px] tracking-widest uppercase">Calculating Metrics...</td></tr>
                                ) : ledgerData.length === 0 ? (
                                    <tr><td colSpan={5} className="p-12 text-center text-gray-400 text-sm">No inventory flow recorded for this type.</td></tr>
                                ) : (
                                    ledgerData.map((row, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                                            <td className="px-8 py-5">
                                                <p className="font-black text-gray-800 text-xs italic">{row.date}</p>
                                            </td>
                                            <td className="px-8 py-5 text-center font-bold text-gray-400 text-xs">{row.openingStock}</td>
                                            <td className="px-8 py-5 text-center">
                                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-blue-50 text-blue-700 font-black text-[11px]">
                                                    <ArrowUpRight className="w-3 h-3" />
                                                    +{row.buy}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-center">
                                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-red-50 text-red-700 font-black text-[11px]">
                                                    <ArrowDownLeft className="w-3 h-3" />
                                                    -{row.used}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-center">
                                                <span className="px-5 py-1.5 bg-slate-900 text-white rounded-lg font-black italic text-[11px] shadow-sm tracking-tighter">
                                                    {row.closingStock}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )}

        <AnimatePresence>
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                    <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-xl w-full max-w-2xl z-50 relative shadow-xl overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-gray-900">Record Procurement</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><XCircle className="w-6 h-6" /></button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-600 uppercase tracking-widest">Supplier Name</label>
                                    <input type="text" className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm w-full" placeholder="ABC Bottles Ltd." value={form.supplier} onChange={e => setForm({...form, supplier: e.target.value})} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-600 uppercase tracking-widest">Date</label>
                                    <input type="date" required className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm w-full" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-tight">Items</h3>
                                    <button type="button" onClick={addItem} className="text-blue-600 text-xs font-bold flex items-center gap-1 hover:underline">
                                        <Plus className="w-4 h-4" /> Add Item
                                    </button>
                                </div>
                                {items.map((item, idx) => (
                                    <div key={idx} className="grid grid-cols-12 gap-3 items-end bg-gray-50 p-4 rounded-xl border border-gray-100">
                                          <div className="col-span-4 space-y-1">
                                              <label className="text-[10px] font-bold text-gray-400 uppercase">Variant</label>
                                              <select className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs w-full" value={item.bottleType} onChange={e => updateItem(idx, 'bottleType', e.target.value)}>
                                                  <option value="New">New Bottles</option>
                                                  <option value="Old">Old Bottles</option>
                                                  <option value="Caps">Bottle Caps</option>
                                              </select>
                                          </div>
                                        <div className="col-span-3 space-y-1">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase">Qty</label>
                                            <input type="number" required className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs w-full" value={item.quantity} onChange={e => updateItem(idx, 'quantity', e.target.value)} />
                                        </div>
                                        <div className="col-span-3 space-y-1">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase">Rate (₹)</label>
                                            <input type="number" step="0.01" required className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs w-full" value={item.pricePerUnit} onChange={e => updateItem(idx, 'pricePerUnit', e.target.value)} />
                                        </div>
                                        <div className="col-span-2 flex justify-end">
                                            {items.length > 1 && (
                                                <button type="button" onClick={() => removeItem(idx)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Gross Commitment</p>
                                    <p className="text-2xl font-black text-indigo-600 italic tracking-tighter">₹{items.reduce((acc, item) => acc + (Number(item.quantity) * Number(item.pricePerUnit)), 0).toLocaleString()}</p>
                                </div>
                                <button type="submit" className="bg-blue-600 text-white py-3 px-8 rounded-lg font-bold shadow-lg shadow-indigo-600/20">Authorize Purchase</button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Bottles;
