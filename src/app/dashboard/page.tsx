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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const statsRes = await api.get('/dashboard/stats');
      setStats(statsRes.data);
    } catch (error: any) {
      toast.error('Could not load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex h-screen bg-gray-50 items-center justify-center font-bold text-gray-400 italic">
      Loading Dashboard...
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 lg:ml-64 p-8 overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">Overview of sales and inventory for Emjay Brewery</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white border border-gray-200 px-4 py-2 rounded-lg shadow-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
              <span className="text-xs font-black text-gray-600 uppercase tracking-widest">System Live</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <SimpleStatCard title="Total Sales" value={stats?.totalSales} icon={<IndianRupee />} color="emerald" prefix="₹" />
          <SimpleStatCard title="Empty Bottles" value={stats?.availableEmptyStock} icon={<Package />} color="blue" />
          <SimpleStatCard title="Filled Bottles" value={stats?.totalFilledStock} icon={<FlaskConical />} color="blue" />
          <SimpleStatCard title="Total Profit" value={stats?.profit} icon={<TrendingUp />} color="emerald" prefix="₹" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Low Stock */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-rose-50 text-rose-600 rounded-lg"><AlertTriangle className="w-5 h-5" /></div>
                <h3 className="font-bold text-gray-900 uppercase text-sm tracking-widest">Low Stock Alerts</h3>
              </div>
              <div className="space-y-4">
                {stats?.lowStockProducts?.length > 0 ? (
                  stats.lowStockProducts.map((p: any) => (
                    <div key={p._id} className="flex items-center justify-between p-4 rounded-xl bg-rose-50/50 border border-rose-100/50 transition-all hover:bg-rose-50">
                      <div>
                        <p className="font-bold text-sm text-gray-900">{p.name}</p>
                        <p className="text-xs font-bold text-rose-600 uppercase mt-1">Critical: {p.currentStock} Units Left</p>
                      </div>
                      <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center border-2 border-dashed border-gray-100 rounded-2xl">
                    <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Inventory Levels Healthy</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Summary */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-slate-100 text-slate-600 rounded-lg"><BarChart3 className="w-5 h-5" /></div>
                <h3 className="font-bold text-gray-900 uppercase text-sm tracking-widest">Finance Summary</h3>
              </div>
              <div className="space-y-6">
                <MetadataRow label="Bottles Purchased" value={stats?.totalBottlesPurchased} />
                <div className="h-px bg-gray-50 w-full" />
                <MetadataRow label="Pending Payments" value={`₹${stats?.pendingPayments?.toLocaleString()}`} color="text-rose-600" />
                <div className="h-px bg-gray-50 w-full" />
                <MetadataRow label="Calculated ROI" value="12.5%" color="text-emerald-600" />
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
