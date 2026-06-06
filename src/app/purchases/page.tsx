'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import api from '@/services/api';
import toast from 'react-hot-toast';
import {
  Plus,
  ShoppingCart,
  Search,
  XCircle,
  TrendingDown,
  Activity,
  Trash2,
  Edit,
  Package,
  Truck,
  IndianRupee
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { motion, AnimatePresence } from 'framer-motion';
import MonthYearFilter from '@/components/MonthYearFilter';

const PurchasesPage = () => {
  const router = useRouter();
  const [purchases, setPurchases] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({ totalCost: 0, pending: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeTab, setActiveTab] = useState<'list' | 'vendors'>('list');
  const [vendors, setVendors] = useState<any[]>([]);
  const [searchVendor, setSearchVendor] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  const filteredPurchases = purchases.filter(p => selectedCategory === 'All' || p.category === selectedCategory);

  const [form, setForm] = useState({
    item: '',
    category: 'Raw Materials',
    quantity: '',
    unit: 'Units',
    cost: '',
    supplier: '',
    partyId: '',
    status: 'Cash',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [listRes, statsRes, vendorRes] = await Promise.all([
        api.get('/purchases', { params: { month: selectedMonth, year: selectedYear } }),
        api.get('/purchases/stats'),
        api.get('/parties')
      ]);
      setPurchases(listRes.data);
      setStats(statsRes.data);
      setVendors(vendorRes.data.filter((p: any) => p.type === 'supplier'));
    } catch (error) {
      toast.error('Could not load data');
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    // On first load, recalculate all vendor balances to fix any corrupted data
    api.get('/parties/recalculate').catch(() => {});
    fetchData();
  }, [selectedMonth, selectedYear]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let payload = { ...form };

      if (!payload.partyId && payload.supplier) {
        // Auto-create vendor if typed manually but not selected from list
        const newParty = await api.post('/parties', { name: payload.supplier, type: 'supplier' });
        payload.partyId = newParty.data._id;
      } else if (!payload.partyId) {
        delete (payload as any).partyId;
      }

      if (editingItem) {
        await api.put(`/purchases/${editingItem._id}`, payload);
        toast.success('Updated');
      } else {
        await api.post('/purchases', payload);
        toast.success('Recorded');
      }
      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error('Save failed');
    }
  };

  const deleteRecord = async (id: string) => {
    if (!confirm('Are you sure you want to delete this record?')) return;
    try {
      await api.delete(`/purchases/${id}`);
      toast.success('Deleted');
      fetchData();
    } catch (error) {
      toast.error('Deletion failed');
    }
  };

  const deleteVendor = async (id: string) => {
    if (!confirm('Are you sure? This will delete the vendor and ALL their transaction history.')) return;
    try {
      await api.delete(`/parties/${id}`);
      toast.success('Vendor deleted');
      fetchData();
    } catch (error) {
      toast.error('Could not delete vendor');
    }
  };

  const startEdit = (item: any) => {
    setEditingItem(item);
    setForm({
      item: item.item,
      category: item.category,
      quantity: item.quantity || '',
      unit: item.unit || 'Units',
      cost: item.cost.toString(),
      supplier: item.supplier || '',
      partyId: item.partyId || '',
      status: item.status || 'Cash',
      date: new Date(item.date).toISOString().split('T')[0],
      description: item.description || ''
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setForm({
      item: '', category: 'Raw Materials', quantity: '', unit: 'Units', cost: '',
      supplier: '', partyId: '', status: 'Cash', date: new Date().toISOString().split('T')[0], description: ''
    });
    setEditingItem(null);
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Purchases</h1>
            <p className="text-sm text-gray-500 mt-1">Track brewery expenses and raw materials</p>
          </div>
          <div className="flex items-center gap-3">
            <MonthYearFilter
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              onFilterChange={(m, y) => { setSelectedMonth(m); setSelectedYear(y); }}
            />
            {activeTab === 'list' && (
              <button
                onClick={() => { resetForm(); setIsModalOpen(true); }}
                className="btn-primary flex items-center gap-2 whitespace-nowrap"
              >
                <Plus className="w-5 h-5" />
                New Purchase
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-white p-1 rounded-xl border border-gray-200 w-fit mb-8 shadow-sm">
          <button
            onClick={() => setActiveTab('list')}
            className={cn(
              "px-6 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2",
              activeTab === 'list' ? "bg-slate-900 text-white shadow-md" : "text-gray-500 hover:bg-slate-50"
            )}
          >
            <Package className="w-4 h-4" />
            Purchase History
          </button>
          <button
            onClick={() => setActiveTab('vendors')}
            className={cn(
              "px-6 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2",
              activeTab === 'vendors' ? "bg-slate-900 text-white shadow-md" : "text-gray-500 hover:bg-slate-50"
            )}
          >
            <Truck className="w-4 h-4" />
            Vendors / Suppliers
          </button>
        </div>

        {activeTab === 'list' ? (
          <>

            <div className="flex flex-col md:flex-row gap-6 mb-12 items-start md:items-center justify-between">
              <div className="card bg-slate-900 border border-slate-800 p-8 flex items-center justify-between group hover:shadow-xl transition-all cursor-default w-full md:w-80 shadow-lg shadow-slate-900/10">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Purchase Cost</p>
                  <h4 className="text-3xl font-black text-white italic tracking-tighter">₹{purchases.reduce((acc, p) => acc + (p.cost || 0), 0).toLocaleString()}</h4>
                </div>
                <div className="p-4 bg-white/10 text-white rounded-2xl shadow-sm group-hover:bg-blue-600 transition-colors">
                  <IndianRupee className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3">
                <Package className="w-4 h-4 text-blue-600" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-transparent text-xs font-black uppercase outline-none cursor-pointer text-gray-700"
                >
                  {['All', 'Raw Materials', 'Bottles', 'Packaging', 'Machinery', 'Other'].map(cat => (
                    <option key={cat} value={cat}>
                      {cat} {cat !== 'All' ? `(₹${purchases.filter(p => p.category === cat).reduce((acc, p) => acc + (p.cost || 0), 0).toLocaleString()})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-10">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/10">
                <h3 className="font-bold text-gray-900">All Purchases</h3>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" placeholder="Search..." className="border border-gray-200 rounded-lg pl-10 pr-4 py-2 text-sm outline-none w-64" />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Item</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4">Supplier</th>
                      <th className="px-6 py-4">Cost</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredPurchases.map(p => (
                      <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-gray-600">{new Date(p.date).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-gray-900">{p.item}</p>
                          <p className="text-xs text-gray-500">{p.quantity} {p.unit}</p>
                        </td>
                        <td className="px-6 py-4 text-xs font-semibold text-gray-500">{p.category}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 font-medium">{p.supplier || 'N/A'}</td>
                        <td className="px-6 py-4 font-bold text-blue-600">₹{p.cost.toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "px-2 py-1 rounded-md text-[10px] font-bold uppercase",
                            p.status === 'Cash' || p.status === 'paid' ? 'bg-green-50 text-green-700' :
                            p.status === 'Online/UPI' ? 'bg-blue-50 text-blue-700' : 'bg-yellow-50 text-yellow-700'
                          )}>{p.status}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => startEdit(p)} className="p-2 text-gray-400 hover:text-blue-600"><Edit className="w-4 h-4" /></button>
                            <button onClick={() => deleteRecord(p._id)} className="p-2 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
              <div className="relative w-full max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search vendors..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm outline-none"
                  value={searchVendor}
                  onChange={e => setSearchVendor(e.target.value)}
                />
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl shadow-blue-900/5 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gradient-to-r from-slate-50 to-white text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-gray-100">
                      <th className="px-8 py-5">Vendor Details</th>
                      <th className="px-8 py-5">Contact</th>
                      <th className="px-8 py-5 text-right">Net Balance</th>
                      <th className="px-8 py-5 text-center">Status</th>
                      <th className="px-8 py-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {vendors.filter(v => v.name.toLowerCase().includes(searchVendor.toLowerCase())).map(v => (
                      <tr 
                        key={v._id} 
                        onClick={() => router.push(`/vendors?id=${v._id}`)}
                        className="group hover:bg-blue-50/50 cursor-pointer transition-all duration-300"
                      >
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center text-blue-600 shadow-sm border border-blue-100/50 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                              <Truck className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="font-black text-slate-900 text-sm tracking-tight group-hover:text-blue-700 transition-colors">{v.name}</h4>
                              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-1">Supplier / Vendor</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <div className="inline-flex items-center px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100 text-xs font-bold text-slate-600 shadow-sm">
                            {v.phone || 'No Contact Info'}
                          </div>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <p className={cn(
                              "text-xl font-black tracking-tighter",
                              (v.balance || 0) >= 0 ? "text-emerald-500" : "text-rose-500"
                          )}>₹{Math.abs(v.balance || 0).toLocaleString()}</p>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">
                            {(v.balance || 0) >= 0 ? ((v.balance || 0) === 0 ? 'Settled' : 'Advance Paid') : 'Amount Payable'}
                          </p>
                        </td>
                        <td className="px-8 py-5 text-center">
                          <span className={cn(
                            "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm border transition-all",
                            (v.balance || 0) >= 0 
                                ? "bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-100/20 group-hover:bg-emerald-100" 
                                : "bg-rose-50 text-rose-600 border-rose-100 shadow-rose-100/20 group-hover:bg-rose-100"
                          )}>
                            <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", (v.balance || 0) >= 0 ? "bg-emerald-500" : "bg-rose-500")} />
                            {(v.balance || 0) >= 0 ? 'Account Clear' : 'Action Required'}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <button 
                            onClick={(e) => { e.stopPropagation(); deleteVendor(v._id); }}
                            className="p-2 text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                            title="Delete Vendor"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {!vendors.length && <tr><td colSpan={4} className="p-16 text-center">
                      <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-slate-50 border border-slate-100 mb-6 shadow-inner">
                        <Truck className="w-8 h-8 text-slate-300" />
                      </div>
                      <h3 className="font-black text-slate-900 text-lg">No Vendors Found</h3>
                      <p className="text-slate-500 text-sm mt-2 font-medium">Add a party or create a new purchase to automatically track vendors.</p>
                    </td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
            <div className="bg-white rounded-xl w-full max-w-lg z-50 relative shadow-xl overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-900">{editingItem ? 'Edit Purchase' : 'New Purchase'}</h2>
                <button onClick={() => setIsModalOpen(false)}><XCircle className="w-6 h-6 text-gray-400" /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-600">Item Name</label>
                    <input type="text" required className="input-field" value={form.item} onChange={e => setForm({ ...form, item: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-600">Category</label>
                    <select className="input-field" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                      <option>Raw Materials</option>
                      <option>Bottles</option>
                      <option>Packaging</option>
                      <option>Machinery</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-600">Qty</label>
                    <input type="text" className="input-field" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-600">Unit</label>
                    <input type="text" className="input-field" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-600 text-blue-600">Total Cost (₹)</label>
                    <input type="number" required className="input-field" value={form.cost} onChange={e => setForm({ ...form, cost: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-600">Supplier / Vendor</label>
                    <input
                      list="vendors-list"
                      type="text"
                      className="input-field"
                      placeholder="Select or type vendor..."
                      value={form.supplier}
                      onChange={e => {
                        const val = e.target.value;
                        const selected = vendors.find(v => v.name === val);
                        setForm({ ...form, supplier: val, partyId: selected ? selected._id : '' });
                      }}
                    />
                    <datalist id="vendors-list">
                      {vendors.map(v => (
                        <option key={v._id} value={v.name} />
                      ))}
                    </datalist>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-600">Status</label>
                    <select className="input-field" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                      <option value="Cash">Cash</option>
                      <option value="Online/UPI">Online / UPI</option>
                      <option value="Due">Due</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-600">Purchase Date</label>
                  <input type="date" className="input-field" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
                </div>
                <button type="submit" className="w-full btn-primary py-3">Save Purchase Record</button>
              </form>
            </div>
          </div>
        )}
        {/* Modals have been removed in favor of dedicated page */}
      </main>
    </div>
  );
};

export default PurchasesPage;
