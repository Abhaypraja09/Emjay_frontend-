'use client'
import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import api from '@/services/api';
import toast from 'react-hot-toast';
import { Package, Plus, Send, Activity, User, ArrowUpRight, XCircle, Settings, Trash2, PencilLine, Store, FlaskConical, ArrowRight, ArrowDown, ArrowUp, MapPin, ChevronDown } from 'lucide-react';
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
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <main className="flex-1 lg:ml-64 overflow-y-auto p-6 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Branch Stock</h1>
              <p className="text-sm font-medium text-slate-500 mt-1">Track branch inventory</p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <MonthYearFilter 
                selectedMonth={selectedMonth} 
                selectedYear={selectedYear} 
                onFilterChange={(m, y) => { setSelectedMonth(m); setSelectedYear(y); }} 
              />
              <div className="relative">
                 <select className="appearance-none bg-white border border-slate-200 text-slate-700 pl-10 pr-10 py-2 rounded-xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-slate-100 cursor-pointer shadow-sm flex items-center h-[42px]"
                 value={selectedBranch}
                 onChange={(e) => setSelectedBranch(e.target.value)}>
                    <option value="" disabled>Select Branch...</option>
                    {parties.map(p => (
                       <option key={p._id} value={p._id}>{p.name}</option>
                    ))}
                 </select>
                 <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                 <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="space-y-6">
              {(() => {
                  const selectedBranchTransfers = transfers.filter(t => t.partyId?._id === selectedBranch).sort((a,b) => {
                      const d1 = new Date(b.date).getTime() - new Date(a.date).getTime();
                      if (d1 === 0 && b.createdAt && a.createdAt) return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                      return d1;
                  });
                  const stockReceived = selectedBranchTransfers.filter(t => t.type === 'IN').reduce((sum, t) => sum + t.quantity, 0);
                  const stockSold = selectedBranchTransfers.filter(t => t.type === 'OUT').reduce((sum, t) => sum + t.quantity, 0);
                  const currentTotalStock = products.reduce((sum, p) => sum + getStockForProduct(p._id), 0);

                  return (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-center md:justify-start gap-6 text-center md:text-left">
                                <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center shrink-0 relative">
                                    <Package className="w-8 h-8 text-blue-500" />
                                    <div className="absolute top-2 left-1/2 -translate-x-1/2"><ArrowDown className="w-4 h-4 text-blue-500" strokeWidth={3} /></div>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Stock Received</p>
                                    <div className="flex items-baseline justify-center md:justify-start gap-2">
                                        <h3 className="text-5xl font-black text-blue-600 tracking-tighter">{stockReceived}</h3>
                                    </div>
                                    <span className="text-sm font-bold text-slate-500">Bottles</span>
                                </div>
                            </div>
                            
                            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-center md:justify-start gap-6 text-center md:text-left">
                                <div className="w-20 h-20 rounded-full bg-rose-50 flex items-center justify-center shrink-0 relative">
                                    <Package className="w-8 h-8 text-rose-500" />
                                    <div className="absolute top-2 left-1/2 -translate-x-1/2"><ArrowUp className="w-4 h-4 text-rose-500" strokeWidth={3} /></div>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Stock Sold</p>
                                    <div className="flex items-baseline justify-center md:justify-start gap-2">
                                        <h3 className="text-5xl font-black text-rose-600 tracking-tighter">{stockSold}</h3>
                                    </div>
                                    <span className="text-sm font-bold text-slate-500">Bottles</span>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-center md:justify-start gap-6 text-center md:text-left">
                                <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 relative">
                                    <Package className="w-10 h-10 text-emerald-500" />
                                    <div className="absolute bottom-2 right-2"><ArrowRight className="w-4 h-4 text-emerald-500" strokeWidth={3} /></div>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Current Stock</p>
                                    <div className="flex items-baseline justify-center md:justify-start gap-2">
                                        <h3 className="text-5xl font-black text-emerald-600 tracking-tighter">{currentTotalStock}</h3>
                                    </div>
                                    <span className="text-sm font-bold text-slate-500">Bottles</span>
                                </div>
                            </div>
                        </div>

                        {/* Products Grid */}
                        <div className="flex overflow-x-auto gap-4 pb-4 snap-x hide-scrollbar">
                            {products.map(p => {
                                const stock = getStockForProduct(p._id);
                                return (
                                    <div key={p._id} className="min-w-[200px] bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center gap-4 snap-start shrink-0">
                                        <div className="w-12 h-20 bg-slate-50 rounded-lg flex items-center justify-center shrink-0">
                                            <FlaskConical className="w-6 h-6 text-amber-600" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{p.name}</h4>
                                            <p className="text-3xl font-black text-slate-900 tracking-tighter mt-1">{stock}</p>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Bottles</p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Recent Transactions */}
                            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                                <div className="p-6 border-b border-slate-50">
                                    <h2 className="text-lg font-black text-slate-900 tracking-tight">Recent Transactions</h2>
                                </div>
                                <div className="overflow-x-auto flex-1">
                                    <table className="w-full text-left">
                                        <thead className="bg-white border-b border-slate-100">
                                            <tr>
                                                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Date</th>
                                                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Product</th>
                                                <th className="px-6 py-4 text-[10px] font-black uppercase text-emerald-600 tracking-widest text-center">IN (+)</th>
                                                <th className="px-6 py-4 text-[10px] font-black uppercase text-rose-600 tracking-widest text-center">OUT (-)</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {selectedBranchTransfers.slice(0,5).map((t, i) => (
                                                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-6 py-4 text-xs font-bold text-slate-500">{new Date(t.date).toLocaleDateString('en-GB', {day: 'numeric', month: 'short', year: 'numeric'})}</td>
                                                    <td className="px-6 py-4 text-sm font-bold text-slate-900">{t.juiceType?.name}</td>
                                                    <td className="px-6 py-4 text-sm font-black text-emerald-600 text-center">{t.type === 'IN' ? t.quantity : '-'}</td>
                                                    <td className="px-6 py-4 text-sm font-black text-rose-600 text-center">{t.type === 'OUT' ? t.quantity : '-'}</td>
                                                </tr>
                                            ))}
                                            {selectedBranchTransfers.length === 0 && (
                                                <tr><td colSpan={4} className="p-12 text-center text-slate-400 italic font-bold uppercase tracking-widest text-xs">No transactions found</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="p-6 border-t border-slate-50">
                                    <button className="text-sm font-bold text-blue-600 flex items-center gap-1 hover:text-blue-700">View All Transactions <ArrowRight className="w-4 h-4" /></button>
                                </div>
                            </div>

                            {/* Low Stock */}
                            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col">
                                <div className="p-6 pb-2">
                                    <h2 className="text-lg font-black text-rose-600 tracking-tight">Low Stock</h2>
                                </div>
                                <div className="p-6 space-y-4 flex-1">
                                    {products.filter(p => getStockForProduct(p._id) <= 10).map(p => {
                                        const stock = getStockForProduct(p._id);
                                        return (
                                            <div key={p._id} className="flex items-center gap-4 bg-white border border-slate-50 p-4 rounded-xl shadow-sm">
                                                <div className="w-10 h-16 bg-slate-50 rounded-lg flex items-center justify-center shrink-0">
                                                    <FlaskConical className="w-5 h-5 text-rose-400" />
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{p.name}</h4>
                                                    <p className="text-xl font-black text-rose-600 tracking-tighter mt-1">{stock}</p>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Bottles Left</p>
                                                </div>
                                            </div>
                                        )
                                    })}
                                    {products.filter(p => getStockForProduct(p._id) <= 10).length === 0 && (
                                        <div className="text-center text-slate-400 italic font-bold uppercase tracking-widest text-xs py-8">All items adequately stocked</div>
                                    )}
                                </div>
                                <div className="p-6 border-t border-slate-50">
                                    <button className="text-sm font-bold text-blue-600 flex items-center gap-1 hover:text-blue-700">View All Low Stock <ArrowRight className="w-4 h-4" /></button>
                                </div>
                            </div>
                        </div>
                      </>
                  );
              })()}
          </div>
        </div>

        {/* Manage Branches Modal */}
        {isManageWholesalersOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="fixed inset-0 bg-black/50" onClick={() => setIsManageWholesalersOpen(false)} />
                <div className="bg-white rounded-lg w-full max-w-2xl z-50 relative shadow-xl overflow-hidden">
                    <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-gray-900">Manage Branches</h2>
                        <button onClick={() => setIsManageWholesalersOpen(false)} className="text-gray-400 hover:text-gray-600"><XCircle className="w-5 h-5" /></button>
                    </div>
                    <div className="max-h-[60vh] overflow-y-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 sticky top-0 border-b border-gray-200">
                                <tr>
                                    <th className="px-4 py-3 font-semibold text-gray-600">Branch</th>
                                    <th className="px-4 py-3 font-semibold text-gray-600">Contact</th>
                                    <th className="px-4 py-3 font-semibold text-gray-600 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {parties.map(p => (
                                    <tr key={p._id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-gray-900">{p.name}</p>
                                            <p className="text-xs text-gray-500">{p.address}</p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="text-gray-900">{p.contactPerson || 'N/A'}</p>
                                            <p className="text-xs text-gray-500">{p.phone}</p>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button onClick={() => openEditModal(p)} className="p-1 text-blue-600 hover:bg-blue-50 rounded mx-1">
                                                <PencilLine className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDeleteParty(p._id)} className="p-1 text-red-600 hover:bg-red-50 rounded mx-1">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {parties.length === 0 && (
                                    <tr><td colSpan={3} className="p-8 text-center text-gray-500">No branches found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )}

        {/* Create Branch Modal */}
        {isCreateBranchOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="fixed inset-0 bg-black/50" onClick={() => setIsCreateBranchOpen(false)} />
                <div className="bg-white rounded-lg w-full max-w-md z-50 relative shadow-xl overflow-hidden">
                    <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-gray-900">{editingPartyId ? 'Edit Branch' : 'New Branch'}</h2>
                        <button onClick={() => setIsCreateBranchOpen(false)} className="text-gray-400 hover:text-gray-600"><XCircle className="w-5 h-5" /></button>
                    </div>
                    <form onSubmit={handleCreateBranch} className="p-4 space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700 block mb-1">Branch Name</label>
                            <input type="text" required className="w-full border border-gray-300 rounded-md p-2 text-gray-900" value={branchForm.name} onChange={e => setBranchForm({...branchForm, name: e.target.value})} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700 block mb-1">Contact Person</label>
                                <input type="text" className="w-full border border-gray-300 rounded-md p-2 text-gray-900" value={branchForm.contactPerson} onChange={e => setBranchForm({...branchForm, contactPerson: e.target.value})} />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 block mb-1">Phone</label>
                                <input type="text" className="w-full border border-gray-300 rounded-md p-2 text-gray-900" value={branchForm.phone} onChange={e => setBranchForm({...branchForm, phone: e.target.value})} />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 block mb-1">Address</label>
                            <input type="text" className="w-full border border-gray-300 rounded-md p-2 text-gray-900" value={branchForm.address} onChange={e => setBranchForm({...branchForm, address: e.target.value})} />
                        </div>
                        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-md font-medium hover:bg-blue-700">
                            {editingPartyId ? 'Save Changes' : 'Create Branch'}
                        </button>
                    </form>
                </div>
            </div>
        )}

      </main>
    </div>
  );
};

export default BranchStock;
