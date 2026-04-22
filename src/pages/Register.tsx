import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { useTheme } from '../context/ThemeContext';
import { Shield, Mail, Lock, User, CheckCircle2, ArrowRight, Sun, Moon, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/register', { name, email, password });
      toast.success("Account created successfully!");
      navigate('/login');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = () => {
    if (password.length === 0) return 0;
    if (password.length <= 4) return 25;
    if (password.length <= 8) return 50;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/) && password.match(/[0-9]/)) return 100;
    return 75;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans relative overflow-hidden transition-colors">
      
      {/* Back Arrow Toggle */}
      <div className="absolute top-6 left-6 z-50">
        <Link 
          to="/login"
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 backdrop-blur-md shadow-sm border border-slate-200/50 dark:border-slate-800/50 transition-all text-sm font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </Link>
      </div>

      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-50">
        <button onClick={toggleTheme} className="p-3 rounded-full hover:bg-white/50 dark:hover:bg-slate-800/50 text-slate-500 dark:text-slate-400 backdrop-blur-md shadow-sm border border-slate-200/50 dark:border-slate-800/50 transition-all">
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>

      {/* Background Orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/20 dark:bg-emerald-600/20 blur-[120px] rounded-full pointer-events-none mix-blend-multiply"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/20 dark:bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none mix-blend-multiply"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-3xl py-10 px-8 shadow-2xl rounded-3xl border border-white/20 dark:border-slate-700/50"
        >
         <div className="flex justify-center mb-8">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-4 rounded-2xl shadow-lg shadow-emerald-500/30">
              <Shield className="h-10 w-10 text-white" />
            </div>
          </div>
          
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Join PaySecure India</h2>
            <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">Open your future-ready account today</p>
          </div>
          
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Legal Full Name</label>
              <div className="relative">
                 <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                   <User className="h-5 w-5 text-slate-400" />
                 </div>
                 <input
                   type="text" required
                   className="block w-full pl-11 pr-4 py-3 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 dark:text-white transition-all placeholder:text-slate-400"
                   value={name} onChange={(e) => setName(e.target.value)}
                 />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Email Address</label>
              <div className="relative">
                 <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                   <Mail className="h-5 w-5 text-slate-400" />
                 </div>
                 <input
                   type="email" required
                   className="block w-full pl-11 pr-4 py-3 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 dark:text-white transition-all placeholder:text-slate-400"
                   value={email} onChange={(e) => setEmail(e.target.value)}
                 />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Create Password</label>
              <div className="relative">
                 <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                   <Lock className="h-5 w-5 text-slate-400" />
                 </div>
                 <input
                   type="password" required
                   className="block w-full pl-11 pr-4 py-3 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 dark:text-white transition-all placeholder:text-slate-400"
                   value={password} onChange={(e) => setPassword(e.target.value)}
                 />
                 {password && (
                    <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                      <CheckCircle2 className={`h-5 w-5 transition-colors ${getPasswordStrength() === 100 ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-600'}`} />
                    </div>
                 )}
              </div>
              <div className="mt-2 h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${getPasswordStrength() <= 25 ? 'bg-red-500' : getPasswordStrength() <= 50 ? 'bg-amber-500' : getPasswordStrength() <= 75 ? 'bg-indigo-500' : 'bg-emerald-500'}`} 
                    style={{ width: `${getPasswordStrength()}%` }}
                  ></div>
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-emerald-500/30 text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all disabled:opacity-70 mt-4"
            >
              {loading ? 'Creating Account...' : 'Submit Original Application'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
          
          <div className="mt-8 text-center border-t border-slate-100 dark:border-slate-800 pt-6">
            <Link to="/login" className="text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500">
              Return to secure Sign In
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
