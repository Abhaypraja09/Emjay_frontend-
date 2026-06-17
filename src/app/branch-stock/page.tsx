'use client'
import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import api from '@/services/api';
import toast from 'react-hot-toast';
import { Package, Plus, Send, Activity, User, ArrowUpRight, XCircle, Settings, Trash2, PencilLine, Store, FlaskConical, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';
import MonthYearFilter from '@/components/MonthYearFilter';

const BranchStock = () => {
  const [stocks, setStocks] = useState<any[]>([]);
  const [transfers, setTransfers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [parties, setParties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedBranch, setSelectedBranch] = useState<string>('');

  const [isTransferInOpen, setIsTransferInOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const [isCreateBranchOpen, setIsCreateBranchOpen] = useState(false);
  const [isManageWholesalersOpen, setIsManageWholesalersOpen] = useState(false);
  const [editingPartyId, setEditingPartyId] = useState<string | null>(null);
  
  const [branchForm, setBranchForm] = useState({
    name: '', contactPerson: '', phone: '', address: ''
  });

  const [form, setForm] = useState({
    quantity: '',
    date: new Date().toISOString().split('T')[0],
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
      
      const branches = partyRes.data.filter((p: any) => p.isBranch === true || (p.type?.toLowerCase() === 'customer' && p.name.toLowerCase().includes('branch')));
      setParties(branches);
      
      if (branches.length > 0 && !selectedBranch) {
        setSelectedBranch(branches[0]._id);
      }
    } catch (error) {
      toast.error('Data loading failed');
    } finally {
      setLoading(false);
    }
  };

  const handleTransferIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBranch || !selectedProduct) return;
    
    try {
      await api.post('/branch-stock/transfer-in', {
        partyId: selectedBranch,
        juiceType: selectedProduct._id,
        quantity: Number(form.quantity),
        rate: 0, // Internal transfer
        date: form.date,
        description: `Transfer from Production`
      });
      toast.success('Stock Transferred to Branch!');
      setIsTransferInOpen(false);
      setForm({ quantity: '', date: new Date().toISOString().split('T')[0] });
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
        toast.success('Branch updated!');
      } else {
        await api.post('/parties', {
          name: branchForm.name,
          contactPerson: branchForm.contactPerson,
          phone: branchForm.phone,
          type: 'customer',
          isBranch: true,
          address: branchForm.address,
          openingBalance: 0,
          balanceType: 'Dr'
        });
        toast.success('Branch created!');
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
    if (!confirm('Are you sure you want to delete this branch?')) return;
    try {
      await api.delete(`/parties/${id}`);
      toast.success('Branch deleted');
      if (selectedBranch === id) setSelectedBranch('');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete branch');
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

  const getStockForProduct = (productId: string) => {
    if (!selectedBranch) return 0;
    const stockRecord = stocks.find(s => s.partyId?._id === selectedBranch && s.juiceType?._id === productId);
    return stockRecord ? stockRecord.quantity : 0;
  };

  if (loading) return (
    <div className="flex h-screen bg-gray-50 items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50/50">
      <Sidebar />
      
      <main className="flex-1 lg:ml-64 overflow-y-auto p-6 md:p-10">
        <div className="max-w-7xl mx-auto space-y-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">Branch Stock</h1>
              <p className="text-sm font-bold text-gray-400 mt-1 uppercase tracking-wider">Manage Godowns & Consignments</p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <MonthYearFilter 
                selectedMonth={selectedMonth} 
                selectedYear={selectedYear} 
                onFilterChange={(m, y) => { setSelectedMonth(m); setSelectedYear(y); }} 
              />
              <button onClick={() => setIsManageWholesalersOpen(true)} className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-6 py-3 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-sm text-sm">
                <Settings className="w-4 h-4 text-gray-500" /> Manage Branches
              </button>
              <button onClick={() => { setEditingPartyId(null); setBranchForm({ name: '', contactPerson: '', phone: '', address: '' }); setIsCreateBranchOpen(true); }} className="flex items-center gap-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all shadow-sm text-sm">
                <Plus className="w-4 h-4" /> New Branch
              </button>
            </div>
          </div>

          {/* Branch Selector */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Store className="w-6 h-6" />
            </div>
            <div className="flex-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Select Branch / Wholesaler</label>
                <select 
                    value={selectedBranch} 
                    onChange={e => setSelectedBranch(e.target.value)}
                    className="w-full md:w-96 bg-transparent border-none text-xl font-bold text-gray-900 focus:ring-0 p-0 cursor-pointer"
                >
                    <option value="" disabled>Select a branch...</option>
                    {parties.map(p => (
                        <option key={p._id} value={p._id}>{p.name}</option>
                    ))}
                </select>
            </div>
          </div>

          {selectedBranch ? (
              <div className="space-y-8">
                  {/* Products Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                      {products.map(p => {
                          const stock = getStockForProduct(p._id);
                          return (
                          <div key={p._id} className="group bg-white p-4 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all relative flex flex-col justify-between min-h-[140px]">
                              <div className="flex justify-between items-start mb-4">
                                  <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                                      <FlaskConical className="w-5 h-5" />
                                  </div>
                                  <div className="text-right">
                                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Main Stock</p>
                                      <p className="text-xs font-bold text-gray-600">{p.currentStock || 0}</p>
                                  </div>
                              </div>
                              
                              <div>
                                  <p className="text-sm font-bold text-gray-800 line-clamp-1 mb-1">{p.name}</p>
                                  <div className="flex items-baseline gap-2">
                                      <h3 className={cn("text-3xl font-black tracking-tight", stock < 0 ? "text-red-600" : "text-emerald-600")}>
                                          {stock}
                                      </h3>
                                      <span className="text-[10px] font-bold text-gray-400 uppercase">In Branch</span>
                                  </div>
                              </div>

                              {/* Hover Action */}
                              <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-2xl opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center p-4">
                                  <button 
                                    onClick={() => { setSelectedProduct(p); setIsTransferInOpen(true); }}
                                    className="bg-blue-600 text-white w-full py-3 rounded-xl font-bold shadow-lg shadow-blue-600/20 text-sm flex items-center justify-center gap-2 active:scale-95 transition-all"
                                  >
                                      <Plus className="w-4 h-4" /> Add Stock
                                  </button>
                              </div>
                          </div>
                      )})}
                  </div>

                  {/* Ledger / Transfers for Selected Branch */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mt-8">
                     <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                        <h2 className="text-sm font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                           <Activity className="w-4 h-4" /> Recent Transfers & Sales
                        </h2>
                     </div>
                     <div className="overflow-x-auto">
                         <table className="w-full text-left">
                             <thead className="bg-white border-b border-gray-100">
                                 <tr>
                                     <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                                     <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Details / Type</th>
                                     <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Product</th>
                                     <th className="px-6 py-4 text-[10px] font-black text-blue-500 uppercase tracking-widest text-center">IN (+)</th>
                                     <th className="px-6 py-4 text-[10px] font-black text-red-500 uppercase tracking-widest text-center">OUT (-)</th>
                                 </tr>
                             </thead>
                             <tbody className="divide-y divide-gray-50">
                                 {transfers.filter(t => t.partyId?._id === selectedBranch).length > 0 ? 
                                    transfers.filter(t => t.partyId?._id === selectedBranch).map((t, i) => (
                                     <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                                         <td className="px-6 py-4 text-sm font-bold text-gray-500">
                                             {new Date(t.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                         </td>
                                         <td className="px-6 py-4">
                                             <span className={cn(
                                                 "text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5",
                                                 t.type === 'IN' ? "bg-blue-50 text-blue-600" : "bg-red-50 text-red-600"
                                             )}>
                                                 {t.type === 'IN' ? 'PRODUCTION' : 'SALES'}
                                             </span>
                                         </td>
                                         <td className="px-6 py-4 text-sm font-bold text-gray-800">
                                             {t.juiceType?.name}
                                         </td>
                                         <td className="px-6 py-4 text-center text-sm font-black text-blue-600">
                                             {t.type === 'IN' ? `+${t.quantity}` : <span className="text-gray-300">-</span>}
                                         </td>
                                         <td className="px-6 py-4 text-center text-sm font-black text-red-600">
                                             {t.type === 'OUT' ? `-${t.quantity}` : <span className="text-gray-300">-</span>}
                                         </td>
                                     </tr>
                                 )) : (
                                     <tr><td colSpan={5} className="p-12 text-center text-gray-400 font-bold">No recent activity for this branch</td></tr>
                                 )}
                             </tbody>
                         </table>
                     </div>
                  </div>
              </div>
          ) : (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Store className="w-8 h-8 text-gray-300" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">No Branch Selected</h3>
                  <p className="text-gray-400 font-medium">Please select a branch from the dropdown above to view stock.</p>
              </div>
          )}

        </div>

        {/* Transfer IN Modal */}
        <AnimatePresence>
            {isTransferInOpen && selectedProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/50" onClick={() => setIsTransferInOpen(false)} />
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 30 }}
                        className="bg-white rounded-3xl w-full max-w-md z-50 relative shadow-2xl overflow-hidden"
                    >
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h2 className="text-xl font-black text-gray-900">Add Stock to Branch</h2>
                                <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">{selectedProduct.name}</p>
                            </div>
                            <button onClick={() => setIsTransferInOpen(false)} className="text-gray-400 hover:text-gray-600"><XCircle className="w-6 h-6" /></button>
                        </div>
                        <form onSubmit={handleTransferIn} className="p-6 space-y-6">
                            <div className="flex items-center justify-between p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                                <div className="text-center flex-1">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Main Stock</p>
                                    <p className="text-lg font-black text-gray-900">{selectedProduct.currentStock || 0}</p>
                                </div>
                                <div className="text-blue-300 px-4">
                                    <ArrowRight className="w-5 h-5" />
                                </div>
                                <div className="text-center flex-1">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Branch Stock</p>
                                    <p className="text-lg font-black text-blue-600">{getStockForProduct(selectedProduct._id)}</p>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Quantity to Transfer</label>
                                <input type="number" required max={selectedProduct.currentStock} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-lg font-black text-gray-900 text-center" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} placeholder="0" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Date</label>
                                <input type="date" required className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-800" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
                            </div>
                            <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-xl text-sm font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95">
                                Transfer Stock
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* Manage Branches Modal */}
            {isManageWholesalersOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/50" onClick={() => setIsManageWholesalersOpen(false)} />
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 30 }}
                        className="bg-white rounded-3xl w-full max-w-3xl z-50 relative shadow-2xl overflow-hidden"
                    >
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                                <Settings className="w-6 h-6 text-gray-700" /> Manage Branches
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
                                        <tr><td colSpan={3} className="p-8 text-center text-gray-400 font-bold">No branches found</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Create Branch Modal */}
            {isCreateBranchOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/50" onClick={() => setIsCreateBranchOpen(false)} />
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 30 }}
                        className="bg-white rounded-3xl w-full max-w-lg z-50 relative shadow-2xl overflow-hidden"
                    >
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                                <Store className="w-6 h-6 text-gray-700" /> {editingPartyId ? 'Edit Branch' : 'New Branch'}
                            </h2>
                            <button onClick={() => setIsCreateBranchOpen(false)} className="text-gray-400 hover:text-gray-600"><XCircle className="w-6 h-6" /></button>
                        </div>
                        <form onSubmit={handleCreateBranch} className="p-6 space-y-5">
                            <div className="space-y-1">
                                <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Branch Name</label>
                                <input type="text" required className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none" value={branchForm.name} onChange={e => setBranchForm({...branchForm, name: e.target.value})} placeholder="E.g., South City Branch" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Contact Person</label>
                                    <input type="text" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none" value={branchForm.contactPerson} onChange={e => setBranchForm({...branchForm, contactPerson: e.target.value})} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Phone</label>
                                    <input type="text" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none" value={branchForm.phone} onChange={e => setBranchForm({...branchForm, phone: e.target.value})} />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Address</label>
                                <input type="text" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none" value={branchForm.address} onChange={e => setBranchForm({...branchForm, address: e.target.value})} />
                            </div>
                            <button type="submit" className="w-full bg-gray-900 text-white py-4 rounded-xl text-sm font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg active:scale-95">
                                {editingPartyId ? 'Save Changes' : 'Create Branch'}
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
