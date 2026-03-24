'use client'
import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import api from '@/services/api';
import toast from 'react-hot-toast';
import { 
  TrendingUp, 
  FlaskConical, 
  Package, 
  ShoppingCart, 
  AlertTriangle, 
  IndianRupee,
  Activity,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts';
import { cn } from '@/utils/cn';

const Dashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [chartData, setChartData] = useState<any>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, chartRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/dashboard/sales-chart')
      ]);
      setStats(statsRes.data);
      setChartData(chartRes.data);
    } catch (error: any) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 lg:ml-64 p-8 overflow-y-auto">
        <div className="animate-pulse space-y-8">
          <div className="flex justify-between items-center">
            <div className="space-y-3">
              <div className="h-8 w-64 bg-slate-200 rounded-lg"></div>
              <div className="h-4 w-48 bg-slate-100 rounded-md"></div>
            </div>
            <div className="h-10 w-32 bg-slate-200 rounded-xl"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-white rounded-2xl border border-slate-200"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-96 bg-white rounded-2xl border border-slate-200"></div>
            <div className="space-y-6">
              <div className="h-48 bg-white rounded-2xl border border-slate-200"></div>
              <div className="h-40 bg-white rounded-2xl border border-slate-200"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <Sidebar />
      
      <main className="flex-1 lg:ml-64 p-8 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter italic underline decoration-indigo-500 underline-offset-8">Financial Overview</h1>
            <p className="text-slate-500 mt-4 font-semibold uppercase tracking-widest text-[10px]">Real-time statistics for Emjay Brewery</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-indigo-600 font-bold text-xs uppercase tracking-widest transition-all shadow-sm">
            <Activity className="w-4 h-4" />
            Live Feed
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Total Sales" 
            value={stats?.totalSales} 
            icon={<ShoppingCart className="text-emerald-500" />} 
            trend="+12.5%" 
            prefix="₹"
            color="emerald"
          />
          <StatCard 
            title="Available Empty Stock" 
            value={stats?.availableEmptyStock} 
            icon={<Package className="text-indigo-500" />} 
            trend="-2.4%"
            color="indigo"
          />
           <StatCard 
            title="Total Filled stock" 
            value={stats?.totalFilledStock} 
            icon={<FlaskConical className="text-purple-500" />} 
            trend="+5.1%"
            color="purple"
          />
          <StatCard 
            title="Estimated Profit" 
            value={stats?.profit} 
            icon={<IndianRupee className="text-amber-500" />} 
            trend="+8.2%"
            prefix="₹"
            color="amber"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart */}
          <div className="lg:col-span-2 card p-6 min-h-[400px] flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg flex items-center gap-2 uppercase tracking-tight italic">
                <TrendingUp className="w-5 h-5 text-indigo-500" />
                Sales Performance
              </h3>
              <select className="bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold px-3 py-1.5 text-slate-600 focus:ring-1 focus:ring-indigo-500 outline-none">
                <option>Last 30 Days</option>
                <option>Last 7 Days</option>
              </select>
            </div>
            <div className="flex-1 w-full">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#94a3b8" 
                    fontSize={10} 
                    fontWeight="bold"
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  />
                  <YAxis stroke="#94a3b8" fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                    itemStyle={{ color: '#1e293b', fontWeight: 'bold' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="sales" 
                    stroke="#6366f1" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorSales)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Side Info Cards */}
          <div className="space-y-6">
            <div className="card p-6 border-amber-200 bg-amber-50">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="text-amber-600 w-6 h-6" />
                <h3 className="font-bold uppercase tracking-tight text-amber-900">Low Stock Alerts</h3>
              </div>
              <div className="space-y-4">
                {stats?.lowStockProducts?.length > 0 ? (
                  stats.lowStockProducts.map((p: any) => (
                    <div key={p._id} className="flex items-center justify-between p-3 rounded-xl bg-white border border-amber-200 shadow-sm">
                      <div>
                        <p className="font-bold text-sm text-slate-800">{p.name}</p>
                        <p className="text-[10px] font-bold text-amber-700 uppercase">Only {p.currentStock} units left</p>
                      </div>
                      <span className="px-2 py-1 rounded bg-rose-500 text-white text-[9px] font-black uppercase tracking-widest">Critical</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500 italic font-medium">No low stock alerts at the moment.</p>
                )}
              </div>
            </div>

            <div className="card p-6 bg-indigo-50 border-indigo-100">
              <h3 className="font-bold uppercase tracking-tight text-indigo-900 mb-4 italic">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Total Purchase Volume</span>
                  <span className="text-indigo-900 font-black italic">{stats?.totalBottlesPurchased}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Pending Payments</span>
                  <span className="text-rose-600 font-black italic">₹{stats?.pendingPayments?.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const StatCard = ({ title, value, icon, trend, prefix = '', color = 'indigo' }: any) => {
  const isPositive = trend.startsWith('+');
  return (
    <div className="card group hover:border-indigo-500/30 transition-all cursor-default bg-white">
      <div className="flex items-start justify-between">
        <div className={`p-4 rounded-2xl bg-slate-50 border border-slate-100 transition-colors group-hover:border-${color}-500/30 group-hover:scale-110 transition-transform`}>
          {React.cloneElement(icon, { className: `w-6 h-6 text-${color}-600` })}
        </div>
        <div className={cn(
          "flex items-center gap-1 text-[10px] font-black uppercase px-2 py-1 rounded-full",
          isPositive ? "text-emerald-600 bg-emerald-500/10" : "text-rose-600 bg-rose-500/10"
        )}>
          {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {trend}
        </div>
      </div>
      <div className="mt-6">
        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest italic">{title}</p>
        <h4 className="text-3xl font-black text-slate-900 mt-1 tracking-tighter">
          {prefix}{typeof value === 'number' ? value.toLocaleString() : value}
        </h4>
      </div>
    </div>
  );
};

export default Dashboard;
