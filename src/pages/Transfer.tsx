import React, { useState } from 'react';
import api from '../api';
import { Send, AlertTriangle, Building, QrCode, ArrowRight, Scan, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import QRScanner from '../components/QRScanner';

export default function Transfer() {
  const [tab, setTab] = useState<'BANK' | 'UPI'>('BANK');
  const [toAccountStr, setToAccountStr] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Transfer');
  const [loading, setLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate UPI format
    if (tab === 'UPI' && !toAccountStr.includes('@')) {
       toast.error("Invalid UPI ID - Make sure it contains an '@' symbol", { duration: 4000 });
       return;
    }

    setLoading(true);
    try {
      const res = await api.post('/account/transfer', { toAccountStr, amount: Number(amount), method: tab, category });
      
      setToAccountStr('');
      setAmount('');
      
      if (res.data.transaction.isSuspicious) {
        toast.warning(
          <div className="flex flex-col gap-1">
            <span className="font-bold">Automated Fraud Alert</span>
            <span>{res.data.transaction.fraudReason}. The requested ₹{amount} transfer has been flagged for audit review.</span>
          </div>,
          { duration: 8000 }
        );
      } else {
        toast.success(`Successfully transferred ₹${amount}`);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Transfer failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto space-y-6">
      
      {/* Tab Switcher */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-2 flex shadow-sm relative">
          <div 
             className="absolute top-2 bottom-2 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-2xl transition-all duration-300 ease-out z-0"
             style={{ width: 'calc(50% - 0.5rem)', left: tab === 'BANK' ? '0.5rem' : '50%' }}
          />
          <button 
             onClick={() => setTab('BANK')}
             className={`flex-1 py-4 flex items-center justify-center gap-2 font-bold z-10 transition-colors ${tab === 'BANK' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
          >
             <Building className="w-5 h-5" /> Direct Bank Transfer
          </button>
          <button 
             onClick={() => setTab('UPI')}
             className={`flex-1 py-4 flex items-center justify-center gap-2 font-bold z-10 transition-colors ${tab === 'UPI' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
          >
             <QrCode className="w-5 h-5" /> Instant UPI (Unified)
          </button>
       </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden relative">
        <div className="absolute top-0 right-0 right-0 w-64 h-64 bg-indigo-500/5 dark:bg-indigo-500/10 blur-3xl rounded-full pointer-events-none -mt-32 -mr-32"></div>

        <div className="p-8 relative z-10">
          <form onSubmit={handleTransfer} className="space-y-6">
            <AnimatePresence mode="wait">
              <motion.div key={tab} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.2 }}>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  {tab === 'BANK' ? 'Recipient Account Number' : 'Enter Valid UPI ID'}
                </label>
                <div className="relative">
                  <input
                    type="text" required
                    placeholder={tab === 'BANK' ? "e.g. SB1234567890" : "e.g. username@paytm"}
                    className={`w-full px-4 py-3.5 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white transition-all placeholder:text-slate-400 ${tab === 'BANK' ? 'uppercase' : 'lowercase'}`}
                    value={toAccountStr} onChange={(e) => setToAccountStr(e.target.value)}
                  />
                  {tab === 'UPI' && (
                     <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                        <button type="button" onClick={() => setShowScanner(true)} className="flex items-center gap-1 text-indigo-500 font-bold hover:text-indigo-600 transition-colors">
                            <Scan className="w-5 h-5" /> Scan
                        </button>
                     </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>

            <AnimatePresence>
               {showScanner && tab === 'UPI' && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                     <div className="bg-slate-100 dark:bg-slate-800/50 p-4 rounded-3xl mt-2 relative border border-slate-200 dark:border-slate-700">
                         <button type="button" onClick={() => setShowScanner(false)} className="absolute top-4 right-4 z-10 p-2 bg-white dark:bg-slate-700 rounded-full text-slate-500 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white shadow-sm transition-all hover:scale-105">
                             <X className="w-4 h-4" />
                         </button>
                         <h3 className="text-center font-bold text-slate-700 dark:text-slate-300 mb-4 bg-white/50 dark:bg-slate-800/80 w-max mx-auto px-4 py-1.5 rounded-full text-sm">Scan QR Code</h3>
                         <QRScanner 
                             onScanResult={(decoded) => {
                                 let upiId = decoded;
                                 if (decoded.includes('pa=')) {
                                     try {
                                        const params = new URLSearchParams(decoded.substring(decoded.indexOf('?')));
                                        if(params.get('pa')) upiId = params.get('pa') as string;
                                        if(params.get('am') && !amount) setAmount(params.get('am') as string);
                                     } catch (e) {}
                                 }
                                 setToAccountStr(upiId);
                                 setShowScanner(false);
                                 toast.success('UPI ID recognized!');
                             }} 
                         />
                     </div>
                  </motion.div>
               )}
            </AnimatePresence>

            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex-1">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Total Amount (₹)</label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-slate-400 font-bold">₹</span>
                  <input
                    type="number" required min="1"
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-3.5 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white transition-all font-mono text-lg"
                    value={amount} onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex-1">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Spend Category</label>
                <select 
                  className="w-full px-4 py-3.5 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white transition-all cursor-pointer"
                  value={category} onChange={e => setCategory(e.target.value)}
                >
                   <option value="Transfer">P2P Transfer</option>
                   <option value="Shopping">E-Commerce / Shopping</option>
                   <option value="Food">Food & Dining</option>
                   <option value="Bills">Bills & Utilities</option>
                </select>
              </div>
            </div>

            <AnimatePresence>
               {Number(amount) > 50000 && (
                 <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                    <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-800 dark:text-amber-400 p-4 rounded-2xl text-sm flex gap-3 mt-4">
                        <AlertTriangle className="w-5 h-5 shrink-0" />
                        <p className="font-medium leading-relaxed">
                          Transactions exceeding the automated <span className="font-bold">₹50,000</span> security threshold will be intercepted by anti-fraud AI engines and require manual clearance.
                        </p>
                    </div>
                 </motion.div>
               )}
            </AnimatePresence>

            <button
              type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-4 rounded-2xl transition-all disabled:opacity-70 disabled:filter disabled:grayscale shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-2 text-lg mt-8"
            >
              {loading ? 'Authorizing Request...' : 'Authorize Transaction'}
              {!loading && <ArrowRight className="w-5 h-5" />}
            </button>
          </form>
        </div>
      </div>
    </motion.div>
  );
}
