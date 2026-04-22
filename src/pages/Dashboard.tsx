import React, { useEffect, useState } from 'react';
import api from '../api';
import { CreditCard, TrendingUp, TrendingDown, ArrowRight, Wallet, QrCode } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const [account, setAccount] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [accRes, txRes] = await Promise.all([
          api.get('/account/details'),
          api.get('/account/transactions')
        ]);
        setAccount(accRes.data);
        setTransactions(txRes.data.slice(0, 5));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse"></div>
        <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse"></div>
      </div>
    );
  }

  const chartData = [
    { balance: account?.balance * 0.8 },
    { balance: account?.balance * 0.85 },
    { balance: account?.balance * 0.75 },
    { balance: account?.balance * 0.95 },
    { balance: account?.balance }
  ];

  const quickActions = [
    { label: 'Transfer', icon: Wallet, path: '/transfer', color: 'from-indigo-500 to-indigo-600' },
    { label: 'UPI/QR', icon: QrCode, path: '/transfer', color: 'from-purple-500 to-purple-600' },
    { label: 'Analytics', icon: TrendingUp, path: '/analytics', color: 'from-emerald-500 to-teal-600' }
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      
      {/* Top Section - Balance & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Balance Card Premium */}
        <div className="lg:col-span-2 relative overflow-hidden bg-slate-900 rounded-3xl p-8 text-white shadow-xl shadow-slate-900/10">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-gradient-to-br from-indigo-500/30 to-purple-500/30 blur-3xl rounded-full pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 blur-3xl rounded-full pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <p className="text-slate-400 font-medium mb-1 flex items-center gap-2">
                 Total Available Balance
                 {account?.isFrozen && <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">FROZEN</span>}
              </p>
              <div className="text-5xl font-extrabold tracking-tight mb-6">₹{(account?.balance || 0).toLocaleString()}</div>
              <div className="flex items-center gap-3 bg-white/10 w-max px-4 py-2 rounded-xl backdrop-blur-md border border-white/10">
                <CreditCard className="w-5 h-5 text-indigo-300" />
                <span className="font-mono tracking-wider text-slate-200">{account?.accountNumber}</span>
              </div>
            </div>
            
            {/* Sparkline mini chart */}
            <div className="h-24 w-full md:w-48 shrink-0">
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={chartData}>
                   <defs>
                      <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="5%" stopColor="#818cf8" stopOpacity={0.8}/>
                         <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                      </linearGradient>
                   </defs>
                   <Area type="monotone" dataKey="balance" stroke="#818cf8" strokeWidth={3} fillOpacity={1} fill="url(#colorBalance)" />
                 </AreaChart>
               </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-rows-3 gap-3">
           {quickActions.map((action, i) => (
             <button 
               key={i} 
               onClick={() => navigate(action.path)}
               className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center gap-4 hover:shadow-md transition-all group overflow-hidden relative"
             >
               <div className={`p-3 rounded-xl bg-gradient-to-br ${action.color} shadow-sm group-hover:scale-110 transition-transform`}>
                 <action.icon className="w-5 h-5 text-white" />
               </div>
               <span className="font-bold text-slate-800 dark:text-slate-100">{action.label}</span>
               <ArrowRight className="w-4 h-4 text-slate-400 ml-auto group-hover:translate-x-1 transition-transform" />
             </button>
           ))}
        </div>
      </div>

      {/* Recent Transactions List */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800/80 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/20">
          <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-100">Recent Transactions</h3>
          <Link to="/history" className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center gap-1 transition-colors">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
          {transactions.map((tx) => (
            <div key={tx.id} className="p-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`p-3.5 rounded-2xl ${
                  tx.type === 'CREDIT' 
                    ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}>
                  {tx.type === 'CREDIT' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                </div>
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200">
                    {tx.method === 'UPI' ? 'UPI Transfer' : tx.type === 'CREDIT' ? `From: ${tx.fromAccount}` : `To: ${tx.toAccount}`}
                  </p>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                    {new Date(tx.date).toLocaleDateString()} • {tx.method}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className={`font-extrabold text-lg ${tx.type === 'CREDIT' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-200'}`}>
                  {tx.type === 'CREDIT' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                </div>
                {tx.status === 'FLAGGED' && (
                  <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Reviewing</span>
                )}
              </div>
            </div>
          ))}
          {transactions.length === 0 && (
             <div className="p-12 pl-6 text-center">
                 <div className="bg-slate-100 dark:bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                     <Wallet className="w-6 h-6 text-slate-400" />
                 </div>
                 <p className="text-slate-500 font-medium font-sm">No transactions recorded yet.</p>
             </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
