import React, { useEffect, useState } from 'react';
import api from '../api';
import { Users, Lock, Unlock, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function Admin() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch (err) {} finally {
      setLoading(false);
    }
  };

  const toggleFreeze = async (userId: number) => {
    const toastId = toast.loading('Updating account status...');
    try {
        const res = await api.post(`/admin/freeze/${userId}`);
        toast.success(res.data.message, { id: toastId });
        fetchUsers();
    } catch(err: any) {
        toast.error("Failed to update status", { id: toastId });
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
       <div className="flex items-center gap-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 p-6 rounded-3xl">
           <div className="bg-red-500 p-3 rounded-full text-white">
               <ShieldAlert className="w-8 h-8" />
           </div>
           <div>
               <h2 className="text-xl font-extrabold text-red-700 dark:text-red-400">Security Command Center</h2>
               <p className="text-sm text-red-600 dark:text-red-300 font-medium mt-1">Authorized Admins Only. Monitor platform activity and isolate threats.</p>
           </div>
       </div>

       <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
           <div className="p-6 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/20 flex items-center gap-3">
               <Users className="w-5 h-5 text-indigo-500" />
               <h3 className="font-extrabold text-lg text-slate-800 dark:text-slate-100">Registered Accounts Master List</h3>
           </div>
           
           <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                   <thead>
                       <tr className="bg-slate-50/50 dark:bg-slate-800/50 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                           <th className="p-4 font-bold">User ID</th>
                           <th className="p-4 font-bold">Name & Email</th>
                           <th className="p-4 font-bold">Account Ext.</th>
                           <th className="p-4 font-bold text-right">Balance</th>
                           <th className="p-4 font-bold text-center">Status</th>
                           <th className="p-4 font-bold text-center">Action</th>
                       </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-sm">
                       {users.map((u) => (
                           <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                               <td className="p-4 font-mono font-medium text-slate-400">USR-{u.id}</td>
                               <td className="p-4">
                                   <div className="font-bold text-slate-800 dark:text-slate-200">{u.name}</div>
                                   <div className="text-xs text-slate-500">{u.email}</div>
                               </td>
                               <td className="p-4 font-mono text-slate-600 dark:text-slate-400">{u.accountNumber || 'N/A'}</td>
                               <td className="p-4 text-right font-bold text-slate-800 dark:text-slate-200">
                                   {u.balance !== undefined ? `₹${u.balance.toLocaleString()}` : 'N/A'}
                               </td>
                               <td className="p-4 text-center">
                                   {u.role === 'ADMIN' ? (
                                       <span className="px-3 py-1 bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 rounded-full text-xs font-bold">SYSTEM</span>
                                   ) : u.isFrozen ? (
                                       <span className="px-3 py-1 bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400 rounded-full text-xs font-bold">FROZEN</span>
                                   ) : (
                                       <span className="px-3 py-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 rounded-full text-xs font-bold">ACTIVE</span>
                                   )}
                               </td>
                               <td className="p-4 text-center">
                                   {u.role !== 'ADMIN' && (
                                       <button 
                                          onClick={() => toggleFreeze(u.id)}
                                          className={`p-2 rounded-xl transition-all ${u.isFrozen ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
                                          title={u.isFrozen ? 'Unfreeze Account' : 'Freeze Account'}
                                       >
                                           {u.isFrozen ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                                       </button>
                                   )}
                               </td>
                           </tr>
                       ))}
                   </tbody>
               </table>
           </div>
       </div>
    </motion.div>
  );
}
