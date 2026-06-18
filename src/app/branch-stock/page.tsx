'use client'
import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import api from '@/services/api';
import toast from 'react-hot-toast';
import { Package, Plus, Send, Activity, User, ArrowUpRight, XCircle, Settings, Trash2, PencilLine, Store, FlaskConical, ArrowRight } from 'lucide-react';
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
              <h1 className="text-2xl font-bold text-gray-900">Branch Stock</h1>
              <p className="text-sm text-gray-500 mt-1">Manage Godowns & Consignments</p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <MonthYearFilter 
                selectedMonth={selectedMonth} 
                selectedYear={selectedYear} 
                onFilterChange={(m, y) => { setSelectedMonth(m); setSelectedYear(y); }} 
              />
              <button onClick={() => setIsManageWholesalersOpen(true)} className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md font-medium hover:bg-gray-50 text-sm">
                <Settings className="w-4 h-4" /> Manage Branches
              </button>
            </div>
          </div>


              <div className="space-y-6">
                  {/* Products Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                      {products.map(p => {
                          const stock = getStockForProduct(p._id);
                          return (
                          <div key={p._id} className="bg-white p-4 rounded-lg border border-gray-200 relative flex flex-col justify-between">
                              <div className="flex justify-between items-start mb-2">
                                  <div className="text-left">
                                      <p className="text-sm font-semibold text-gray-800 line-clamp-1">{p.name}</p>
                                  </div>
                              </div>
                              
                              <div className="mt-2">
                                  <div className="flex items-baseline gap-2">
                                      <h3 className={cn("text-2xl font-bold", stock < 0 ? "text-red-600" : "text-gray-900")}>
                                          {stock}
                                      </h3>
                                      <span className="text-xs text-gray-500">in branch</span>
                                  </div>
                              </div>


                          </div>
                      )})}
                  </div>

                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mt-6">
                      <div className="p-4 border-b border-gray-200 bg-gray-50">
                         <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <Activity className="w-4 h-4" /> Recent Transfers
                         </h2>
                      </div>
                      <div className="overflow-x-auto">
                          <table className="w-full text-left text-sm">
                              <thead className="bg-gray-50 border-b border-gray-200">
                                  <tr>
                                      <th className="px-4 py-3 font-semibold text-gray-600">Date</th>
                                      <th className="px-4 py-3 font-semibold text-gray-600">Type</th>
                                      <th className="px-4 py-3 font-semibold text-gray-600">Product</th>
                                      <th className="px-4 py-3 font-semibold text-green-600 text-center">IN (+)</th>
                                      <th className="px-4 py-3 font-semibold text-red-600 text-center">OUT (-)</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200">
                                  {transfers.filter(t => t.partyId?._id === selectedBranch).length > 0 ? 
                                     transfers.filter(t => t.partyId?._id === selectedBranch).sort((a,b) => {
                                        const d1 = new Date(b.date).getTime() - new Date(a.date).getTime();
                                        if (d1 === 0 && b.createdAt && a.createdAt) return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                                        return d1;
                                     }).map((t, i) => (
                                      <tr key={i} className="hover:bg-gray-50">
                                          <td className="px-4 py-3 text-gray-600">
                                              {new Date(t.date).toLocaleDateString()}
                                          </td>
                                          <td className="px-4 py-3">
                                              <span className={cn(
                                                  "text-xs px-2 py-1 rounded border",
                                                  t.type === 'IN' ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"
                                              )}>
                                                  {t.type === 'IN' ? 'RECEIVED' : 'SALES'}
                                              </span>
                                          </td>
                                          <td className="px-4 py-3 text-gray-900 font-medium">
                                              {t.juiceType?.name}
                                          </td>
                                          <td className="px-4 py-3 text-center font-medium text-green-600">
                                              {t.type === 'IN' ? `+${t.quantity}` : '-'}
                                          </td>
                                          <td className="px-4 py-3 text-center font-medium text-red-600">
                                              {t.type === 'OUT' ? `-${t.quantity}` : '-'}
                                          </td>
                                      </tr>
                                  )) : (
                                      <tr><td colSpan={5} className="p-8 text-center text-gray-500">No recent activity for this branch</td></tr>
                                  )}
                              </tbody>
                          </table>
                      </div>
                  </div>

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
