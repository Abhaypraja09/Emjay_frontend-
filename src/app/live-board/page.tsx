'use client'
import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from '@/components/Sidebar';
import api from '@/services/api';
import toast from 'react-hot-toast';
import { 
  Activity,
  TrendingUp,
  Package,
  FlaskConical,
  ShoppingCart,
  AlertCircle,
  RefreshCcw,
  Clock,
  ChevronRight,
  ChevronLeft,
  Calendar as CalendarIcon,
  PlusCircle,
  MinusCircle,
  Zap,
  Box,
  Search,
  Phone
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';
import { cn } from '@/utils/cn';

const LiveBoard = () => {
  const [stats, setStats] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dailyReport, setDailyReport] = useState<any>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('production');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchInitialData();
    setCurrentTime(new Date());
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
     fetchDailyReport();
  }, [selectedDate]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [statsRes, chartRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/dashboard/sales-chart')
      ]);
      setStats(statsRes.data);
      setChartData(chartRes.data);
    } catch (error: any) {
      console.error('Live Board Fetch Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDailyReport = async () => {
      try {
          setReportLoading(true);
          const dateStr = selectedDate.toISOString().split('T')[0]; // YYYY-MM-DD
          const res = await api.get(`/dashboard/daily-report?date=${dateStr}`);
          setDailyReport(res.data);
      } catch (error) {
          toast.error('Failed to fetch daily report');
      } finally {
          setReportLoading(false);
      }
  }

  const changeDate = (days: number) => {
      const newDate = new Date(selectedDate);
      newDate.setDate(newDate.getDate() + days);
      setSelectedDate(newDate);
  }

  if (loading) return (
    <div className="flex h-screen bg-gray-50 items-center justify-center">
       <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900">
      <Sidebar />
      <main className="flex-1 lg:ml-64 p-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Live Board</h1>
                <p className="text-gray-500 text-sm mt-1 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Real-time Business Feed
                </p>
            </div>

            {/* Custom Calendar UI */}
            <div className="bg-slate-900 p-1 rounded-3xl flex items-center shadow-lg">
                <button 
                    onClick={() => changeDate(-1)}
                    className="p-2.5 hover:bg-slate-800 rounded-full transition-all text-slate-400"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                
                <div className="px-6 py-2 bg-slate-900 border border-amber-500/20 rounded-2xl flex items-center gap-3 mx-1">
                    <CalendarIcon className="w-4 h-4 text-amber-500" />
                    <span className="text-base font-bold italic text-white tabular-nums">
                        {selectedDate.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                </div>

                <button 
                    onClick={() => changeDate(1)}
                    className="p-2.5 hover:bg-slate-800 rounded-full transition-all text-slate-400"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>
        </div>

        {/* Daily Stats Summary - 6 Cards Row */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
            <MetricCard 
                title="Total Sales (₹)" 
                value={dailyReport?.summary.totalSales} 
                prefix="₹" 
                color="blue" 
                icon={<TrendingUp className="w-4 h-4" />} 
            />
            <MetricCard 
                title="Product Sold (Qty)" 
                value={dailyReport?.summary.totalProductSoldQty} 
                color="indigo" 
                icon={<ShoppingCart className="w-4 h-4" />} 
                breakdown={dailyReport?.summary.salesBreakdown}
            />
            <MetricCard 
                title="Total Production" 
                value={dailyReport?.summary.totalProduced} 
                color="emerald" 
                icon={<FlaskConical className="w-4 h-4" />} 
                breakdown={dailyReport?.summary.productionBreakdown}
            />
            <MetricCard 
                title="Total Buy Bottles" 
                value={dailyReport?.summary.bottlesIn} 
                color="amber" 
                icon={<PlusCircle className="w-4 h-4" />} 
            />
            <MetricCard 
                title="Bottles Used" 
                value={dailyReport?.summary.bottlesOut} 
                color="rose" 
                icon={<MinusCircle className="w-4 h-4" />} 
            />
            <MetricCard 
                title="Total Transactions" 
                value={(dailyReport?.orders?.length || 0) + (dailyReport?.productions?.length || 0) + (dailyReport?.bottles?.length || 0)} 
                color="slate" 
                icon={<Activity className="w-4 h-4" />} 
            />
        </div>

        {/* Tabs and Search Row */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center border border-gray-200 bg-white p-2 rounded-2xl shadow-sm mb-6">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                 <button onClick={() => setActiveTab('production')} className={cn("px-5 py-2 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all flex items-center gap-2", activeTab === 'production' ? "bg-slate-900 text-white" : "bg-white text-gray-500 hover:bg-gray-50")}>
                      PRODUCTION <span className={cn("px-2 py-0.5 rounded-full text-[10px]", activeTab === 'production' ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600")}>{dailyReport?.productions?.length || 0}</span>
                 </button>
                 <button onClick={() => setActiveTab('sales')} className={cn("px-5 py-2 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all flex items-center gap-2", activeTab === 'sales' ? "bg-slate-900 text-white" : "bg-white text-gray-500 hover:bg-gray-50")}>
                      SALES <span className={cn("px-2 py-0.5 rounded-full text-[10px]", activeTab === 'sales' ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600")}>{dailyReport?.orders?.length || 0}</span>
                 </button>
                 <button onClick={() => setActiveTab('bottles')} className={cn("px-5 py-2 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all flex items-center gap-2", activeTab === 'bottles' ? "bg-slate-900 text-white" : "bg-white text-gray-500 hover:bg-gray-50")}>
                      BOTTLES <span className={cn("px-2 py-0.5 rounded-full text-[10px]", activeTab === 'bottles' ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600")}>{dailyReport?.bottles?.length || 0}</span>
                 </button>
            </div>
            <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Locate entries..." 
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-10 pr-4 py-2 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
        </div>

        {/* Tab Content Grid */}
        <div className="mb-10">
            {activeTab === 'production' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {dailyReport?.productions?.filter((p:any) => p.juiceType?.name?.toLowerCase().includes(searchQuery.toLowerCase()) || p.nameOfVerk?.toLowerCase().includes(searchQuery.toLowerCase())).map((p: any) => (
                        <div key={p._id} className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm hover:shadow-lg transition-all flex flex-col gap-5 relative overflow-hidden">
                             <div className="flex justify-between items-start">
                                 <div className="flex items-center gap-4">
                                     <div className="w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center text-white font-black text-2xl shadow-inner shadow-emerald-700/50">{p.juiceType?.name?.charAt(0) || 'P'}</div>
                                     <div>
                                         <h4 className="font-bold text-gray-900 text-lg tracking-tight">{p.juiceType?.name || 'Unknown Product'}</h4>
                                         <p className="text-xs text-gray-500 font-medium flex items-center gap-1 mt-1">
                                             <Phone className="w-3 h-3" /> {p.nameOfVerk || 'System'}
                                         </p>
                                     </div>
                                 </div>
                                 <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 text-[9px] font-black px-2.5 py-1 rounded-md uppercase tracking-widest shadow-sm">Produced</span>
                             </div>
                             
                             <div className="bg-slate-50 rounded-2xl p-4 flex items-center justify-between border border-gray-100 ml-16 relative overflow-hidden">
                                 <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-400 rounded-l-2xl" />
                                 <div className="flex items-center gap-3">
                                     <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-emerald-600"><FlaskConical className="w-4 h-4" /></div>
                                     <div>
                                         <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Quantity Made</p>
                                         <p className="text-base font-black text-gray-900">+{p.quantityProduced} units</p>
                                     </div>
                                 </div>
                                 <div className="text-right">
                                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Time</p>
                                     <p className="text-sm font-bold text-gray-700 italic">{new Date(p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                 </div>
                             </div>
                        </div>
                    ))}
                    {(!dailyReport?.productions || dailyReport.productions.length === 0) && <div className="col-span-full py-12 text-center text-gray-400 font-bold uppercase tracking-widest text-sm bg-white rounded-3xl border border-gray-200 border-dashed">No production recorded today</div>}
                </div>
            )}

            {activeTab === 'sales' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {dailyReport?.orders?.filter((o:any) => o.customerName?.toLowerCase().includes(searchQuery.toLowerCase())).map((o: any) => (
                        <div key={o._id} className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm hover:shadow-lg transition-all flex flex-col gap-5 relative overflow-hidden">
                             <div className="flex justify-between items-start">
                                 <div className="flex items-center gap-4">
                                     <div className="w-14 h-14 rounded-2xl bg-blue-500 flex items-center justify-center text-white font-black text-2xl shadow-inner shadow-blue-700/50">{o.customerName?.charAt(0) || 'C'}</div>
                                     <div className="max-w-[150px]">
                                         <h4 className="font-bold text-gray-900 text-lg tracking-tight truncate" title={o.customerName}>{o.customerName}</h4>
                                         <p className="text-xs text-gray-500 font-medium flex items-center gap-1 mt-1">
                                             <Phone className="w-3 h-3" /> Retail Customer
                                         </p>
                                     </div>
                                 </div>
                                 <span className={cn("border text-[9px] font-black px-2.5 py-1 rounded-md uppercase tracking-widest shadow-sm", o.paidAmount >= o.totalAmount ? "bg-green-50 text-green-600 border-green-100" : "bg-amber-50 text-amber-600 border-amber-100")}>
                                     {o.paidAmount >= o.totalAmount ? 'PAID' : 'DUE'}
                                 </span>
                             </div>

                             <div className="bg-slate-50 rounded-2xl p-4 flex flex-col gap-3 border border-gray-100 ml-16 relative overflow-hidden">
                                 <div className={cn("absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl", o.paidAmount >= o.totalAmount ? "bg-green-400" : "bg-amber-400")} />
                                 <div className="flex items-center justify-between">
                                     <div className="flex items-center gap-3">
                                         <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-blue-600"><ShoppingCart className="w-4 h-4" /></div>
                                         <div>
                                             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sale Amount</p>
                                             <p className="text-base font-black text-gray-900">₹{o.totalAmount.toLocaleString()}</p>
                                         </div>
                                     </div>
                                     <div className="text-right">
                                         <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Time</p>
                                         <p className="text-sm font-bold text-gray-700 italic">{new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                     </div>
                                 </div>
                                 <div className="flex gap-2 overflow-x-auto scrollbar-hide text-[10px] font-bold text-gray-600 pt-2 border-t border-gray-200/60">
                                     {o.items.map((item: any, i: number) => (
                                         <span key={i} className="bg-white px-2 py-1 rounded-md shadow-sm border border-gray-100 whitespace-nowrap">{item.juiceType?.name} x{item.quantity}</span>
                                     ))}
                                 </div>
                             </div>
                        </div>
                    ))}
                    {(!dailyReport?.orders || dailyReport.orders.length === 0) && <div className="col-span-full py-12 text-center text-gray-400 font-bold uppercase tracking-widest text-sm bg-white rounded-3xl border border-gray-200 border-dashed">No sales recorded today</div>}
                </div>
            )}

            {activeTab === 'bottles' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {dailyReport?.bottles?.filter((b:any) => b.bottleType?.toLowerCase().includes(searchQuery.toLowerCase()) || b.description?.toLowerCase().includes(searchQuery.toLowerCase())).map((b: any, i: number) => (
                        <div key={i} className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm hover:shadow-lg transition-all flex flex-col gap-5 relative overflow-hidden">
                             <div className="flex justify-between items-start">
                                 <div className="flex items-center gap-4">
                                     <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-inner", b.type === 'IN' ? "bg-amber-500 shadow-amber-700/50" : "bg-rose-500 shadow-rose-700/50")}>
                                         {b.bottleType?.charAt(0) || 'B'}
                                     </div>
                                     <div>
                                         <h4 className="font-bold text-gray-900 text-lg tracking-tight">{b.bottleType}</h4>
                                         <p className="text-xs text-gray-500 font-medium flex items-center gap-1 mt-1 truncate max-w-[150px]" title={b.description}>
                                             <Box className="w-3 h-3" /> {b.description || 'Inventory Update'}
                                         </p>
                                     </div>
                                 </div>
                                 <span className={cn("border text-[9px] font-black px-2.5 py-1 rounded-md uppercase tracking-widest shadow-sm", b.type === 'IN' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100")}>
                                     {b.type === 'IN' ? 'PURCHASED' : 'USED'}
                                 </span>
                             </div>

                             <div className="bg-slate-50 rounded-2xl p-4 flex items-center justify-between border border-gray-100 ml-16 relative overflow-hidden">
                                 <div className={cn("absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl", b.type === 'IN' ? "bg-emerald-400" : "bg-rose-400")} />
                                 <div className="flex items-center gap-3">
                                     <div className={cn("w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm", b.type === 'IN' ? "text-amber-600" : "text-rose-600")}><Package className="w-4 h-4" /></div>
                                     <div>
                                         <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Quantity</p>
                                         <p className="text-base font-black text-gray-900">{b.type === 'IN' ? '+' : '-'}{b.quantity} units</p>
                                     </div>
                                 </div>
                                 <div className="text-right">
                                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Time</p>
                                     <p className="text-sm font-bold text-gray-700 italic">{new Date(b.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                 </div>
                             </div>
                        </div>
                    ))}
                    {(!dailyReport?.bottles || dailyReport.bottles.length === 0) && <div className="col-span-full py-12 text-center text-gray-400 font-bold uppercase tracking-widest text-sm bg-white rounded-3xl border border-gray-200 border-dashed">No bottle flow recorded today</div>}
                </div>
            )}
        </div>

        {/* Quick Summary Section (Replacing Chart) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
                 <h3 className="font-bold text-gray-900 uppercase text-xs tracking-widest mb-6 flex items-center gap-2">
                     <Activity className="w-4 h-4 text-blue-600" /> Daily Efficiency
                 </h3>
                 <div className="space-y-6">
                     <div className="flex justify-between items-center">
                         <p className="text-xs font-bold text-gray-400 uppercase">Sales Conversion</p>
                         <p className="text-sm font-black text-gray-900">{(dailyReport?.summary.totalProduced > 0 ? (dailyReport?.summary.totalSales / dailyReport?.summary.totalProduced * 100).toFixed(1) : 0)}%</p>
                     </div>
                     <div className="h-px bg-gray-50 w-full" />
                     <div className="flex justify-between items-center">
                         <p className="text-xs font-bold text-gray-400 uppercase">Bottle Utilization</p>
                         <p className="text-sm font-black text-emerald-600">Optimal</p>
                     </div>
                 </div>
            </div>

            <div className="bg-slate-900 rounded-2xl p-8 shadow-xl relative overflow-hidden group">
                 <div className="relative z-10">
                    <h3 className="font-bold text-slate-400 uppercase text-xs tracking-widest mb-6">Business Health</h3>
                    <div className="flex items-end gap-4">
                        <h2 className="text-5xl font-black text-white italic tracking-tighter">Live</h2>
                        <div className="mb-2 w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                    </div>
                    <p className="text-slate-500 text-xs mt-4 font-bold uppercase tracking-widest">Feed auto-updates every 60s</p>
                 </div>
                 <Activity className="absolute -right-8 -bottom-8 w-48 h-48 text-white/5 rotate-12 group-hover:rotate-0 transition-all duration-700" />
            </div>
        </div>

      </main>
    </div>
  );
};

const MetricCard = ({ title, value, prefix = '', color, icon, breakdown }: any) => {
    const colorClasses: any = {
        blue: 'text-blue-600 bg-blue-50 border-blue-100',
        indigo: 'text-indigo-600 bg-indigo-50 border-indigo-100',
        emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100',
        amber: 'text-amber-600 bg-amber-50 border-amber-100',
        rose: 'text-rose-600 bg-rose-50 border-rose-100',
        slate: 'text-slate-600 bg-slate-50 border-slate-100',
    };

    return (
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all group flex flex-col justify-between">
            <div>
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110", colorClasses[color])}>
                    {icon}
                </div>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">{title}</p>
                <h4 className="text-xl font-bold text-gray-900 tabular-nums">
                    {prefix}{typeof value === 'number' ? value.toLocaleString() : value || '0'}
                </h4>
            </div>
            
            {breakdown && Object.keys(breakdown).length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap gap-1.5">
                    {Object.entries(breakdown).map(([name, qty]: any, i) => (
                        <span key={i} className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-gray-50 text-gray-600 border border-gray-200">
                            {name}: <span className={cn("ml-1", colorClasses[color].split(' ')[0])}>{qty}</span>
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LiveBoard;
