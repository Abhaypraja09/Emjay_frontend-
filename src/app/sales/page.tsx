'use client'
import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import api from '@/services/api';
import toast from 'react-hot-toast';
import { 
  ShoppingCart, 
  Plus, 
  Search, 
  Calendar, 
  User, 
  Building2, 
  CreditCard, 
  CheckCircle, 
  XCircle, 
  Filter, 
  ArrowRight,
  TrendingUp,
  PackageCheck,
  Edit,
  Trash2
} from 'lucide-react';
import { cn } from '@/utils/cn';

const Sales = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [editingItem, setEditingItem] = useState<any>(null);

  const [form, setForm] = useState({
    customerName: '',
    shopName: '',
    type: 'B2C',
    juiceType: '',
    quantity: '',
    paidAmount: '',
    pricePerUnit: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [orderRes, productRes] = await Promise.all([
        api.get('/orders'),
        api.get('/products')
      ]);
      setOrders(orderRes.data);
      setProducts(productRes.data);
    } catch (error) {
      toast.error('Failed to load sales data');
    } finally {
      setLoading(false);
    }
  };

  const handleProductSelect = (id: string) => {
    const product = products.find(p => p._id === id);
    if (product) {
      setForm({ ...form, juiceType: id, pricePerUnit: product.pricePerUnit.toString() });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const totalAmount = Number(form.quantity) * Number(form.pricePerUnit);
    const orderData = {
      customerName: form.customerName,
      shopName: form.shopName,
      type: form.type,
      items: [{ juiceType: form.juiceType, quantity: Number(form.quantity), price: Number(form.pricePerUnit) }],
      totalAmount,
      paidAmount: Number(form.paidAmount)
    };

    try {
      if (editingItem) {
        await api.put(`/orders/${editingItem._id}`, orderData);
        toast.success('Order updated successfully');
      } else {
        await api.post('/orders', orderData);
        toast.success('Sale recorded successfully');
      }
      setIsModalOpen(false);
      setEditingItem(null);
      setForm({ customerName: '', shopName: '', type: 'B2C', juiceType: '', quantity: '', paidAmount: '', pricePerUnit: '' });
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save order');
    }
  };

  const deleteOrder = async (id: string) => {
    if (!confirm('Are you sure? This will delete the order and restore the juice stock.')) return;
    try {
      await api.delete(`/orders/${id}`);
      toast.success('Order removed and stock restored');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete order');
    }
  };

  const startEdit = (order: any) => {
    setEditingItem(order);
    const item = order.items[0] || {};
    setForm({
      customerName: order.customerName,
      shopName: order.shopName || '',
      type: order.type,
      juiceType: item.juiceType?._id || '',
      quantity: item.quantity?.toString() || '',
      paidAmount: order.paidAmount?.toString() || '',
      pricePerUnit: item.price?.toString() || ''
    });
    setIsModalOpen(true);
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.put(`/orders/${id}/status`, { status });
      toast.success('Order status updated');
      fetchData();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <Sidebar />
      <main className="flex-1 lg:ml-64 p-8 overflow-y-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic underline decoration-indigo-500 underline-offset-8">Sales & Logistics</h1>
            <p className="text-slate-500 mt-4 font-semibold uppercase tracking-widest text-[10px]">Manage B2B/B2C orders and payment status</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="btn-primary flex items-center gap-2 group shadow-xl shadow-indigo-600/20"
          >
            <div className="p-1 rounded bg-white/20 group-hover:bg-white/30 transition-all">
                <Plus className="w-3 h-3 text-white" />
            </div>
            Create New Order
          </button>
        </div>

        {/* Sales Stats Panel */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 text-[12px] font-black uppercase tracking-widest">
          <div className="card border-emerald-100 bg-emerald-50 group">
             <div className="flex items-center gap-3 text-emerald-600 mb-2 font-black italic">
                <TrendingUp className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span>Total Volume</span>
             </div>
             <h2 className="text-4xl font-black text-slate-900 tracking-tighter italic">₹{orders.reduce((acc, o) => acc + o.totalAmount, 0).toLocaleString()}</h2>
             <p className="text-[10px] text-slate-500 mt-2 italic underline decoration-emerald-200">Financial Recognition</p>
          </div>
          <div className="card border-blue-100 bg-blue-50 group">
             <div className="flex items-center gap-3 text-blue-600 mb-2 font-black italic">
                <PackageCheck className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span>Orders Handled</span>
             </div>
             <h2 className="text-4xl font-black text-slate-900 tracking-tighter italic">{orders.length} Units</h2>
             <p className="text-[10px] text-slate-500 mt-2 italic underline decoration-blue-200">Fulfillment Status</p>
          </div>
          <div className="card border-rose-100 bg-rose-50 group">
             <div className="flex items-center gap-3 text-rose-600 mb-2 font-black italic">
                <CreditCard className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span>Outstandings</span>
             </div>
             <h2 className="text-4xl font-black text-slate-900 tracking-tighter italic">₹{orders.reduce((acc, o) => acc + o.dueAmount, 0).toLocaleString()}</h2>
             <p className="text-[10px] text-slate-500 mt-2 italic underline decoration-rose-200">Pending collections</p>
          </div>
        </div>

        {/* Orders Table */}
          <div className="card !p-0 border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
               <h3 className="font-black text-slate-900 uppercase tracking-tight italic">Order Registry</h3>
               <div className="flex gap-3">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" placeholder="Search orders..." className="bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                  </div>
               </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-black tracking-widest h-12">
                  <tr>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Order Detail</th>
                    <th className="px-6 py-4">Client</th>
                    <th className="px-6 py-4">Items</th>
                    <th className="px-6 py-4">Financials</th>
                    <th className="px-6 py-4">State</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600 font-medium lowercase">
                  {orders.map((order) => (
                    <tr key={order._id} className="hover:bg-slate-50/50 transition-all font-medium first-letter:uppercase">
                      <td className="px-6 py-4">
                         <div className={cn(
                           "w-10 h-10 rounded-xl flex items-center justify-center border transition-all",
                           order.orderStatus === 'delivered' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"
                         )}>
                           {order.orderStatus === 'delivered' ? <CheckCircle className="w-5 h-5" /> : <PackageCheck className="w-5 h-5" />}
                         </div>
                      </td>
                      <td className="px-6 py-4">
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter italic">#{order._id.slice(-6).toUpperCase()}</p>
                         <p className="text-sm font-black text-slate-900 mt-1">{new Date(order.date).toLocaleDateString()}</p>
                      </td>
                      <td className="px-6 py-4">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-indigo-600">
                                {order.type === 'B2B' ? <Building2 className="w-4 h-4" /> : <User className="w-4 h-4" />}
                            </div>
                            <div>
                               <p className="font-black text-slate-900 uppercase text-xs tracking-tight italic">{order.customerName}</p>
                               <p className="text-[10px] text-slate-400 font-bold uppercase">{order.shopName || 'retail'}</p>
                            </div>
                         </div>
                      </td>
                      <td className="px-6 py-4">
                         {order.items.map((item: any, i: number) => (
                           <div key={i} className="flex items-center gap-1.5">
                              <span className="text-indigo-600 font-black italic underline decoration-indigo-200">{item.juiceType?.name}</span>
                              <span className="text-[10px] font-black text-slate-500 uppercase">x{item.quantity}</span>
                           </div>
                         ))}
                      </td>
                      <td className="px-6 py-4">
                         <p className="text-lg font-black text-slate-900 tracking-tighter">₹{order.totalAmount}</p>
                         <p className={cn("text-[10px] font-black tracking-widest uppercase", order.dueAmount > 0 ? "text-rose-500" : "text-emerald-500")}>
                            {order.dueAmount > 0 ? `Due: ₹${order.dueAmount}` : 'Settled'}
                         </p>
                      </td>
                      <td className="px-6 py-4">
                         <span className={cn(
                           "px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm",
                           order.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-rose-100 text-rose-700 border-rose-200'
                         )}>
                           {order.paymentStatus}
                         </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          {order.orderStatus === 'pending' && (
                            <button onClick={() => updateStatus(order._id, 'delivered')} className="p-1.5 hover:bg-emerald-50 text-emerald-600 rounded-lg transition-all" title="Mark Delivered"><CheckCircle className="w-4 h-4" /></button>
                          )}
                          <button onClick={() => startEdit(order)} className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-indigo-600 rounded-lg transition-all"><Edit className="w-4 h-4" /></button>
                          <button onClick={() => deleteOrder(order._id)} className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/80 backdrop-blur-md animate-in fade-in" onClick={() => { setIsModalOpen(false); setEditingItem(null); }}></div>
            <div className="card w-full max-w-2xl z-[110] relative animate-in zoom-in duration-300 border-indigo-100 shadow-2xl bg-white">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-indigo-50 border border-indigo-100 shadow-sm transition-all">
                    <ShoppingCart className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tighter italic">{editingItem ? 'Edit Order' : 'New Sales Transaction'}</h2>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Financial Receipting Module</p>
                  </div>
                </div>
                <button onClick={() => { setIsModalOpen(false); setEditingItem(null); }} className="text-slate-400 hover:text-slate-900 transition-all"><XCircle className="w-6 h-6" /></button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic italic">Client Name</label>
                    <input 
                      type="text" required
                      className="input-field"
                      placeholder="e.g. John Doe"
                      value={form.customerName}
                      onChange={(e) => setForm({...form, customerName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic italic">Outlet Reference</label>
                    <input 
                      type="text"
                      className="input-field"
                      placeholder="e.g. corner store"
                      value={form.shopName}
                      onChange={(e) => setForm({...form, shopName: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 items-end">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic italic">Market Type</label>
                    <div className="flex bg-slate-100 p-1 rounded-2xl gap-1">
                      <button 
                        type="button" 
                        onClick={() => setForm({...form, type: 'B2C'})}
                        className={cn("flex-1 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", form.type === 'B2C' ? "bg-indigo-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-900")}
                      >Retail (B2C)</button>
                      <button 
                        type="button" 
                        onClick={() => setForm({...form, type: 'B2B'})}
                        className={cn("flex-1 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", form.type === 'B2B' ? "bg-indigo-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-900")}
                      >Merchant (B2B)</button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic italic">Juice Inventory Selection</label>
                    <div className="relative">
                      <select 
                        required 
                        className="input-field appearance-none"
                        value={form.juiceType}
                        onChange={(e) => handleProductSelect(e.target.value)}
                      >
                        <option value="">Choose item...</option>
                        {products.map(p => (
                          <option key={p._id} value={p._id}>{p.name} (Stk: {p.currentStock})</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic italic">Volume (Units)</label>
                    <input 
                      type="number" required
                      className="input-field h-12 text-lg font-black italic"
                      placeholder="e.g. 10"
                      value={form.quantity}
                      onChange={(e) => setForm({...form, quantity: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic italic">Rate (₹/Unit)</label>
                    <input 
                      type="number" required
                      className="input-field bg-slate-50 border-dashed border-2 cursor-not-allowed font-black h-12 text-lg italic text-slate-400"
                      readOnly
                      value={form.pricePerUnit}
                    />
                  </div>
                   <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic italic">Payment Recvd (₹)</label>
                    <input 
                      type="number" required
                      className="input-field border-indigo-500/20 focus:ring-emerald-500 h-12 text-lg font-black italic text-emerald-600"
                      placeholder="e.g. 500"
                      value={form.paidAmount}
                      onChange={(e) => setForm({...form, paidAmount: e.target.value})}
                    />
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-indigo-600 shadow-xl shadow-indigo-600/20 flex items-center justify-between text-white border-none">
                   <div className="space-y-1">
                      <p className="text-[10px] uppercase font-black tracking-[0.2em] flex items-center gap-2 opacity-80">
                         Total Invoice Value
                      </p>
                      <h4 className="text-4xl font-black italic">₹{(Number(form.quantity) * Number(form.pricePerUnit)).toLocaleString() || 0}</h4>
                   </div>
                   <div className="text-right">
                      <p className="text-[10px] opacity-80 uppercase font-black tracking-widest">Balance Credit</p>
                      <p className="text-xl font-black italic text-indigo-200">₹{( (Number(form.quantity) * Number(form.pricePerUnit)) - Number(form.paidAmount) ).toLocaleString() || 0}</p>
                   </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => { setIsModalOpen(false); setEditingItem(null); }} className="flex-1 px-4 py-4 border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all font-black text-xs uppercase tracking-widest text-slate-500">Cancel</button>
                  <button type="submit" className="flex-[2] btn-primary shadow-xl shadow-indigo-600/20 font-black text-xs uppercase tracking-widest py-4 flex items-center justify-center gap-3 group">
                      {editingItem ? 'Update Invoicing' : 'Finalize Sale & Receipt'}
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
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

export default Sales;
