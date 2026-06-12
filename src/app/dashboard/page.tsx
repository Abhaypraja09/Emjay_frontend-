'use client'
import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import api from '@/services/api';
import toast from 'react-hot-toast';
import {
  IndianRupee,
  FlaskConical,
  ShoppingCart,
  Users,
  Package,
  Activity,
  CircleDot
} from 'lucide-react';

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
    <div className="flex h-screen items-center justify-center bg-[#0b101d] text-gray-400 font-bold italic">
      Loading Dashboard...
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#0b101d] text-white">
      <Sidebar />

      <main className="flex-1 lg:ml-64 p-8 overflow-y-auto">
        {/* Top Header matching user image */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center p-2 shadow-[0_0_15px_rgba(255,255,255,0.2)]">
               <img src="/Logo.jpg" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <p className="text-[10px] font-black tracking-[0.2em] text-yellow-500 uppercase flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"></span>
                Emjay Brewery Center
              </p>
              <h1 className="text-2xl font-black tracking-tight text-white">Executive <span className="text-yellow-500">Dashboard</span></h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="px-5 py-2 bg-[#121828] rounded-xl border border-white/10 text-sm font-bold text-gray-300">
               Current Month
             </div>
          </div>
        </div>

        {/* The 6 Boxes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          
          <DarkStatCard 
            title="TOTAL SALES" 
            value={stats?.totalSales} 
            prefix="₹" 
            icon={<IndianRupee className="w-5 h-5 text-yellow-500" />} 
            glowColor="shadow-[0_0_15px_rgba(234,179,8,0.2)]" 
            borderColor="border-yellow-500/30"
          />
          
          <DarkStatCard 
            title="PRODUCTION" 
            value={stats?.totalProduction} 
            icon={<FlaskConical className="w-5 h-5 text-yellow-500" />} 
            glowColor="shadow-[0_0_15px_rgba(234,179,8,0.2)]" 
            borderColor="border-yellow-500/30"
          />
          
          <DarkStatCard 
            title="PURCHASES" 
            value={stats?.totalPurchases} 
            prefix="₹" 
            icon={<ShoppingCart className="w-5 h-5 text-yellow-500" />} 
            glowColor="shadow-[0_0_15px_rgba(234,179,8,0.2)]" 
            borderColor="border-yellow-500/30"
          />

          <DarkStatCard 
            title="STAFF SALARY" 
            value={stats?.totalStaffSalary} 
            prefix="₹" 
            icon={<Users className="w-5 h-5 text-yellow-500" />} 
            glowColor="shadow-[0_0_15px_rgba(234,179,8,0.2)]" 
            borderColor="border-yellow-500/30"
          />

          <DarkStatCard 
            title="BOTTLES" 
            value={stats?.availableBottles} 
            icon={<Package className="w-5 h-5 text-emerald-400" />} 
            glowColor="shadow-[0_0_15px_rgba(52,211,153,0.2)]" 
            borderColor="border-emerald-400/30"
          />

          <DarkStatCard 
            title="CAPS" 
            value={stats?.availableCaps} 
            icon={<CircleDot className="w-5 h-5 text-blue-400" />} 
            glowColor="shadow-[0_0_15px_rgba(96,165,250,0.2)]" 
            borderColor="border-blue-400/30"
          />

        </div>
      </main>
    </div>
  );
};

const DarkStatCard = ({ title, value, icon, prefix = '', glowColor, borderColor }: any) => {
  return (
    <div className="bg-[#121828] rounded-2xl p-5 border border-white/5 shadow-xl flex flex-col justify-between min-h-[140px] hover:border-white/10 transition-colors">
      <div className={`w-10 h-10 rounded-xl bg-[#0b101d] flex items-center justify-center border ${borderColor} ${glowColor}`}>
        {icon}
      </div>
      <div className="mt-6">
        <p className="text-[10px] font-black text-gray-400 tracking-[0.1em] mb-1">{title}</p>
        <h4 className="text-2xl font-black text-white tracking-tight">
          {prefix}{typeof value === 'number' ? value.toLocaleString() : value || 0}
        </h4>
      </div>
    </div>
  );
};

export default Dashboard;
