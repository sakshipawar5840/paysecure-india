import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useTheme } from '../context/ThemeContext';
import { Shield, Mail, ArrowRight, Sun, Moon, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [mockTokenLink, setMockTokenLink] = useState('');
  const { theme, toggleTheme } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setIsSent(true);
      toast.success("Verification link sent!");
      if (res.data.mockToken) {
          setMockTokenLink(`/reset-password/${res.data.mockToken}`);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to request reset');
    } finally {
      setLoading(false);
    }
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
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/20 dark:bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none mix-blend-multiply"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/20 dark:bg-purple-600/20 blur-[120px] rounded-full pointer-events-none mix-blend-multiply"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-3xl py-10 px-8 shadow-2xl rounded-3xl border border-white/20 dark:border-slate-700/50"
        >
          <div className="flex justify-center mb-8">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-4 rounded-2xl shadow-lg shadow-indigo-500/30">
              <Shield className="h-10 w-10 text-white" />
            </div>
          </div>
          
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Reset Password</h2>
            <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">
               Enter your email to receive a recovery link
            </p>
          </div>
          
          {!isSent ? (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="email" required
                    className="block w-full pl-11 pr-4 py-3.5 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 dark:text-white transition-all placeholder:text-slate-400"
                    value={email} onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit" disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-indigo-500/30 text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all disabled:opacity-70 mt-4"
              >
                {loading ? 'Sending Request...' : 'Send Recovery Link'}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          ) : (
             <div className="text-center">
                <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 p-4 rounded-xl mb-6">
                    <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200 leading-relaxed">
                        If an account with that email exists, we've sent a password reset link.
                    </p>
                </div>
                
                {/* For simulation/demo purposes only to allow click */}
                {mockTokenLink && (
                    <div className="mt-4 p-4 border border-dashed border-indigo-200 dark:border-indigo-800 rounded-xl">
                        <p className="text-xs text-slate-500 mb-2">Simulated Email Inbox:</p>
                        <Link to={mockTokenLink} className="text-indigo-600 dark:text-indigo-400 font-medium text-sm hover:underline">
                            Click here to reset your password
                        </Link>
                    </div>
                )}
             </div>
          )}
          
        </motion.div>
      </div>
    </div>
  );
}
