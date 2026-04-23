'use client'
import React, { useState, useEffect } from 'react';
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

const PurchasesPage = () => {
  const [purchases, setPurchases] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({ totalCost: 0, pending: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<any>(null);

  const [form, setForm] = useState({
    item: '',
    category: 'Raw Materials',
    quantity: '',
    unit: 'Units',
    cost: '',
    supplier: '',
    status: 'paid',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [listRes, statsRes] = await Promise.all([
        api.get('/purchases'),
        api.get('/purchases/stats')
      ]);
      setPurchases(listRes.data);
      setStats(statsRes.data);
    } catch (error) {
      toast.error('Could not load purchases');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.put(`/purchases/${editingItem._id}`, form);
        toast.success('Updated');
      } else {
        await api.post('/purchases', form);
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

  const startEdit = (item: any) => {
    setEditingItem(item);
    setForm({
      item: item.item,
      category: item.category,
      quantity: item.quantity || '',
      unit: item.unit || 'Units',
      cost: item.cost.toString(),
      supplier: item.supplier || '',
      status: item.status || 'paid',
      date: new Date(item.date).toISOString().split('T')[0],
      description: item.description || ''
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setForm({
      item: '', category: 'Raw Materials', quantity: '', unit: 'Units', cost: '',
      supplier: '', status: 'paid', date: new Date().toISOString().split('T')[0], description: ''
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
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Purchases</h1>
            <p className="text-sm text-gray-500 mt-1">Track brewery expenses and raw materials</p>
          </div>
          <button
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            New Purchase
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="card bg-white border border-slate-200 p-8 flex items-center justify-between group hover:border-blue-500 transition-all cursor-default">
              <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Shop Entries</p>
                  <h4 className="text-3xl font-black text-slate-900 italic tracking-tighter">{purchases.length}</h4>
              </div>
              <div className="p-4 bg-slate-50 text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-colors rounded-2xl shadow-sm">
                  <ShoppingCart className="w-6 h-6" />
              </div>
          </div>
          <div className="card bg-white border border-slate-200 p-8 flex items-center justify-between group hover:border-emerald-500 transition-all cursor-default">
              <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Active Vendors</p>
                  <h4 className="text-3xl font-black text-slate-900 italic tracking-tighter">
                      {new Set(purchases.map(p => p.supplier).filter(Boolean)).size}
                  </h4>
              </div>
              <div className="p-4 bg-slate-50 text-slate-400 group-hover:bg-emerald-600 group-hover:text-white transition-colors rounded-2xl shadow-sm">
                  <Truck className="w-6 h-6" />
              </div>
          </div>
          <div className="card bg-white border border-slate-200 p-8 flex items-center justify-between group hover:border-amber-500 transition-all cursor-default">
              <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Expense Categorys</p>
                  <h4 className="text-3xl font-black text-slate-900 italic tracking-tighter">
                      {new Set(purchases.map(p => p.category)).size}
                  </h4>
              </div>
              <div className="p-4 bg-slate-50 text-slate-400 group-hover:bg-amber-600 group-hover:text-white transition-colors rounded-2xl shadow-sm">
                  <Package className="w-6 h-6" />
              </div>
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
                {purchases.map(p => (
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
                        p.status === 'paid' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
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
                            <label className="text-xs font-bold text-gray-600">Supplier</label>
                            <input type="text" className="input-field" value={form.supplier} onChange={e => setForm({ ...form, supplier: e.target.value })} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-600">Status</label>
                            <select className="input-field" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                                <option value="paid">Paid</option>
                                <option value="pending">Pending</option>
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
      </main>
    </div>
  );
};

export default PurchasesPage;
