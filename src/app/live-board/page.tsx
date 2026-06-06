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
  Box
} from 'lucide-react';
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

        {/* Daily Stats Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
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
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-2 scrollbar-hide">
             <button onClick={() => setActiveTab('production')} className={cn("px-5 py-2 rounded-full text-[11px] font-bold whitespace-nowrap transition-all flex items-center gap-2 border", activeTab === 'production' ? "bg-slate-900 text-white border-slate-900" : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50")}>
                  PRODUCTION <span className={cn("px-2 py-0.5 rounded-full text-[10px]", activeTab === 'production' ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600")}>{dailyReport?.productions?.length || 0}</span>
             </button>
             <button onClick={() => setActiveTab('sales')} className={cn("px-5 py-2 rounded-full text-[11px] font-bold whitespace-nowrap transition-all flex items-center gap-2 border", activeTab === 'sales' ? "bg-slate-900 text-white border-slate-900" : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50")}>
                  SALES <span className={cn("px-2 py-0.5 rounded-full text-[10px]", activeTab === 'sales' ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600")}>{dailyReport?.orders?.length || 0}</span>
             </button>
             <button onClick={() => setActiveTab('bottles')} className={cn("px-5 py-2 rounded-full text-[11px] font-bold whitespace-nowrap transition-all flex items-center gap-2 border", activeTab === 'bottles' ? "bg-slate-900 text-white border-slate-900" : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50")}>
                  BOTTLES <span className={cn("px-2 py-0.5 rounded-full text-[10px]", activeTab === 'bottles' ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600")}>{dailyReport?.bottles?.length || 0}</span>
             </button>
        </div>

        {/* Tab Content Grid */}
        <div className="mb-10">
            {activeTab === 'production' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {dailyReport?.productions?.map((p: any) => (
                        <div key={p._id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all">
                             <div className="flex justify-between items-start mb-5">
                                 <div className="flex items-center gap-3">
                                     <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 font-black text-xl border border-emerald-100">{p.juiceType?.name?.charAt(0) || 'P'}</div>
                                     <div>
                                         <h4 className="font-bold text-gray-900 text-base">{p.juiceType?.name || 'Unknown Product'}</h4>
                                         <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">{p.nameOfVerk}</p>
                                     </div>
                                 </div>
                                 <span className="bg-emerald-100 text-emerald-700 text-[9px] font-bold px-2 py-1 rounded uppercase tracking-wider">Produced</span>
                             </div>
                             <div className="bg-gray-50 rounded-xl p-3 flex justify-between items-center border border-gray-100">
                                 <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Quantity</span>
                                 <span className="text-xl font-black text-emerald-600">+{p.quantityProduced}</span>
                             </div>
                        </div>
                    ))}
                    {!dailyReport?.productions?.length && <div className="col-span-full py-12 text-center text-gray-400 font-bold uppercase tracking-widest text-sm bg-white rounded-xl border border-gray-200 border-dashed">No production recorded today</div>}
                </div>
            )}

            {activeTab === 'sales' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {dailyReport?.orders?.map((o: any) => (
                        <div key={o._id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all">
                             <div className="flex justify-between items-start mb-5">
                                 <div className="flex items-center gap-3">
                                     <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-black text-xl border border-blue-100">{o.customerName?.charAt(0) || 'C'}</div>
                                     <div className="max-w-[150px]">
                                         <h4 className="font-bold text-gray-900 text-base truncate" title={o.customerName}>{o.customerName}</h4>
                                         <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">{new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                     </div>
                                 </div>
                                 <span className={cn("text-[9px] font-bold px-2 py-1 rounded uppercase tracking-wider", o.paidAmount >= o.totalAmount ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700")}>
                                     {o.paidAmount >= o.totalAmount ? 'Paid' : 'Due'}
                                 </span>
                             </div>
                             <div className="bg-gray-50 rounded-xl p-3 flex justify-between items-center border border-gray-100">
                                 <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Amount</span>
                                 <span className="text-xl font-black text-blue-600">₹{o.totalAmount.toLocaleString()}</span>
                             </div>
                             <div className="mt-3 text-[10px] text-gray-500 font-bold flex gap-2 overflow-x-auto scrollbar-hide">
                                 {o.items.map((item: any, i: number) => (
                                     <span key={i} className="bg-gray-100 px-2 py-1 rounded-md whitespace-nowrap">{item.juiceType?.name} x{item.quantity}</span>
                                 ))}
                             </div>
                        </div>
                    ))}
                    {!dailyReport?.orders?.length && <div className="col-span-full py-12 text-center text-gray-400 font-bold uppercase tracking-widest text-sm bg-white rounded-xl border border-gray-200 border-dashed">No sales recorded today</div>}
                </div>
            )}

            {activeTab === 'bottles' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {dailyReport?.bottles?.map((b: any, i: number) => (
                        <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all">
                             <div className="flex justify-between items-start mb-5">
                                 <div className="flex items-center gap-3">
                                     <div className={cn("w-12 h-12 rounded-full flex items-center justify-center font-black text-xl border", b.type === 'IN' ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-rose-50 text-rose-600 border-rose-100")}>
                                         {b.bottleType?.charAt(0) || 'B'}
                                     </div>
                                     <div>
                                         <h4 className="font-bold text-gray-900 text-base">{b.bottleType}</h4>
                                         <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5 truncate max-w-[120px]">{b.description || 'Inventory Update'}</p>
                                     </div>
                                 </div>
                                 <span className={cn("text-[9px] font-bold px-2 py-1 rounded uppercase tracking-wider", b.type === 'IN' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
                                     {b.type === 'IN' ? 'Purchased' : 'Used'}
                                 </span>
                             </div>
                             <div className="bg-gray-50 rounded-xl p-3 flex justify-between items-center border border-gray-100">
                                 <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Quantity</span>
                                 <span className={cn("text-xl font-black", b.type === 'IN' ? "text-amber-600" : "text-rose-600")}>
                                     {b.type === 'IN' ? '+' : '-'}{b.quantity}
                                 </span>
                             </div>
                        </div>
                    ))}
                    {!dailyReport?.bottles?.length && <div className="col-span-full py-12 text-center text-gray-400 font-bold uppercase tracking-widest text-sm bg-white rounded-xl border border-gray-200 border-dashed">No bottle flow recorded today</div>}
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

            <div className="bg-slate-900 rounded-xl p-8 shadow-xl relative overflow-hidden group">
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
        blue: 'text-blue-600 bg-blue-50',
        indigo: 'text-indigo-600 bg-indigo-50',
        emerald: 'text-emerald-600 bg-emerald-50',
        amber: 'text-amber-600 bg-amber-50',
        rose: 'text-rose-600 bg-rose-50'
    };

    return (
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between">
            <div>
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mb-3 transition-transform group-hover:scale-110", colorClasses[color])}>
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
