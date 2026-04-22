import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Shield, Lock, Mail, Fingerprint, Eye, EyeOff, Loader2, Zap, AlertTriangle, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const Feature = ({ icon: Icon, title }: { icon: any, title: string }) => (
  <motion.div whileHover={{ x: 5 }} className="flex items-center gap-4 text-slate-200">
    <div className="p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 shadow-inner">
      <Icon className="w-6 h-6 text-indigo-400" />
    </div>
    <span className="font-medium text-lg tracking-wide">{title}</span>
  </motion.div>
);

export default function Login() {
  const [email, setEmail] = useState('john@example.com');
  const [password, setPassword] = useState('password');
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<1 | 2>(1);
  const [tempToken, setTempToken] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { loginStep1, verifyOTP } = useContext(AuthContext);
  const { theme } = useTheme();
  const navigate = useNavigate();

  const handleInitialLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await loginStep1(email, password);
      if (data.requires2FA) {
          setTempToken(data.tempToken);
          setStep(2);
          toast.success(data.message || "OTP sent to your email");
      } else if (data.token) {
          toast.success("Login successful!");
          navigate('/');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      try {
          await verifyOTP(tempToken, otp);
          toast.success("Login successful!");
          navigate('/');
      } catch (err: any) {
          toast.error(err.response?.data?.error || "Invalid OTP");
      } finally {
          setLoading(false);
      }
  }

  const inputClasses = `block w-full pl-12 pr-12 py-3.5 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm ${
    theme === 'dark'
      ? 'bg-slate-900/40 border-white/10 text-white placeholder:text-slate-500 focus:bg-slate-900/60 focus:border-indigo-500'
      : 'bg-white/60 border-slate-300/60 text-slate-900 placeholder:text-slate-500 focus:bg-white/90 focus:border-indigo-400'
  }`;

  return (
    <div 
      className="min-h-screen bg-cover bg-center flex relative font-sans overflow-hidden"
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2000&auto=format&fit=crop')" }}
    >
      
      {/* Dark Overlay for the entire background */}
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[2px]"></div>

      <div className="max-w-7xl mx-auto w-full flex relative z-10 min-h-screen">
        
        {/* Left Section - Information */}
        <div className="hidden lg:flex w-1/2 flex-col justify-between py-12 px-12 xl:px-24 xl:py-24 text-white">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }} className="mt-10">
            <div className="flex items-center gap-3 mb-16">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3.5 rounded-2xl shadow-xl shadow-indigo-500/20 border border-white/10">
                  <Shield className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight">PaySecure India</h1>
            </div>

            <h2 className="text-5xl xl:text-6xl font-extrabold leading-[1.15] mb-6">
              Safe & Smart<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-300">
                Banking System
              </span>
            </h2>
            <p className="text-lg xl:text-xl text-slate-300 mb-12 max-w-md leading-relaxed">
              Experience the next generation of digital finance with enterprise-grade security and intelligent fraud prevention.
            </p>

            <div className="space-y-6">
              <Feature icon={Lock} title="Secure login with 2FA" />
              <Feature icon={Zap} title="Real-time transactions" />
              <Feature icon={AlertTriangle} title="Smart Fraud detection" />
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="text-slate-400/80 text-sm font-medium">
            © {new Date().getFullYear()} PaySecure India Limited. All rights reserved.
          </motion.div>
        </div>

        {/* Right Section - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-12 mb-8 lg:mb-0">
          <motion.div 
            initial={{ opacity: 0, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
            className={`w-full max-w-md backdrop-blur-2xl border rounded-[2rem] shadow-2xl p-8 sm:p-10 relative overflow-hidden transition-colors duration-500 ${
              theme === 'dark' 
                ? 'bg-slate-900/50 border-white/10 text-white shadow-black/50' 
                : 'bg-white/90 border-white/40 text-slate-900 shadow-indigo-900/10'
            }`}
          >
            {/* Soft decorative glow inside the card */}
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-indigo-500/20 blur-[80px] rounded-full pointer-events-none"></div>
            
            <div className="text-center mb-8 relative z-10">
              {/* Mobile logo (hidden on desktop) */}
              <div className="lg:hidden flex items-center justify-center gap-3 mb-6">
                 <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2.5 rounded-xl shadow-lg border border-white/10">
                    <Shield className="w-7 h-7 text-white" />
                 </div>
                 <h1 className="text-2xl font-extrabold tracking-tight">PaySecure</h1>
              </div>

              <h2 className="text-3xl font-extrabold tracking-tight mb-2">Welcome Back</h2>
              <p className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                 {step === 1 ? 'Please enter your account details' : 'Two-Factor Authentication'}
              </p>
            </div>
            
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.form 
                  key="step1"
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                  className="space-y-5 relative z-10" onSubmit={handleInitialLogin}
                >
                  <div>
                    <label className={`block text-sm font-semibold mb-1.5 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Email Address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className={`h-5 w-5 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`} />
                      </div>
                      <input
                        type="email" required
                        className={inputClasses}
                        value={email} onChange={(e) => setEmail(e.target.value)}
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className={`block text-sm font-semibold ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Password</label>
                      <Link to="/forgot-password" className="text-sm font-semibold text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                          Forgot Password?
                      </Link>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className={`h-5 w-5 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`} />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"} required
                        className={inputClasses}
                        value={password} onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className={`absolute inset-y-0 right-0 pr-4 flex items-center transition-colors ${theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <button
                    type="submit" disabled={loading}
                    className="w-full flex justify-center items-center gap-2 py-4 px-4 border border-transparent rounded-xl shadow-lg shadow-indigo-600/20 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 disabled:opacity-70 mt-6 group"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Authenticating...
                      </>
                    ) : (
                      <>
                        Secure Login
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </motion.form>
              ) : (
                 <motion.form 
                  key="step2"
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                  className="space-y-6 relative z-10" onSubmit={handleVerifyOTP}
                >
                    <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-2xl flex items-start gap-4">
                        <div className="bg-indigo-500 p-2.5 rounded-xl shadow-sm shrink-0">
                            <Fingerprint className="w-6 h-6 text-white" />
                        </div>
                        <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-indigo-200' : 'text-indigo-900'}`}>
                            We've sent a one-time verification code to your registered email address. 
                            <span className="block mt-1.5 font-semibold opacity-80">(Mock OTP is 123456)</span>
                        </p>
                    </div>

                    <div>
                        <input
                          type="text" required maxLength={6} placeholder="• • • • • •"
                          className={`${inputClasses} text-center tracking-[1em] font-mono text-2xl pl-4 py-4`}
                          value={otp} onChange={(e) => setOtp(e.target.value)}
                        />
                    </div>

                    <button
                    type="submit" disabled={loading}
                    className="w-full flex justify-center items-center gap-2 py-4 px-4 rounded-xl shadow-lg shadow-indigo-500/30 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-all disabled:opacity-70 group"
                   >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        Verify & Continue
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>

            {step === 1 && (
              <div className={`mt-8 text-center border-t pt-6 ${theme === 'dark' ? 'border-white/10' : 'border-slate-200/80'}`}>
                <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                  Don’t have an account?{" "}
                  <Link autoFocus={false} to="/register" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 font-bold transition-colors">
                    Register now
                  </Link>
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
