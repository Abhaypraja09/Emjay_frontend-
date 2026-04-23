'use client'
import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import api from '@/services/api';
import toast from 'react-hot-toast';
import { 
  Plus, 
  Trash2, 
  PencilLine,
  XCircle,
  Package,
  Calendar,
  User,
  Store,
  Wallet,
  ArrowRight,
  ChevronDown,
  ArrowUpDown
} from 'lucide-react';
import MonthYearFilter from '@/components/MonthYearFilter';

import { cn } from '@/utils/cn';
import { motion, AnimatePresence } from 'framer-motion';

const Sales = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [globalLedger, setGlobalLedger] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('All');
  const [activeMainTab, setActiveMainTab] = useState('ledger');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const [form, setForm] = useState({
    customerName: '',
    shopName: '',
    type: 'B2B',
    juiceType: '',
    quantity: '',
    paidAmount: '',
    pricePerUnit: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Removed computeStockFlow frontend logic - using backend report instead

  useEffect(() => {
    fetchData();
  }, [selectedMonth, selectedYear]);

  const [productions, setProductions] = useState<any[]>([]);
  const fetchData = async () => {
    try {
      setLoading(true);
      const [orderRes, productRes, prodRes, ledgerRes] = await Promise.all([
        api.get('/orders', { params: { month: selectedMonth, year: selectedYear } }),
        api.get('/products'),
        api.get('/production', { params: { month: selectedMonth, year: selectedYear } }),
        api.get('/reports/global-stock', { params: { month: selectedMonth, year: selectedYear } })
      ]);
      setOrders(orderRes.data);
      setProducts(productRes.data);
      setProductions(prodRes.data);
      setGlobalLedger(ledgerRes.data);
    } catch (error) {
      toast.error('Data loading failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const totalAmount = Number(form.quantity) * Number(form.pricePerUnit);
    const orderData = {
      ...form,
      items: [{ 
          juiceType: form.juiceType, 
          quantity: Number(form.quantity), 
          price: Number(form.pricePerUnit) 
      }],
      totalAmount,
      paidAmount: Number(form.paidAmount) || 0
    };

    try {
      if (editingOrder) {
        await api.put(`/orders/${editingOrder._id}`, orderData);
        toast.success('Sale Updated');
      } else {
        await api.post('/orders', orderData);
        toast.success('Sale Saved');
      }
      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error occurred');
    }
  };

  const handleEdit = (order: any) => {
    setEditingOrder(order);
    const jtId = order.items[0]?.juiceType?._id || order.items[0]?.juiceType;
    setForm({
      customerName: order.customerName,
      shopName: order.shopName || '',
      type: order.type,
      juiceType: jtId,
      quantity: order.items[0]?.quantity.toString() || '',
      paidAmount: (order.paidAmount || 0).toString(),
      pricePerUnit: (order.items[0]?.price || 0).toString() || '',
      date: new Date(order.date).toISOString().split('T')[0]
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingOrder(null);
    setForm({ customerName: '', shopName: '', type: 'B2B', juiceType: '', quantity: '', paidAmount: '', pricePerUnit: '', date: new Date().toISOString().split('T')[0] });
  };

  const filteredOrders = orders.filter(o => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Wholesale') return o.type === 'B2B';
    return o.type === 'B2C';
  });

  if (loading) return <div className="flex h-screen bg-white items-center justify-center font-bold text-gray-400">Loading...</div>;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 lg:ml-64 p-6">
        
        {/* Simple Header */}
        <div className="flex items-center justify-between mb-8">
           <div>
              <h1 className="text-2xl font-bold text-gray-800">Sales Record</h1>
              <p className="text-gray-500 text-sm">Daily sales and customer tracking</p>
           </div>
            <div className="flex items-center gap-4">
                <MonthYearFilter 
                    selectedMonth={selectedMonth} 
                    selectedYear={selectedYear} 
                    onFilterChange={(m, y) => { setSelectedMonth(m); setSelectedYear(y); }} 
                />
                <button 
                    onClick={() => { resetForm(); setIsModalOpen(true); }}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Add New Sale
                </button>
            </div>
        </div>

        {/* Totals Block */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <p className="text-gray-400 text-xs font-bold uppercase mb-1">Total Sales</p>
                <h3 className="text-2xl font-bold text-gray-800">₹{orders.reduce((a, b) => a + b.totalAmount, 0).toLocaleString()}</h3>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <p className="text-gray-400 text-xs font-bold uppercase mb-1">Collected</p>
                <h3 className="text-2xl font-bold text-green-600">₹{orders.reduce((a, b) => a + (b.paidAmount || 0), 0).toLocaleString()}</h3>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <p className="text-gray-400 text-xs font-bold uppercase mb-1">Total Pcs Sold</p>
                <h3 className="text-2xl font-bold text-gray-800">{orders.reduce((a, b) => a + (b.items[0]?.quantity || 0), 0)} Pcs</h3>
            </div>
        </div>

        {/* Main Tab System */}
        <div className="flex bg-gray-200/50 p-1.5 rounded-2xl w-fit mb-8 shadow-inner">
            <button 
                onClick={() => setActiveMainTab('ledger')}
                className={cn(
                    "px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all",
                    activeMainTab === 'ledger' ? "bg-white text-blue-600 shadow-xl scale-[1.02]" : "text-gray-500 hover:text-gray-900"
                )}
            >Sales Ledger</button>
            <button 
                onClick={() => setActiveMainTab('stock')}
                className={cn(
                    "px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all",
                    activeMainTab === 'stock' ? "bg-white text-blue-600 shadow-xl scale-[1.02]" : "text-gray-500 hover:text-gray-900"
                )}
            >Daily Stock Entry</button>
        </div>

        {activeMainTab === 'ledger' ? (
          <>
            {/* Sales Ledger Content (Original) */}
            <div className="flex bg-white p-1 rounded-lg border border-gray-200 w-fit mb-6">
                {['All', 'Wholesale', 'Retail'].map(tab => (
                    <button 
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={cn(
                            "px-6 py-2 rounded-md text-sm font-bold transition-all",
                            activeTab === tab ? "bg-gray-800 text-white shadow-sm" : "text-gray-500 hover:text-gray-800"
                        )}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Party / Customer</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Product</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Qty</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Bill Amount</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 italic-none">
                            {filteredOrders.length > 0 ? filteredOrders.map((o, i) => (
                                <tr key={i} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-sm font-bold text-gray-600">
                                        {new Date(o.date).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-gray-800 leading-tight">{o.customerName}</p>
                                        <p className="text-xs text-gray-400 uppercase font-medium mt-0.5">{o.shopName || 'Market'}</p>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-bold text-gray-700">
                                        {o.items[0]?.juiceType?.name}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-bold text-gray-800">
                                        {o.items[0]?.quantity} Pcs
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-bold text-gray-800">₹{(o.totalAmount || 0).toLocaleString()}</p>
                                        <p className={cn(
                                            "text-[10px] font-bold uppercase",
                                            (o.paidAmount >= o.totalAmount) ? "text-green-500" : "text-red-500"
                                        )}>
                                            {o.paidAmount >= o.totalAmount ? 'Fully Paid' : `Due: ₹${o.totalAmount - o.paidAmount}`}
                                        </p>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-3">
                                            <button onClick={() => handleEdit(o)} className="p-2 text-gray-400 hover:text-blue-600 transition-colors"><PencilLine className="w-5 h-5" /></button>
                                            <button 
                                                onClick={async () => {
                                                    if(confirm('Delete record?')) {
                                                        await api.delete(`/orders/${o._id}`);
                                                        fetchData();
                                                    }
                                                }} 
                                                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan={6} className="p-10 text-center text-gray-400 font-bold">No Records Found</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-700">
              <div className="p-8 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-black text-gray-900 italic uppercase tracking-tight">Daily Stock Flow Ledger</h3>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Real-time inventory calculation (Opening + Prod - Sales = Closing)</p>
                  </div>
              </div>
              <div className="overflow-x-auto">
                  <table className="w-full text-left">
                      <thead className="bg-[#1e293b] text-white text-[10px] uppercase font-black tracking-[0.2em] h-14">
                          <tr>
                              <th className="px-8 py-4 border-r border-slate-700/50">Date</th>
                              <th className="px-8 py-4 border-r border-slate-700/50 text-center">Opening Stock</th>
                              <th className="px-8 py-4 border-r border-slate-700/50 text-center">Production (+)</th>
                              <th className="px-8 py-4 border-r border-slate-700/50 text-center">Sales (-)</th>
                              <th className="px-8 py-4 text-center">Closing Stock</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 italic-none">
                          {globalLedger.map((row, idx) => (
                              <tr key={idx} className="hover:bg-blue-50/30 transition-all font-medium border-l-4 border-l-transparent hover:border-l-blue-600">
                                  <td className="px-8 py-6 text-sm font-black text-gray-900 italic">{new Date(row.date).toLocaleDateString()}</td>
                                  <td className="px-8 py-6 text-center text-gray-500 font-bold">{row.openingStock}</td>
                                  <td className="px-8 py-6 text-center text-emerald-600 font-black italic bg-emerald-50/30">+{row.production}</td>
                                  <td className="px-8 py-6 text-center text-rose-600 font-black italic bg-rose-50/30">-{row.sales}</td>
                                  <td className="px-8 py-6 text-center">
                                      <span className="px-4 py-2 bg-slate-900 text-white rounded-lg font-black italic shadow-lg shadow-slate-900/10">
                                          {row.closingStock}
                                      </span>
                                  </td>
                              </tr>
                          ))}
                          {globalLedger.length === 0 && (
                              <tr><td colSpan={5} className="p-12 text-center text-gray-400 font-bold">No flow records for this period</td></tr>
                          )}
                      </tbody>
                  </table>
              </div>
          </div>
        )}

        {/* Modal - Simple and Clean */}
        <AnimatePresence>
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/50" onClick={() => setIsModalOpen(false)} />
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 30 }}
                        className="bg-white rounded-lg w-full max-w-lg z-50 relative shadow-2xl overflow-hidden"
                    >
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-800">{editingOrder ? 'Edit Sale' : 'New Sale Entry'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><XCircle className="w-6 h-6" /></button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-gray-500 uppercase">Party / Customer Name</label>
                                    <input type="text" required className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm font-bold text-gray-800 outline-none focus:border-blue-500" value={form.customerName} onChange={e => setForm({...form, customerName: e.target.value})} placeholder="Enter name" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-gray-500 uppercase">Sale Type</label>
                                    <select className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm font-bold text-gray-800" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                                        <option value="B2B">Wholesale (Dukan)</option>
                                        <option value="B2C">Retail (Direct)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-gray-500 uppercase">Shop Name (Optional)</label>
                                    <input type="text" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm font-bold text-gray-800 outline-none focus:border-blue-500" value={form.shopName} onChange={e => setForm({...form, shopName: e.target.value})} placeholder="e.g. ABC Store" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-gray-500 uppercase">Date</label>
                                    <input type="date" required className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm font-bold text-gray-800 outline-none focus:border-blue-500" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-gray-100">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-bold text-gray-500 uppercase">Juice Variant</label>
                                        <select 
                                            required 
                                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm font-bold text-gray-800 outline-none" 
                                            value={form.juiceType} 
                                            onChange={e => {
                                                const p = products.find(pr => pr._id === e.target.value);
                                                setForm({...form, juiceType: e.target.value, pricePerUnit: p?.pricePerUnit.toString() || ''});
                                            }}
                                        >
                                            <option value="">Select Juice...</option>
                                            {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-bold text-gray-500 uppercase">Quantity (Pcs)</label>
                                        <input type="number" required className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm font-bold text-gray-800 outline-none focus:border-blue-500" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} placeholder="Total Pieces" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-bold text-gray-500 uppercase">Cash Received</label>
                                        <input type="number" className="w-full bg-green-50 border border-green-100 rounded-lg px-4 py-3 text-sm font-bold text-green-700 outline-none focus:border-green-500" value={form.paidAmount} onChange={e => setForm({...form, paidAmount: e.target.value})} placeholder="Amount got" />
                                    </div>
                                    <div className="flex flex-col justify-end text-right">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase">Total Bill</p>
                                        <p className="text-2xl font-black text-blue-600 tracking-tight">₹{(Number(form.quantity) * Number(form.pricePerUnit)).toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>

                            <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-lg text-sm font-bold uppercase transition-all hover:bg-blue-700 shadow-lg shadow-blue-500/20 active:scale-[0.98]">
                                {editingOrder ? 'Update Record' : 'Save Sale Entry'}
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

export default Sales;
