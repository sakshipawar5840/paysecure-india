import React, { useEffect, useState } from 'react';
import api from '../api';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Layers } from 'lucide-react';
import { motion } from 'framer-motion';

const COLORS = ['#4f46e5', '#ec4899', '#14b8a6', '#f59e0b', '#8b5cf6'];

export default function Analytics() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/account/analytics');
        setData(res.data);
      } catch (err) {} finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
     return <div className="animate-pulse space-y-6">
       <div className="flex gap-6"><div className="h-32 flex-1 bg-slate-200 dark:bg-slate-800 rounded-3xl"></div><div className="h-32 flex-1 bg-slate-200 dark:bg-slate-800 rounded-3xl"></div></div>
       <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>
     </div>
  }

  const chartData = Object.entries(data?.categories || {}).map(([name, value]) => ({ name, value }));

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      
      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex items-center justify-between shadow-sm">
           <div>
              <p className="text-slate-500 font-medium mb-1 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-emerald-500" /> Total Inflow</p>
              <h2 className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">+ ₹{data?.income.toLocaleString()}</h2>
           </div>
           <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl">
               <TrendingUp className="w-8 h-8 text-emerald-500" />
           </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex items-center justify-between shadow-sm">
           <div>
              <p className="text-slate-500 font-medium mb-1 flex items-center gap-2"><TrendingDown className="w-4 h-4 text-red-500" /> Total Outflow</p>
              <h2 className="text-3xl font-extrabold text-red-600 dark:text-red-400">- ₹{data?.expense.toLocaleString()}</h2>
           </div>
           <div className="p-4 bg-red-50 dark:bg-red-500/10 rounded-2xl">
               <TrendingDown className="w-8 h-8 text-red-500" />
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {/* Categories Pie Chart */}
         <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm h-[400px] flex flex-col">
            <h3 className="font-extrabold text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-6">
              <Layers className="w-5 h-5 text-indigo-500" /> Output by Category
            </h3>
            {chartData.length > 0 ? (
                <div className="flex-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData} cx="50%" cy="50%" innerRadius={80} outerRadius={110} paddingAngle={5}
                            dataKey="value" stroke="none"
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
            ) : (
                <div className="flex-1 flex items-center justify-center text-slate-500 text-sm font-medium">No categorization data available yet.</div>
            )}
         </div>

         {/* Overview Bar Chart (Mock detailed view) */}
         <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm h-[400px] flex flex-col">
            <h3 className="font-extrabold text-lg text-slate-800 dark:text-slate-100 mb-6">Weekly Flow Pattern</h3>
            <div className="flex-1">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                        { name: 'Week 1', in: data?.income * 0.2, out: data?.expense * 0.3 },
                        { name: 'Week 2', in: data?.income * 0.4, out: data?.expense * 0.2 },
                        { name: 'Week 3', in: data?.income * 0.1, out: data?.expense * 0.4 },
                        { name: 'Week 4', in: data?.income * 0.3, out: data?.expense * 0.1 }
                    ]}>
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                        <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} formatter={(value: number) => `₹${value.toLocaleString()}`} />
                        <Bar dataKey="in" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                        <Bar dataKey="out" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
         </div>
      </div>
    </motion.div>
  );
}
