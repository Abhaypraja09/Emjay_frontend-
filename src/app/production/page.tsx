'use client'
import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import api from '@/services/api';
import toast from 'react-hot-toast';
import { FlaskConical, Plus, Search, Calendar, History, ArrowRight, Package, Edit, Trash2, XCircle } from 'lucide-react';
import { cn } from '@/utils/cn';

const Production = () => {
  const [productions, setProductions] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [bottleStock, setBottleStock] = useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [editingItem, setEditingItem] = useState<any>(null);

  const [form, setForm] = useState({
    juiceType: '',
    quantityProduced: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prodRes, prodTypeRes, bottleRes] = await Promise.all([
        api.get('/production'),
        api.get('/products'),
        api.get('/bottles/stock')
      ]);
      setProductions(prodRes.data);
      setProducts(prodTypeRes.data);
      setBottleStock(bottleRes.data.availableEmptyBottles);
    } catch (error) {
      toast.error('Failed to load production data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem && Number(form.quantityProduced) > bottleStock) {
      return toast.error('Insufficient empty bottles in stock!');
    }
    try {
      if (editingItem) {
        await api.put(`/production/${editingItem._id}`, form);
        toast.success('Production record updated');
      } else {
        await api.post('/production', form);
        toast.success('Production run completed!');
      }
      setIsModalOpen(false);
      setEditingItem(null);
      setForm({ juiceType: '', quantityProduced: '', date: new Date().toISOString().split('T')[0] });
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save production');
    }
  };

  const deleteProduction = async (id: string) => {
    if (!confirm('Are you sure? This will reverse the stock changes (add back empty bottles and deduct juice stock).')) return;
    try {
      setIsDeleting(true);
      await api.delete(`/production/${id}`);
      toast.success('Production reversed and removed');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete production');
    } finally {
      setIsDeleting(false);
    }
  };

  const startEdit = (prod: any) => {
    setEditingItem(prod);
    setForm({
      juiceType: prod.juiceType?._id || '',
      quantityProduced: prod.quantityProduced.toString(),
      date: new Date(prod.date).toISOString().split('T')[0]
    });
    setIsModalOpen(true);
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <Sidebar />
      <main className="flex-1 lg:ml-64 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter italic underline decoration-indigo-500 underline-offset-8">Production Line</h1>
            <p className="text-slate-500 mt-4 font-semibold uppercase tracking-widest text-[10px]">Convert empty bottles into finished product</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="btn-primary flex items-center gap-2 group shadow-xl shadow-indigo-600/20"
          >
            <div className="p-1 rounded bg-white/20 group-hover:bg-white/30 transition-all">
                <Plus className="w-3 h-3 text-white" />
            </div>
            New Production Run
          </button>
        </div>

        {/* Quick View */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="card bg-white border-indigo-200 flex items-center gap-6 p-8 group">
            <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 group-hover:scale-110 transition-transform">
              <Package className="w-8 h-8 text-indigo-600" />
            </div>
            <div>
              <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider">Empty Bottle Pool</p>
              <h2 className="text-3xl font-bold text-slate-900 mt-1">{bottleStock}</h2>
              <p className="text-xs text-indigo-600 mt-1 flex items-center gap-1 italic underline decoration-indigo-200">Available for filling</p>
            </div>
          </div>
          <div className="card bg-white border-emerald-200 flex items-center gap-6 p-8 group">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 group-hover:scale-110 transition-transform">
              <History className="w-8 h-8 text-emerald-600" />
            </div>
            <div>
              <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider">Total Productions</p>
              <h2 className="text-3xl font-bold text-slate-900 mt-1">{productions.length} Runs</h2>
              <p className="text-xs text-emerald-600 mt-1 italic underline decoration-emerald-200 font-medium tracking-tight">Across all juice types</p>
            </div>
          </div>
        </div>

        {/* History Table */}
          <div className="card !p-0 border-slate-200 shadow-sm overflow-hidden flex-1">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h3 className="font-black text-slate-900 uppercase tracking-tight italic">Production History</h3>
              <div className="flex gap-3">
                 <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" placeholder="Search batches..." className="bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                 </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-black tracking-widest h-12">
                  <tr>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Juice Type</th>
                    <th className="px-6 py-4">Quantity</th>
                    <th className="px-6 py-4">Stock Impact</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  {productions.map((prod) => (
                    <tr key={prod._id} className="hover:bg-slate-50/50 transition-all font-medium">
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-1.5 text-[10px] text-emerald-600 font-black uppercase">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                          Completed
                        </span>
                      </td>
                      <td className="px-6 py-4">{new Date(prod.date).toLocaleDateString()}</td>
                      <td className="px-6 py-4 font-black text-slate-800 uppercase tracking-tight">{prod.juiceType?.name}</td>
                      <td className="px-6 py-4">
                        <span className="font-black text-slate-900">{prod.quantityProduced}</span>
                        <span className="text-[10px] text-slate-500 ml-1 uppercase font-bold">bottles</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                          <ArrowRight className="w-3 h-3 rotate-[-45deg]" />
                          Added
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => startEdit(prod)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-indigo-600 transition-all"><Edit className="w-3.5 h-3.5" /></button>
                          <button onClick={() => deleteProduction(prod._id)} className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/80 backdrop-blur-md animate-in fade-in" onClick={() => setIsModalOpen(false)}></div>
            <div className="card w-full max-w-lg z-[110] relative animate-in zoom-in duration-300 border-indigo-100 shadow-2xl bg-white">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-indigo-50 border border-indigo-100 shadow-sm transition-all">
                    <FlaskConical className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tighter italic">{editingItem ? 'Edit Production' : 'New Batch Run'}</h2>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Batch Tracking Module</p>
                  </div>
                </div>
                <button onClick={() => { setIsModalOpen(false); setEditingItem(null); }} className="text-slate-400 hover:text-slate-900 transition-all"><XCircle className="w-6 h-6" /></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Target Juice Variant</label>
                    <select 
                      required 
                      className="input-field appearance-none"
                      value={form.juiceType}
                      onChange={(e) => setForm({...form, juiceType: e.target.value})}
                    >
                      <option value="">Select a variant...</option>
                      {products.map(p => (
                        <option key={p._id} value={p._id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Production Date</label>
                    <input 
                      type="date" required
                      className="input-field"
                      value={form.date}
                      onChange={(e) => setForm({...form, date: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Batch Volume (Units)</label>
                    <span className={cn(
                        "text-[10px] font-black uppercase px-2 py-1 rounded-full",
                        bottleStock >= Number(form.quantityProduced) ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-rose-50 text-rose-600 border border-rose-100 animate-bounce"
                    )}>
                        Available Bottles: {bottleStock}
                    </span>
                  </div>
                  <div className="relative">
                    <Package className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                        type="number" required
                        className={cn(
                            "input-field pl-12 h-14 text-xl font-black italic",
                            Number(form.quantityProduced) > bottleStock && "border-rose-500 ring-rose-500/20"
                        )}
                        placeholder="e.g. 50"
                        value={form.quantityProduced}
                        onChange={(e) => setForm({...form, quantityProduced: e.target.value})}
                    />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase text-indigo-900">
                        <span>Transaction Summary</span>
                        <History className="w-3 h-3" />
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                        This operation will deduct <span className="font-black text-indigo-600">{form.quantityProduced || 0}</span> from empty bottle stock and add to finished juice inventory.
                    </p>
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => { setIsModalOpen(false); setEditingItem(null); }} className="flex-1 px-4 py-3 border border-slate-200 rounded-xl hover:bg-slate-100 transition-all font-black text-xs uppercase tracking-widest text-slate-500">Discard</button>
                  <button type="submit" className="flex-[2] btn-primary shadow-xl shadow-indigo-600/20 font-black text-xs uppercase tracking-widest" disabled={!editingItem && Number(form.quantityProduced) > bottleStock}>
                    {editingItem ? 'Update Batch' : 'Confirm & Finalize Run'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Production;
