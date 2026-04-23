'use client'
import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import api from '@/services/api';
import toast from 'react-hot-toast';
import {
    Plus,
    Trash2,
    History,
    FlaskConical,
    Package,
    XCircle,
    ClipboardList,
    ArrowUpRight,
    ArrowDownLeft,
    ChevronDown,
    Database,
    AlertCircle,
    Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';
import MonthYearFilter from '@/components/MonthYearFilter';

const Production = () => {
    const [currentTab, setCurrentTab] = useState<'ledger' | 'inventory'>('ledger');
    const [inventorySubTab, setInventorySubTab] = useState<'Products' | 'Empty Bottles'>('Products');

    const [products, setProducts] = useState<any[]>([]);
    const [productions, setProductions] = useState<any[]>([]);
    const [bottleStock, setBottleStock] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    // Production Ledger State
    const [isProductionModalOpen, setIsProductionModalOpen] = useState(false);
    const [ledgerData, setLedgerData] = useState<any[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<string>('');
    const [productSearch, setProductSearch] = useState('');
    const [ledgerLoading, setLedgerLoading] = useState(false);
    const [productionForm, setProductionForm] = useState({
        date: new Date().toISOString().split('T')[0],
        juiceType: '',
        quantityProduced: '',
        nameOfVerk: '',
        openingBalance: '0'
    });

    // Inventory Management State
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [productForm, setProductForm] = useState({
        name: '',
        size: '',
        pricePerUnit: '',
        currentStock: '0',
        minStock: '10'
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [itemRes, bottleRes, prodRes] = await Promise.all([
                api.get('/products'),
                api.get('/bottles/stock', { params: { month: selectedMonth, year: selectedYear } }),
                api.get('/production', { params: { month: selectedMonth, year: selectedYear } })
            ]);
            setProducts(itemRes.data);
            setBottleStock(bottleRes.data);
            setProductions(prodRes.data);

            if (itemRes.data.length > 0 && !selectedProduct) {
                setSelectedProduct(itemRes.data[0]._id);
            }
        } catch (error) {
            toast.error('Could not load data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInitialData();
    }, [selectedMonth, selectedYear]);

    const fetchLedger = async (productId: string) => {
        if (!productId) return;
        setLedgerLoading(true);
        try {
            const res = await api.get('/reports/production-stock', {
                params: { productId, month: selectedMonth, year: selectedYear }
            });
            const sorted = res.data.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
            setLedgerData(sorted);
        } catch (error) {
            toast.error('Failed to load stock report');
        } finally {
            setLedgerLoading(false);
        }
    };

    useEffect(() => {
        if (selectedProduct && currentTab === 'ledger') {
            fetchLedger(selectedProduct);
        }
    }, [selectedProduct, currentTab, selectedMonth, selectedYear]);

    const handleProductionSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/production', productionForm);
            toast.success('Production entry added');
            setIsProductionModalOpen(false);
            setProductionForm({ date: new Date().toISOString().split('T')[0], juiceType: '', quantityProduced: '', nameOfVerk: '', openingBalance: '0' });
            fetchInitialData();
            if (productionForm.juiceType === selectedProduct) fetchLedger(selectedProduct);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to save entry');
        }
    };

    const handleProductSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/products', productForm);
            toast.success('Product added successfully');
            setIsProductModalOpen(false);
            setProductForm({ name: '', size: '', pricePerUnit: '', currentStock: '0', minStock: '10' });
            fetchInitialData();
        } catch (error) {
            toast.error('Failed to add product');
        }
    };

    if (loading) return <div className="flex h-screen bg-white items-center justify-center font-bold text-gray-400">Loading...</div>;

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <main className="flex-1 lg:ml-64 p-6 md:p-10">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Production & Inventory</h1>
                        <p className="text-gray-500 text-sm mt-1">Manage daily production and stock levels</p>
                    </div>
                    <div className="flex flex-col md:flex-row items-center gap-4">
                        <MonthYearFilter
                            selectedMonth={selectedMonth}
                            selectedYear={selectedYear}
                            onFilterChange={(m, y) => { setSelectedMonth(m); setSelectedYear(y); }}
                        />
                        <div className="flex gap-3">
                            {currentTab === 'ledger' ? (
                                <button
                                    onClick={() => setIsProductionModalOpen(true)}
                                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/10 active:scale-95 text-sm"
                                >
                                    <Plus className="w-5 h-5" />
                                    New Production
                                </button>
                            ) : (
                                inventorySubTab === 'Products' && (
                                    <button
                                        onClick={() => setIsProductModalOpen(true)}
                                        className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/10 active:scale-95 text-sm"
                                    >
                                        <Plus className="w-5 h-5" />
                                        Add Product
                                    </button>
                                )
                            )}
                        </div>
                    </div>
                </div>

                {/* Top Level Tabs */}
                <div className="flex bg-white p-1 rounded-xl border border-gray-200 w-fit mb-10 shadow-sm">
                    <button
                        onClick={() => setCurrentTab('ledger')}
                        className={cn(
                            "px-8 py-2.5 rounded-lg text-xs font-semibold transition-all",
                            currentTab === 'ledger' ? "bg-blue-600 text-white shadow-md" : "text-gray-500 hover:text-gray-900"
                        )}
                    >
                        Production Ledger
                    </button>
                    <button
                        onClick={() => setCurrentTab('inventory')}
                        className={cn(
                            "px-8 py-2.5 rounded-lg text-xs font-semibold transition-all",
                            currentTab === 'inventory' ? "bg-blue-600 text-white shadow-md" : "text-gray-500 hover:text-gray-900"
                        )}
                    >
                        Stock Inventory
                    </button>
                </div>

                {currentTab === 'ledger' ? (
                    <>
                        <div className="flex flex-col lg:flex-row gap-6 mb-10 items-start">
                            {/* Compact Total Production Card */}
                            <div className="w-full lg:w-48 shrink-0 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Total Produced</p>
                                <h3 className="text-xl font-bold text-gray-900 leading-none">
                                    {productions.reduce((acc, p) => acc + (p.quantityProduced || 0), 0)}
                                    <span className="text-[10px] font-normal text-gray-400 ml-1">Units</span>
                                </h3>
                            </div>

                            {/* Product Selector Scroll */}
                            <div className="flex-1 w-full overflow-hidden">
                                <div className="flex overflow-x-auto gap-3 pb-4 no-scrollbar">
                                    {products
                                        .filter(p => !productSearch || p.name.toLowerCase().includes(productSearch.toLowerCase()))
                                        .map(p => (
                                            <button
                                                key={p._id}
                                                onClick={() => setSelectedProduct(p._id)}
                                                className={cn(
                                                    "shrink-0 w-32 p-3 rounded-xl border flex flex-col justify-between transition-all",
                                                    selectedProduct === p._id ? "bg-white border-blue-600 shadow-md ring-1 ring-blue-600" : "bg-white border-gray-200 hover:border-blue-300"
                                                )}
                                            >
                                                <p className="text-[9px] font-bold text-gray-400 uppercase mb-1 truncate text-left">{p.name}</p>
                                                <div className="flex items-center justify-between">
                                                    <h3 className="text-lg font-bold text-gray-900 leading-none">{p.currentStock || 0}</h3>
                                                    <FlaskConical className={cn(
                                                        "w-3 h-3",
                                                        selectedProduct === p._id ? "text-blue-600" : "text-gray-300"
                                                    )} />
                                                </div>
                                            </button>
                                        ))}
                                </div>
                            </div>
                        </div>

                        {/* Main Ledger Table */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Database className="w-5 h-5" /></div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-lg">
                                            {products.find(p => p._id === selectedProduct)?.name} Ledger
                                        </h3>
                                        <p className="text-xs text-gray-400 font-medium">Daily stock flow analysis</p>
                                    </div>
                                </div>
                                {ledgerData.length > 0 && (
                                    <div className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-100">
                                        <p className="text-[10px] font-bold uppercase">Balance</p>
                                        <p className="text-lg font-bold">{ledgerData[ledgerData.length - 1].closingStock} Units</p>
                                    </div>
                                )}
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 text-gray-500 text-[10px] font-bold uppercase tracking-wider h-12 border-b border-gray-100">
                                        <tr>
                                            <th className="px-8 py-3">Date</th>
                                            <th className="px-8 py-3 text-center">Opening</th>
                                            <th className="px-8 py-3 text-center text-blue-600">Production (+)</th>
                                            <th className="px-8 py-3 text-center text-red-600">Sales (-)</th>
                                            <th className="px-8 py-3 text-center">Closing Balance</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {ledgerLoading ? (
                                            <tr><td colSpan={5} className="p-16 text-center text-gray-400 font-medium animate-pulse">Loading Ledger...</td></tr>
                                        ) : ledgerData.length === 0 ? (
                                            <tr><td colSpan={5} className="p-16 text-center text-gray-400">No records found.</td></tr>
                                        ) : (
                                            ledgerData.map((row, idx) => (
                                                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-8 py-4">
                                                        <p className="font-semibold text-gray-700 text-sm">
                                                            {new Date(row.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                        </p>
                                                    </td>
                                                    <td className="px-8 py-4 text-center text-sm font-medium text-gray-500">{row.openingStock}</td>
                                                    <td className="px-8 py-4 text-center">
                                                        <span className="text-blue-600 font-bold text-sm">+{row.production}</span>
                                                    </td>
                                                    <td className="px-8 py-4 text-center">
                                                        <span className="text-red-600 font-bold text-sm">-{row.sales}</span>
                                                    </td>
                                                    <td className="px-8 py-4 text-center">
                                                        <span className="px-3 py-1 bg-gray-900 text-white rounded font-bold text-sm">
                                                            {row.closingStock}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="space-y-8">
                        {/* Inventory Sub-Tabs */}
                        <div className="flex bg-gray-200/50 p-1 rounded-xl w-fit border border-gray-200">
                            {['Products', 'Empty Bottles'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setInventorySubTab(tab as any)}
                                    className={cn(
                                        "px-6 py-1.5 rounded-lg text-xs font-semibold transition-all",
                                        inventorySubTab === tab ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                                    )}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {inventorySubTab === 'Products' ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                {products.map(p => (
                                    <div key={p._id} className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                                                <FlaskConical className="w-4 h-4" />
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">Stock</p>
                                                <p className={cn(
                                                    "text-lg font-bold leading-none",
                                                    p.currentStock <= p.minStock ? "text-red-500" : "text-gray-900"
                                                )}>{p.currentStock}</p>
                                            </div>
                                        </div>
                                        <h3 className="text-sm font-bold text-gray-900 truncate" title={p.name}>{p.name}</h3>
                                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                                            <p className="text-[10px] font-bold text-gray-900">₹{p.pricePerUnit}</p>
                                            {p.currentStock <= p.minStock && (
                                                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" title="Low Stock" />
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-8">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Empty Bottles</p>
                                        <h3 className="text-xl font-bold text-gray-900 leading-none">{bottleStock?.availableEmptyBottles || 0}</h3>
                                    </div>
                                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Stock Value</p>
                                        <h3 className="text-xl font-bold text-gray-900 leading-none">₹{bottleStock?.totalValue?.toLocaleString() || 0}</h3>
                                    </div>
                                </div>

                                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                    <div className="p-6 border-b border-gray-100 flex items-center gap-3">
                                        <div className="p-2 bg-gray-50 text-gray-400 rounded-lg"><History className="w-5 h-5" /></div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-lg">Purchase History</h3>
                                            <p className="text-xs text-gray-400 font-medium">Tracking bottle acquisitions</p>
                                        </div>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-gray-50 text-gray-500 text-[10px] font-bold uppercase tracking-wider h-12 border-b border-gray-100">
                                                <tr>
                                                    <th className="px-8 py-3">Date</th>
                                                    <th className="px-8 py-3">Type</th>
                                                    <th className="px-8 py-3">Supplier</th>
                                                    <th className="px-8 py-3 text-center">Quantity</th>
                                                    <th className="px-8 py-3 text-right">Price</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {bottleStock?.history?.map((h: any, i: number) => (
                                                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-8 py-4 text-gray-500 font-medium">
                                                            {new Date(h.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                        </td>
                                                        <td className="px-8 py-4 font-bold text-gray-800 text-xs">{h.type}</td>
                                                        <td className="px-8 py-4 text-gray-600 text-xs font-medium uppercase tracking-tight">{h.supplier || 'Internal'}</td>
                                                        <td className="px-8 py-4 text-center">
                                                            <span className="text-blue-600 font-bold">+{h.quantity}</span>
                                                        </td>
                                                        <td className="px-8 py-4 text-right font-bold text-gray-900">₹{h.costPerUnit}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Modals */}
                <AnimatePresence>
                    {isProductionModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsProductionModalOpen(false)} />
                            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-2xl w-full max-w-lg z-50 relative shadow-xl overflow-hidden">
                                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                                    <h2 className="text-xl font-bold text-gray-900">New Production Entry</h2>
                                    <button onClick={() => setIsProductionModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors"><XCircle className="w-6 h-6" /></button>
                                </div>

                                <form onSubmit={handleProductionSubmit} className="p-6 space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500">Date</label>
                                            <input type="date" required className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm font-semibold outline-none focus:border-blue-500" value={productionForm.date} onChange={e => setProductionForm({ ...productionForm, date: e.target.value })} />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500">Product</label>
                                            <select required className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm font-semibold outline-none focus:border-blue-500" value={productionForm.juiceType} onChange={e => setProductionForm({ ...productionForm, juiceType: e.target.value })}>
                                                <option value="">Select...</option>
                                                {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500">Quantity (Units)</label>
                                            <input type="number" required className="w-full bg-blue-50 border border-blue-100 rounded-lg px-4 py-2 text-lg font-bold text-blue-600 outline-none focus:border-blue-500" placeholder="0" value={productionForm.quantityProduced} onChange={e => setProductionForm({ ...productionForm, quantityProduced: e.target.value })} />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500">Batch Name</label>
                                            <input type="text" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm font-semibold outline-none focus:border-blue-500" placeholder="Batch A" value={productionForm.nameOfVerk} onChange={e => setProductionForm({ ...productionForm, nameOfVerk: e.target.value })} />
                                        </div>
                                    </div>

                                    <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold uppercase tracking-wider shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all">
                                        Save Record
                                    </button>
                                </form>
                            </motion.div>
                        </div>
                    )}

                    {isProductModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsProductModalOpen(false)} />
                            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-2xl w-full max-w-lg z-50 relative shadow-xl overflow-hidden">
                                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                                    <h2 className="text-xl font-bold text-gray-900">Add New Product</h2>
                                    <button onClick={() => setIsProductModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors"><XCircle className="w-6 h-6" /></button>
                                </div>

                                <form onSubmit={handleProductSubmit} className="p-6 space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500">Product Name</label>
                                        <input type="text" required className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm font-semibold outline-none focus:border-blue-500" placeholder="Classic Juice" value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500">Size (ml)</label>
                                            <input type="number" required className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm font-semibold outline-none focus:border-blue-500" placeholder="500" value={productForm.size} onChange={e => setProductForm({ ...productForm, size: e.target.value })} />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500">MRP (₹)</label>
                                            <input type="number" required className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm font-bold outline-none focus:border-blue-500" placeholder="0" value={productForm.pricePerUnit} onChange={e => setProductForm({ ...productForm, pricePerUnit: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500">Initial Stock</label>
                                            <input type="number" required className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm font-semibold" value={productForm.currentStock} onChange={e => setProductForm({ ...productForm, currentStock: e.target.value })} />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-red-500">Low Stock Alert at</label>
                                            <input type="number" required className="w-full bg-red-50 border border-red-100 rounded-lg px-4 py-2 text-sm font-bold text-red-600 outline-none" value={productForm.minStock} onChange={e => setProductForm({ ...productForm, minStock: e.target.value })} />
                                        </div>
                                    </div>
                                    <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold uppercase tracking-wider shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all">Create Product</button>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

            </main>
        </div>
    );
};

export default Production;
