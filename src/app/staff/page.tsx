'use client'
import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import api from '@/services/api';
import toast from 'react-hot-toast';
import { 
  Plus, 
  Users, 
  UserPlus, 
  Edit, 
  Trash2, 
  Search,
  XCircle,
  ShieldCheck,
  Phone,
  Briefcase
} from 'lucide-react';
import { cn } from '@/utils/cn';

const StaffPage = () => {
  const [staff, setStaff] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<any>(null);

  const [form, setForm] = useState({
    name: '',
    role: '',
    phone: '',
    salary: '',
    aadhaar: '',
    status: 'active'
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/staff');
      setStaff(res.data);
    } catch (error) {
      toast.error('Could not load staff data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.put(`/staff/${editingItem._id}`, form);
        toast.success('Staff updated');
      } else {
        await api.post('/staff', form);
        toast.success('Staff added');
      }
      resetForm();
      setIsModalOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save record');
    }
  };

  const deleteRecord = async (id: string) => {
    if (!confirm('Are you sure you want to delete this staff member?')) return;
    try {
      await api.delete(`/staff/${id}`);
      toast.success('Removed');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const startEdit = (member: any) => {
    setEditingItem(member);
    setForm({
      name: member.name,
      role: member.role,
      phone: member.phone || '',
      salary: member.salary?.toString() || '',
      aadhaar: member.aadhaar || '',
      status: member.status || 'active'
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setForm({ name: '', role: '', phone: '', salary: '', aadhaar: '', status: 'active' });
    setEditingItem(null);
  };

  if (loading) return (
    <div className="flex h-screen bg-gray-50 items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 lg:ml-64 p-8">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
            <p className="text-sm text-gray-500 mt-1">Manage brewery employees and payroll</p>
          </div>
          <button 
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="btn-primary flex items-center gap-2"
          >
            <UserPlus className="w-5 h-5" />
            Add Employee
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <SimpleStatCard title="Total Staff" value={staff.length} icon={<Users />} />
          <SimpleStatCard title="Active Duty" value={staff.filter(s => s.status === 'active').length} icon={<ShieldCheck />} />
          <SimpleStatCard title="Payroll" value={`₹${staff.reduce((acc, s) => acc + (s.salary || 0), 0).toLocaleString()}`} icon={<Briefcase />} />
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/10">
            <h3 className="font-bold text-gray-900">Employee List</h3>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Search staff..." className="border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-sm outline-none w-64" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Phone</th>
                  <th className="px-6 py-4">Salary</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {staff.map((member: any) => (
                  <tr key={member._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                        <p className="font-bold text-gray-900">{member.name}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{member.role}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-medium">{member.phone || 'N/A'}</td>
                    <td className="px-6 py-4 font-bold text-blue-600">₹{member.salary?.toLocaleString() || '0'}</td>
                    <td className="px-6 py-4">
                        <span className={cn(
                            "px-2 py-1 rounded-md text-[10px] font-bold uppercase",
                            member.status === 'active' ? 'bg-green-50 text-green-700' : 
                            member.status === 'on-leave' ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700'
                        )}>{member.status}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => startEdit(member)} className="p-2 text-gray-400 hover:text-blue-600 transition-all"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => deleteRecord(member._id)} className="p-2 text-gray-400 hover:text-red-500 transition-all"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
            <div className="bg-white rounded-xl w-full max-w-lg z-50 relative shadow-xl overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-900">{editingItem ? 'Edit Employee' : 'Add Employee'}</h2>
                    <button onClick={() => setIsModalOpen(false)}><XCircle className="w-6 h-6 text-gray-400" /></button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-600">Full Name</label>
                            <input type="text" required className="input-field" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-600">Role</label>
                            <input type="text" required className="input-field" value={form.role} onChange={(e) => setForm({...form, role: e.target.value})} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-600">Phone</label>
                            <input type="text" className="input-field" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-600">Aadhaar/ID</label>
                            <input type="text" className="input-field" value={form.aadhaar} onChange={(e) => setForm({...form, aadhaar: e.target.value})} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-600">Monthly Salary (₹)</label>
                            <input type="number" required className="input-field text-blue-600 font-bold" value={form.salary} onChange={(e) => setForm({...form, salary: e.target.value})} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-600">Status</label>
                            <select className="input-field" value={form.status} onChange={(e) => setForm({...form, status: e.target.value})}>
                                <option value="active">Active</option>
                                <option value="on-leave">On Leave</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                    </div>
                    <button type="submit" className="w-full btn-primary py-3">Confirm Details</button>
                </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const SimpleStatCard = ({ title, value, icon }: any) => (
  <div className="card flex items-center gap-4">
    <div className="p-3 bg-gray-50 text-gray-400 rounded-lg">
      {icon}
    </div>
    <div>
        <p className="text-xs font-medium text-gray-500">{title}</p>
        <h4 className="text-xl font-bold text-gray-900">{value}</h4>
    </div>
  </div>
);

export default StaffPage;
