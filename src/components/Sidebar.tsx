'use client'
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  FlaskConical, 
  ShoppingCart, 
  FileText, 
  LogOut, 
  ChevronLeft, 
  ChevronRight, 
  Beer,
  Menu,
  X,
  User
} from 'lucide-react';
import { cn } from '@/utils/cn';

const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Inventory', path: '/inventory', icon: Package },
    { name: 'Production', path: '/production', icon: FlaskConical },
    { name: 'Sales', path: '/sales', icon: ShoppingCart },
    { name: 'Reports', path: '/reports', icon: FileText },
  ];

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Toggle Button (Mobile) */}
      <button 
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-indigo-600 shadow-sm"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      <aside 
        className={cn(
          "fixed top-0 left-0 h-full z-40 bg-white border-r border-slate-200 transition-all duration-300 ease-in-out lg:flex flex-col flex-shrink-0 shadow-sm",
          isCollapsed ? "w-20" : "w-64",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Brand */}
        <div className="h-24 flex items-center px-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl overflow-hidden border border-indigo-500/30 flex-shrink-0 bg-white">
              <img src="/Logo.jpg" alt="Emjay Brewery" className="w-full h-full object-contain" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="text-xl font-black text-slate-900 tracking-tighter leading-none">EMJAY</span>
                <span className="text-xs font-bold text-indigo-600 tracking-[0.2em] mt-1 uppercase">BREWERY</span>
              </div>
            )}
          </div>
        </div>

        {/* User Profile Info (When expanded) */}
        {!isCollapsed && (
          <div className="p-4 mx-4 mt-6 bg-indigo-50 rounded-2xl border border-indigo-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white border-2 border-indigo-200 overflow-hidden flex items-center justify-center">
              <User className="w-6 h-6 text-indigo-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">{user?.name || 'Admin User'}</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{user?.role || 'Administrator'}</p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 mt-8 px-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                "flex items-center gap-4 px-5 py-4 rounded-2xl transition-all group relative border border-transparent italic",
                pathname === item.path 
                  ? "bg-indigo-600 text-white shadow-2xl shadow-indigo-600/30 border-indigo-500 scale-[1.02]" 
                  : "text-slate-500 hover:text-indigo-600 hover:bg-white hover:border-slate-100 hover:shadow-sm"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5 transition-transform group-hover:scale-110",
                pathname === item.path ? "text-white" : "text-slate-400 group-hover:text-indigo-600"
              )} />
              {!isCollapsed && <span className="font-black text-[10px] uppercase tracking-[0.2em]">{item.name}</span>}
              {pathname === item.path && (
                <div className="absolute right-[-0.5rem] top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-l-full shadow-[0_0_12px_rgba(255,255,255,0.8)]" />
              )}
            </Link>
          ))}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 space-y-3 bg-slate-50/50">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex w-full items-center gap-3 px-4 py-3 rounded-2xl text-slate-400 hover:text-indigo-600 hover:bg-white border border-transparent hover:border-slate-100 transition-all font-black"
          >
            {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            {!isCollapsed && <span className="font-black text-[10px] uppercase tracking-widest italic">Minimize</span>}
          </button>
          
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-3 rounded-2xl text-rose-500 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all font-black group"
          >
            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            {!isCollapsed && <span className="font-black text-[10px] uppercase tracking-widest italic">Terminate Session</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
