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
  ArrowDownRight,
  BarChart3,
  Waves,
  Calendar
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts';
import { cn } from '@/utils/cn';
import { motion, AnimatePresence } from 'framer-motion';

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
      toast.error('Could not load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex h-screen bg-gray-50 items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <main className="flex-1 lg:ml-64 p-8 overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
           <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-500 mt-1">Overview of sales and inventory for Emjay Brewery</p>
           </div>
           <div className="flex items-center gap-3">
                <div className="bg-white border border-gray-200 px-4 py-2 rounded-lg shadow-sm flex items-center gap-2">
                    <Activity className="w-4 h-4 text-green-500" />
                    <span className="text-xs font-medium text-gray-600">System Online</span>
                </div>
           </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <SimpleStatCard title="Total Sales" value={stats?.totalSales} icon={<IndianRupee />} color="blue" prefix="₹" />
          <SimpleStatCard title="Empty Bottles" value={stats?.availableEmptyStock} icon={<Package />} color="blue" />
          <SimpleStatCard title="Filled Bottles" value={stats?.totalFilledStock} icon={<FlaskConical />} color="blue" />
          <SimpleStatCard title="Total Profit" value={stats?.profit} icon={<TrendingUp />} color="blue" prefix="₹" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sales Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col p-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 border-l-4 border-blue-600 pl-3">
                    Sales History
                  </h3>
                </div>
            </div>
            
            <div className="flex-1 w-full min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#94a3b8" 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="sales" 
                    stroke="#2563eb" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorSales)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Low Stock */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <h3 className="font-bold text-gray-900">Low Stock Alerts</h3>
              </div>
              <div className="space-y-3">
                {stats?.lowStockProducts?.length > 0 ? (
                  stats.lowStockProducts.map((p: any) => (
                    <div key={p._id} className="flex items-center justify-between p-3 rounded-lg bg-red-50 border border-red-100">
                      <div>
                        <p className="font-semibold text-sm text-gray-900">{p.name}</p>
                        <p className="text-xs text-red-600">Only {p.currentStock} left</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">All products have enough stock.</p>
                )}
              </div>
            </div>

            {/* Quick Summary */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-6">Quick Summary</h3>
              <div className="space-y-4">
                <MetadataRow label="Bottles Purchased" value={stats?.totalBottlesPurchased} />
                <MetadataRow label="Pending Payments" value={`₹${stats?.pendingPayments?.toLocaleString()}`} color="text-red-600" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const SimpleStatCard = ({ title, value, icon, color, prefix = '' }: any) => {
  return (
    <div className="card flex items-center gap-5">
      <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <h4 className="text-xl font-bold text-gray-900">
          {prefix}{typeof value === 'number' ? value.toLocaleString() : value || 0}
        </h4>
      </div>
    </div>
  );
};

const MetadataRow = ({ label, value, color = "text-gray-900" }: any) => (
    <div className="flex justify-between items-center text-sm">
        <span className="text-gray-500">{label}</span>
        <span className={`font-bold ${color}`}>{value}</span>
    </div>
)

export default Dashboard;
