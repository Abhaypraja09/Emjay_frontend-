'use client'
import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import api from '@/services/api';
import toast from 'react-hot-toast';
import { 
  Plus, 
  Package, 
  FlaskConical, 
  History, 
  Edit, 
  Trash2, 
  ChevronRight, 
  RefreshCcw,
  Search,
  XCircle,
  Store,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/utils/cn';

const Inventory = () => {
  const [activeTab, setActiveTab] = useState('bottles'); // 'bottles' or 'juices'
  const [bottleStock, setBottleStock] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [editingItem, setEditingItem] = useState<any>(null);

  const [bottleForm, setBottleForm] = useState({
    quantity: '',
    costPerUnit: '',
    supplierName: '',
    description: ''
  });

  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    pricePerUnit: '',
    lowStockThreshold: '10'
  });

  // FETCH DATA HOISTED AT TOP
  const fetchData = async () => {
    try {
      setLoading(true);
      const [bottleRes, productRes] = await Promise.all([
        api.get('/bottles/stock'),
        api.get('/products')
      ]);
      setBottleStock(bottleRes.data);
      setProducts(productRes.data);
    } catch (error) {
      console.error('Inventory Fetch Error:', error);
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleBottleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const totalCost = Number(bottleForm.quantity) * Number(bottleForm.costPerUnit);
      if (editingItem) {
        await api.put(`/bottles/${editingItem._id}`, { ...bottleForm, totalCost });
        toast.success('Bottle purchase updated');
      } else {
        await api.post('/bottles/purchase', { ...bottleForm, totalCost });
        toast.success('Bottle purchase recorded');
      }
      setBottleForm({ quantity: '', costPerUnit: '', supplierName: '', description: '' });
      setIsModalOpen(false);
      setEditingItem(null);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save purchase');
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.put(`/products/${editingItem._id}`, productForm);
        toast.success('Product updated');
      } else {
        await api.post('/products', productForm);
        toast.success('Juice product added');
      }
      setProductForm({ name: '', description: '', pricePerUnit: '', lowStockThreshold: '10' });
      setIsModalOpen(false);
      setEditingItem(null);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save product');
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product removed');
      fetchData();
    } catch (error) {
       toast.error('Failed to delete product');
    }
  };

  const deleteBottlePurchase = async (id: string) => {
    if (!confirm('Are you sure you want to delete this purchase record?')) return;
    try {
      await api.delete(`/bottles/${id}`);
      toast.success('Purchase record removed');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete purchase record');
    }
  };

  const startEditProduct = (product: any) => {
    setEditingItem(product);
    setProductForm({
      name: product.name,
      description: product.description || '',
      pricePerUnit: product.pricePerUnit.toString(),
      lowStockThreshold: product.lowStockThreshold.toString()
    });
    setIsModalOpen(true);
  };

  const startEditBottle = (record: any) => {
    setEditingItem(record);
    setBottleForm({
      quantity: record.quantity.toString(),
      costPerUnit: record.costPerUnit.toString(),
      supplierName: record.supplierName,
      description: record.description || ''
    });
    setIsModalOpen(true);
  };

  if (loading) return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 lg:ml-64 p-8 overflow-y-auto">
        <div className="animate-pulse space-y-8">
          <div className="flex justify-between items-center">
            <div className="space-y-3">
              <div className="h-8 w-64 bg-slate-100 rounded-lg"></div>
              <div className="h-4 w-48 bg-slate-50 rounded-md"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-40 bg-white rounded-2xl border border-slate-100 shadow-sm"></div>
            ))}
          </div>
          <div className="h-96 bg-white rounded-2xl border border-slate-100 shadow-sm"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <Sidebar />
      <main className="flex-1 lg:ml-64 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter italic underline decoration-indigo-500 underline-offset-8">Inventory Management</h1>
            <p className="text-slate-500 mt-4 font-semibold uppercase tracking-widest text-[10px]">Track empty bottles and finished juice stock</p>
          </div>
          <button 
            onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
            className="btn-primary flex items-center gap-2 group shadow-xl shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" />
            Add Bottle Purchase
          </button>
        </div>

        {/* Tabs */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl w-fit mb-8 shadow-inner">
          <button 
            onClick={() => setActiveTab('bottles')}
            className={cn(
              "flex items-center gap-3 px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all",
              activeTab === 'bottles' ? "bg-white text-indigo-600 shadow-xl scale-[1.02]" : "text-slate-500 hover:text-slate-900"
            )}
          >
            Empty Bottles
          </button>
          <button 
            onClick={() => setActiveTab('juices')}
            className={cn(
              "flex items-center gap-3 px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all",
              activeTab === 'juices' ? "bg-white text-indigo-600 shadow-xl scale-[1.02]" : "text-slate-500 hover:text-slate-900"
            )}
          >
            Juice Products
          </button>
        </div>

        {activeTab === 'bottles' ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="card text-center flex flex-col items-center justify-center p-8 bg-indigo-50 group border-indigo-100">
                <Package className="w-10 h-10 text-indigo-600 mb-4 group-hover:scale-110 transition-transform" />
                <p className="text-indigo-900/40 text-[10px] mb-1 uppercase tracking-widest font-black">Available Empty Bottles</p>
                <h2 className="text-4xl font-black text-indigo-900 tracking-tighter italic">{bottleStock?.availableEmptyBottles || 0}</h2>
              </div>
              <div className="card text-center flex flex-col items-center justify-center p-8 bg-emerald-50 group border-emerald-100">
                <History className="w-10 h-10 text-emerald-600 mb-4 group-hover:scale-110 transition-transform" />
                <p className="text-emerald-900/40 text-[10px] mb-1 uppercase tracking-widest font-black">Total Purchased</p>
                <h2 className="text-4xl font-black text-emerald-900 tracking-tighter italic">{bottleStock?.totalPurchased || 0}</h2>
              </div>
              <div className="card text-center flex flex-col items-center justify-center p-8 bg-amber-50 group border-amber-100">
                <History className="w-10 h-10 text-amber-600 mb-4 group-hover:scale-110 transition-transform" />
                <p className="text-amber-900/40 text-[10px] mb-1 uppercase tracking-widest font-black">Used in Production</p>
                <h2 className="text-4xl font-black text-amber-900 tracking-tighter italic">{bottleStock?.totalUsed || 0}</h2>
              </div>
            </div>

            <div className="card !p-0 border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h3 className="font-black text-slate-900 uppercase tracking-tight italic">Bottle Procurement History</h3>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" placeholder="Search logs..." className="bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-black tracking-widest h-12">
                  <tr>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Quantity</th>
                    <th className="px-6 py-4">Price / Unit</th>
                    <th className="px-6 py-4">Total Amount</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  {bottleStock?.history?.map((h: any) => (
                    <tr key={h._id} className="hover:bg-slate-50/50 transition-all font-medium">
                      <td className="px-6 py-4 text-slate-900">{new Date(h.date).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                          h.type === 'IN' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        )}>{h.type}</span>
                      </td>
                      <td className="px-6 py-4 font-black text-slate-900">{h.quantity}</td>
                      <td className="px-6 py-4">₹{h.costPerUnit}</td>
                      <td className="px-6 py-4 font-black italic text-indigo-600">₹{h.totalCost}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => startEditBottle(h)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-indigo-600 transition-all"><Edit className="w-3.5 h-3.5" /></button>
                          <button onClick={() => deleteBottlePurchase(h._id)} className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product._id} className="card group hover:border-indigo-100 hover:shadow-2xl hover:shadow-indigo-600/5 transition-all cursor-default border-slate-100 bg-white">
                <div className="flex justify-between items-start mb-6">
                  <div className="p-3 rounded-2xl bg-indigo-50 border border-indigo-100 shadow-sm group-hover:scale-110 transition-transform">
                    <Store className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                    <button 
                      onClick={() => startEditProduct(product)}
                      className="p-2.5 bg-slate-50 hover:bg-indigo-50 rounded-xl text-slate-400 hover:text-indigo-600 transition-all border border-slate-100"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => deleteProduct(product._id)}
                      className="p-2.5 bg-slate-50 hover:bg-rose-50 rounded-xl text-slate-400 hover:text-rose-600 transition-all border border-slate-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tighter italic mb-1 uppercase">{product.name}</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-6 line-clamp-2">{product.description || 'Enterprise Grade Unit'}</p>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1">Mkt Price</p>
                    <p className="text-xl font-black text-slate-900 italic">₹{product.pricePerUnit}</p>
                  </div>
                  <div className={cn(
                    "p-4 rounded-2xl border transition-all",
                    product.currentStock <= product.lowStockThreshold ? 
                      "bg-rose-50 border-rose-100" : 
                      "bg-slate-50 border-slate-100"
                  )}>
                    <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1">In Stock</p>
                    <p className={cn(
                      "text-xl font-black italic",
                      product.currentStock <= product.lowStockThreshold ? "text-rose-600 animate-pulse" : "text-slate-900"
                    )}>{product.currentStock} Units</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/80 backdrop-blur-md animate-in fade-in" onClick={() => setIsModalOpen(false)}></div>
            <div className="card w-full max-w-md z-[110] relative animate-in zoom-in duration-300 border-indigo-100 shadow-2xl bg-white">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tighter italic">{editingItem ? 'Edit Purchase' : 'Bottle Procurement'}</h2>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Inventory Input Module</p>
                </div>
                <button onClick={() => { setIsModalOpen(false); setEditingItem(null); }} className="text-slate-400 hover:text-slate-900 transition-all"><XCircle className="w-6 h-6" /></button>
              </div>
              
              {activeTab === 'bottles' ? (
                <form onSubmit={handleBottleSubmit} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Unit Quantity</label>
                      <input 
                        type="number" required
                        className="input-field h-12 font-black italic text-lg"
                        placeholder="e.g. 1000"
                        value={bottleForm.quantity}
                        onChange={(e) => setBottleForm({...bottleForm, quantity: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Cost Per unit (₹)</label>
                      <input 
                        type="number" required
                        className="input-field h-12 font-black italic text-lg text-emerald-600"
                        placeholder="e.g. 5"
                        value={bottleForm.costPerUnit}
                        onChange={(e) => setBottleForm({...bottleForm, costPerUnit: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Supplier / Entity Name</label>
                    <input 
                      type="text" required
                      className="input-field h-12 font-black"
                      placeholder="e.g. Global Plastics Corp"
                      value={bottleForm.supplierName}
                      onChange={(e) => setBottleForm({...bottleForm, supplierName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Procurement Notes</label>
                    <textarea 
                      className="input-field min-h-[100px] font-medium"
                      placeholder="Enter batch details or remarks..."
                      value={bottleForm.description}
                      onChange={(e) => setBottleForm({...bottleForm, description: e.target.value})}
                    />
                  </div>
                   <div className="p-5 rounded-2xl bg-indigo-600 text-white flex justify-between items-center shadow-xl shadow-indigo-600/20">
                      <div>
                         <p className="text-[10px] font-black uppercase opacity-70 tracking-widest">Calculated Capital Outlay</p>
                         <h4 className="text-3xl font-black italic">₹{(Number(bottleForm.quantity) * Number(bottleForm.costPerUnit)).toLocaleString() || 0}</h4>
                      </div>
                   </div>
                  <div className="flex gap-4 pt-4">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-4 border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all font-black text-[10px] uppercase tracking-widest text-slate-500">Abort</button>
                    <button type="submit" className="flex-[2] btn-primary py-4 font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 group">
                       Initialize Journal Entry
                       <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleProductSubmit} className="space-y-6">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Product Label</label>
                    <input 
                      type="text" required
                      className="input-field h-12 font-black text-lg italic"
                      placeholder="e.g. Premium Apple Juice"
                      value={productForm.name}
                      onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Selling Price (₹)</label>
                      <input 
                        type="number" required
                        className="input-field h-12 font-black italic text-lg text-emerald-600"
                        placeholder="100"
                        value={productForm.pricePerUnit}
                        onChange={(e) => setProductForm({...productForm, pricePerUnit: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Safe Stock Level</label>
                      <input 
                        type="number" required
                        className="input-field h-12 font-black italic text-lg text-rose-600"
                        value={productForm.lowStockThreshold}
                        onChange={(e) => setProductForm({...productForm, lowStockThreshold: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Formula / SKU Description</label>
                    <textarea 
                      className="input-field min-h-[120px] font-medium"
                      placeholder="Define the flavor profile or manufacturing notes..."
                      value={productForm.description}
                      onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                    />
                  </div>
                  <div className="flex gap-4 pt-4">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-4 border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all font-black text-[10px] uppercase tracking-widest text-slate-500">Cancel</button>
                    <button type="submit" className="flex-[2] btn-primary py-4 font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 group">
                       Define Product SKU
                       <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Inventory;
