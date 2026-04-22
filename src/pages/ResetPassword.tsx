import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../api';
import { useTheme } from '../context/ThemeContext';
import { Shield, Lock, CheckCircle2, ArrowRight, Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const getPasswordStrength = () => {
    if (newPassword.length === 0) return 0;
    if (newPassword.length <= 4) return 25;
    if (newPassword.length <= 8) return 50;
    if (newPassword.match(/[a-z]/) && newPassword.match(/[A-Z]/) && newPassword.match(/[0-9]/)) return 100;
    return 75;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, newPassword });
      setIsSuccess(true);
      toast.success("Password has been successfully reset!");
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans relative overflow-hidden transition-colors">
      
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
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-4 rounded-2xl shadow-lg shadow-indigo-500/30">
              <Shield className="h-10 w-10 text-white" />
            </div>
          </div>
          
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Create New Password</h2>
            <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                Secure your account with a strong password
            </p>
          </div>
          
          {!isSuccess ? (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">New Password</label>
                <div className="relative">
                   <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                     <Lock className="h-5 w-5 text-slate-400" />
                   </div>
                   <input
                     type="password" required
                     className="block w-full pl-11 pr-4 py-3 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 dark:text-white transition-all placeholder:text-slate-400"
                     value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                   />
                </div>
                <div className="mt-2 h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${getPasswordStrength() <= 25 ? 'bg-red-500' : getPasswordStrength() <= 50 ? 'bg-amber-500' : getPasswordStrength() <= 75 ? 'bg-indigo-500' : 'bg-emerald-500'}`} 
                      style={{ width: `${getPasswordStrength()}%` }}
                    ></div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Confirm Password</label>
                <div className="relative">
                   <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                     <CheckCircle2 className="h-5 w-5 text-slate-400" />
                   </div>
                   <input
                     type="password" required
                     className="block w-full pl-11 pr-4 py-3 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 dark:text-white transition-all placeholder:text-slate-400"
                     value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                   />
                </div>
              </div>

              <button
                type="submit" disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-indigo-500/30 text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all disabled:opacity-70 mt-4"
              >
                {loading ? 'Updating Password...' : 'Reset Password'}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          ) : (
             <div className="text-center">
                <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 p-6 rounded-2xl mb-6">
                    <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-emerald-800 dark:text-emerald-200 mb-2">Password Reset Successful</h3>
                    <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                        Redirecting you to the login page...
                    </p>
                </div>
                <Link to="/login" className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500">
                    Click here if you aren't redirected automatically
                </Link>
             </div>
          )}
          
        </motion.div>
      </div>
    </div>
  );
}
