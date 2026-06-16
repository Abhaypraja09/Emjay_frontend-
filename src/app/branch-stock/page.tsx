'use client'
import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import api from '@/services/api';
import toast from 'react-hot-toast';
import { Package, Plus, Send, Activity, User, ArrowRightLeft, ArrowUpRight, XCircle, Settings, Trash2, PencilLine } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';
import MonthYearFilter from '@/components/MonthYearFilter';

const BranchStock = () => {
  const [stocks, setStocks] = useState<any[]>([]);
  const [transfers, setTransfers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [parties, setParties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isTransferOutOpen, setIsTransferOutOpen] = useState(false);
  const [isCreateBranchOpen, setIsCreateBranchOpen] = useState(false);
  const [isManageWholesalersOpen, setIsManageWholesalersOpen] = useState(false);
  const [editingPartyId, setEditingPartyId] = useState<string | null>(null);
  
  const [branchForm, setBranchForm] = useState({
    name: '', contactPerson: '', phone: '', address: ''
  });

  const [form, setForm] = useState({
    partyId: '',
    juiceType: '',
    quantity: '',
    rate: '',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchData();
  }, [selectedMonth, selectedYear]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [branchRes, prodRes, partyRes] = await Promise.all([
        api.get(`/branch-stock?month=${selectedMonth}&year=${selectedYear}`),
        api.get('/products'),
        api.get('/parties')
      ]);
      setStocks(branchRes.data.stocks);
      setTransfers(branchRes.data.transfers);
      setProducts(prodRes.data);
      setParties(partyRes.data.filter((p: any) => p.type?.toLowerCase() === 'customer'));
    } catch (error) {
      toast.error('Data loading failed');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      partyId: '',
      juiceType: '',
      quantity: '',
      rate: '',
      date: new Date().toISOString().split('T')[0],
      description: ''
    });
  };



  const handleTransferOut = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/branch-stock/transfer-out', {
        ...form,
        quantity: Number(form.quantity),
        rate: Number(form.rate)
      });
      toast.success('Sale Recorded successfully!');
      setIsTransferOutOpen(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error occurred');
    }
  };

  const handleCreateBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPartyId) {
        await api.put(`/parties/${editingPartyId}`, {
          name: branchForm.name,
          contactPerson: branchForm.contactPerson,
          phone: branchForm.phone,
          address: branchForm.address,
        });
        toast.success('Wholesaler updated!');
      } else {
        await api.post('/parties', {
          name: branchForm.name,
          contactPerson: branchForm.contactPerson,
          phone: branchForm.phone,
          type: 'customer',
          address: branchForm.address,
          openingBalance: 0,
          balanceType: 'Dr'
        });
        toast.success('Branch / Wholesaler created!');
      }
      setIsCreateBranchOpen(false);
      setEditingPartyId(null);
      setBranchForm({ name: '', contactPerson: '', phone: '', address: '' });
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save branch');
    }
  };

  const handleDeleteParty = async (id: string) => {
    if (!confirm('Are you sure you want to delete this wholesaler?')) return;
    try {
      await api.delete(`/parties/${id}`);
      toast.success('Wholesaler deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete wholesaler');
    }
  };

  const openEditModal = (party: any) => {
    setBranchForm({
      name: party.name,
      contactPerson: party.contactPerson || '',
      phone: party.phone || '',
      address: party.address || ''
    });
    setEditingPartyId(party._id);
    setIsManageWholesalersOpen(false);
    setIsCreateBranchOpen(true);
  };

  if (loading) return (
    <div className="flex h-screen bg-gray-50 items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50/50">
      <Sidebar />
      
      <main className="flex-1 lg:ml-64 overflow-y-auto p-8 lg:p-12">
        <div className="max-w-6xl mx-auto space-y-8">
          
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">Wholesaler Stock</h1>
              <p className="text-sm font-bold text-gray-400 mt-1 uppercase tracking-wider">Manage Godowns & Consignments</p>
            </div>
            <div className="flex gap-4">
              <MonthYearFilter 
                selectedMonth={selectedMonth} 
                selectedYear={selectedYear} 
                onFilterChange={(m, y) => { setSelectedMonth(m); setSelectedYear(y); }} 
              />
              <button onClick={() => setIsManageWholesalersOpen(true)} className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-6 py-3 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-sm">
                <Settings className="w-5 h-5 text-gray-500" /> Manage
              </button>
              <button onClick={() => { setEditingPartyId(null); setBranchForm({ name: '', contactPerson: '', phone: '', address: '' }); setIsCreateBranchOpen(true); }} className="flex items-center gap-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all shadow-sm">
                <Plus className="w-5 h-5" /> New Wholesaler
              </button>
              <button onClick={() => setIsTransferOutOpen(true)} className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-600/20">
                <ArrowUpRight className="w-5 h-5" /> Record Sale (OUT)
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
             <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-sm font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                   <Package className="w-4 h-4" /> Current Stock at Wholesalers
                </h2>
             </div>
             <div className="overflow-x-auto">
                 <table className="w-full text-left">
                     <thead className="bg-white">
                         <tr>
                             <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Wholesaler / Party</th>
                             <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Product</th>
                             <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Available Stock</th>
                         </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-50">
                         {stocks.length > 0 ? stocks.map((s, i) => (
                             <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                                 <td className="px-6 py-4">
                                     <div className="flex items-center gap-3">
                                         <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                                             <User className="w-4 h-4 text-blue-600" />
                                         </div>
                                         <span className="font-bold text-gray-900">{s.partyId?.name}</span>
                                     </div>
                                 </td>
                                 <td className="px-6 py-4 text-sm font-bold text-gray-600">
                                     {s.juiceType?.name}
                                 </td>
                                 <td className="px-6 py-4 text-right">
                                     <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-black text-sm">
                                         {s.quantity}
                                     </span>
                                 </td>
                             </tr>
                         )) : (
                             <tr><td colSpan={3} className="p-12 text-center text-gray-400 font-bold">No stock at any wholesaler</td></tr>
                         )}
                     </tbody>
                 </table>
             </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mt-8">
             <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-sm font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                   <Activity className="w-4 h-4" /> Recent Transfers
                </h2>
             </div>
             <div className="overflow-x-auto">
                 <table className="w-full text-left">
                     <thead className="bg-white">
                         <tr>
                             <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                             <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Type</th>
                             <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Wholesaler</th>
                             <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Product</th>
                             <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Qty</th>
                         </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-50">
                         {transfers.length > 0 ? transfers.map((t, i) => (
                             <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                                 <td className="px-6 py-4 text-sm font-bold text-gray-500">
                                     {new Date(t.date).toLocaleDateString()}
                                 </td>
                                 <td className="px-6 py-4">
                                     <span className={cn(
                                         "text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md",
                                         t.type === 'IN' ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                                     )}>
                                         {t.type === 'IN' ? 'Transfer IN' : 'Sale OUT'}
                                     </span>
                                 </td>
                                 <td className="px-6 py-4 text-sm font-bold text-gray-800">
                                     {t.partyId?.name}
                                 </td>
                                 <td className="px-6 py-4 text-sm font-bold text-gray-600">
                                     {t.juiceType?.name}
                                 </td>
                                 <td className="px-6 py-4 text-right text-sm font-black text-gray-900">
                                     {t.quantity}
                                 </td>
                             </tr>
                         )) : (
                             <tr><td colSpan={5} className="p-12 text-center text-gray-400 font-bold">No recent transfers</td></tr>
                         )}
                     </tbody>
                 </table>
             </div>
          </div>

        </div>

        {/* Transfer IN Modal */}
        <AnimatePresence>
            {isManageWholesalersOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/50" onClick={() => setIsManageWholesalersOpen(false)} />
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 30 }}
                        className="bg-white rounded-2xl w-full max-w-3xl z-50 relative shadow-2xl overflow-hidden"
                    >
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                                <Settings className="w-6 h-6 text-gray-700" /> Manage Wholesalers
                            </h2>
                            <button onClick={() => setIsManageWholesalersOpen(false)} className="text-gray-400 hover:text-gray-600"><XCircle className="w-6 h-6" /></button>
                        </div>
                        <div className="p-0 max-h-[60vh] overflow-y-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 sticky top-0">
                                    <tr>
                                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Name</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Contact</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {parties.map(p => (
                                        <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-gray-900">{p.name}</p>
                                                <p className="text-xs text-gray-400">{p.address || 'No Address'}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-gray-700 text-sm">{p.contactPerson || 'N/A'}</p>
                                                <p className="text-xs text-gray-400">{p.phone || 'N/A'}</p>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => openEditModal(p)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                                        <PencilLine className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => handleDeleteParty(p._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {parties.length === 0 && (
                                        <tr><td colSpan={3} className="p-8 text-center text-gray-400 font-bold">No wholesalers found</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                </div>
            )}

            {isCreateBranchOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/50" onClick={() => setIsCreateBranchOpen(false)} />
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 30 }}
                        className="bg-white rounded-2xl w-full max-w-lg z-50 relative shadow-2xl overflow-hidden"
                    >
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                                <Plus className="w-6 h-6 text-gray-700" /> New Wholesaler
                            </h2>
                            <button onClick={() => setIsCreateBranchOpen(false)} className="text-gray-400 hover:text-gray-600"><XCircle className="w-6 h-6" /></button>
                        </div>
                        <form onSubmit={handleCreateBranch} className="p-6 space-y-5">
                            <div className="space-y-1">
                                <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Wholesaler Name</label>
                                <input type="text" required className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-800" value={branchForm.name} onChange={e => setBranchForm({...branchForm, name: e.target.value})} placeholder="E.g., Sharma Distributors" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Contact Person</label>
                                    <input type="text" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-800" value={branchForm.contactPerson} onChange={e => setBranchForm({...branchForm, contactPerson: e.target.value})} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Phone</label>
                                    <input type="text" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-800" value={branchForm.phone} onChange={e => setBranchForm({...branchForm, phone: e.target.value})} />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Address</label>
                                <input type="text" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-800" value={branchForm.address} onChange={e => setBranchForm({...branchForm, address: e.target.value})} />
                            </div>
                            <button type="submit" className="w-full bg-gray-900 text-white py-4 rounded-xl text-sm font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg">
                                {editingPartyId ? 'Save Changes' : 'Create Wholesaler'}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}


            {isTransferOutOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/50" onClick={() => setIsTransferOutOpen(false)} />
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 30 }}
                        className="bg-white rounded-2xl w-full max-w-lg z-50 relative shadow-2xl overflow-hidden"
                    >
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                                <ArrowUpRight className="w-6 h-6 text-red-500" /> Record Sale (OUT)
                            </h2>
                            <button onClick={() => setIsTransferOutOpen(false)} className="text-gray-400 hover:text-gray-600"><XCircle className="w-6 h-6" /></button>
                        </div>
                        <form onSubmit={handleTransferOut} className="p-6 space-y-5">
                            <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 mb-4">
                                <p className="text-xs font-bold text-blue-600 leading-relaxed">
                                    Recording a sale here will reduce the stock at the wholesaler and create an unpaid bill in their ledger for the given Rate.
                                </p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Select Wholesaler / Party</label>
                                <select required className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-800" value={form.partyId} onChange={e => setForm({...form, partyId: e.target.value})}>
                                    <option value="">Select Wholesaler...</option>
                                    {parties.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Select Product</label>
                                <select required className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-800" value={form.juiceType} onChange={e => setForm({...form, juiceType: e.target.value})}>
                                    <option value="">Select Product...</option>
                                    {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Qty Sold</label>
                                    <input type="number" required className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-800" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Rate (₹)</label>
                                    <input type="number" required className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-800" value={form.rate} onChange={e => setForm({...form, rate: e.target.value})} />
                                </div>
                            </div>
                            <button type="submit" className="w-full bg-red-600 text-white py-4 rounded-xl text-sm font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-600/20">
                                Confirm Sale
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>

      </main>
    </div>
  );
};

export default BranchStock;
