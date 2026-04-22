import React, { useEffect, useState, useContext } from 'react';
import api from '../api';
import { Download, AlertTriangle, Search, Filter } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { motion } from 'framer-motion';

export default function History() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/account/transactions');
        setTransactions(res.data);
      } catch (err) {
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const filteredTxs = transactions.filter(tx => {
      const matchText = tx.toAccount.toLowerCase().includes(filter.toLowerCase()) || 
          tx.fromAccount.toLowerCase().includes(filter.toLowerCase()) ||
          (tx.category || "").toLowerCase().includes(filter.toLowerCase());
      
      const txDate = new Date(tx.date).getTime();
      const fromMatch = fromDate ? txDate >= new Date(fromDate).getTime() : true;
      const toMatch = toDate ? txDate <= new Date(toDate).setHours(23,59,59,999) : true;

      return matchText && fromMatch && toMatch;
  });

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.text("PAYSECURE INDIA - TRANSACTION STATEMENT", 14, 20);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Account Holder: ${user?.name}`, 14, 28);
    let dateRangeText = "Date Range: All time";
    if (fromDate || toDate) {
        dateRangeText = `Date Range: ${fromDate || 'Start'} to ${toDate || 'End'}`;
    }
    doc.text(dateRangeText, 14, 34);
    doc.text(`Generated On: ${new Date().toLocaleString()}`, 14, 40);

    const tableColumn = ["Date", "Ref ID", "Category", "Details", "Status", "Amount"];
    
    let totalBalanceCalc = 0;
    
    const tableRows = filteredTxs.map(tx => {
      totalBalanceCalc += tx.type === 'CREDIT' ? tx.amount : -tx.amount;
      return [
        new Date(tx.date).toLocaleDateString(),
        `TXN-${tx.id.toString().padStart(6, '0')}`,
        tx.category || "Transfer",
        tx.type === 'CREDIT' ? `From: ${tx.fromAccount}` : `To: ${tx.toAccount}`,
        tx.status,
        `${tx.type === 'CREDIT' ? '+' : '-'} Rs.${tx.amount.toFixed(2)}`
      ]
    });

    autoTable(doc, {
      startY: 46,
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [79, 70, 229] }
    });
    
    // Add Summary at bottom
    const finalY = (doc as any).lastAutoTable.finalY || 46;
    doc.setFont("helvetica", "bold");
    doc.text(`Net Impact for Selected Range: ${totalBalanceCalc > 0 ? '+' : ''}Rs.${totalBalanceCalc.toFixed(2)}`, 14, finalY + 10);

    doc.save(`PaySecure_India_Statement_${new Date().getTime()}.pdf`);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="p-8 border-b border-slate-100 dark:border-slate-800/80 flex flex-col md:flex-row justify-between items-center gap-6 bg-slate-50/50 dark:bg-slate-800/20">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">Transaction History</h2>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Export, filter, and audit your financial footprint</p>
        </div>
        
        <div className="flex flex-col w-full md:w-auto items-end gap-4">
           <div className="flex flex-col sm:flex-row gap-3 w-full">
               <div className="relative flex-1 md:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                  <input 
                     type="text" placeholder="Search references..."
                     className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
                     value={filter} onChange={e => setFilter(e.target.value)}
                  />
               </div>
               
               {/* Date Range Picker */}
               <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-0.5">
                  <label className="text-xs text-slate-500 dark:text-slate-400 font-medium">From:</label>
                  <input type="date" value={fromDate} onChange={e=>setFromDate(e.target.value)} className="bg-transparent text-sm text-slate-800 dark:text-slate-200 outline-none" />
                  <span className="text-slate-300 dark:text-slate-600">|</span>
                  <label className="text-xs text-slate-500 dark:text-slate-400 font-medium">To:</label>
                  <input type="date" value={toDate} onChange={e=>setToDate(e.target.value)} className="bg-transparent text-sm text-slate-800 dark:text-slate-200 outline-none" />
               </div>
           </div>
           
           <button onClick={downloadPDF} className="shrink-0 flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-slate-900/10 dark:shadow-indigo-500/20 transition-all">
             <Download className="w-4 h-4" /> Export Filtered PDF
           </button>
        </div>
      </div>
      
      <div className="overflow-x-auto min-h-[400px]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 dark:bg-slate-800/80 dark:border-slate-700/50 text-[11px] uppercase tracking-widest text-slate-500 dark:text-slate-400">
              <th className="p-5 font-extrabold">Timestamp</th>
              <th className="p-5 font-extrabold">Reference ID</th>
              <th className="p-5 font-extrabold">Details & Category</th>
              <th className="p-5 font-extrabold text-center">Transfer Type</th>
              <th className="p-5 font-extrabold text-center">Status Audit</th>
              <th className="p-5 font-extrabold text-right">Settled Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-sm">
            {loading ? (
              <tr><td colSpan={6} className="p-12 text-center text-slate-500 font-medium">Synchronizing ledgers...</td></tr>
            ) : filteredTxs.length === 0 ? (
              <tr><td colSpan={6} className="p-12 text-center text-slate-500 font-medium">No transactions found matching your criteria.</td></tr>
            ) : (
              filteredTxs.map(tx => (
                <tr key={tx.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="p-5">
                    <div className="font-bold text-slate-700 dark:text-slate-300">{new Date(tx.date).toLocaleDateString()}</div>
                    <div className="text-xs font-medium text-slate-400 mt-0.5">{new Date(tx.date).toLocaleTimeString()}</div>
                  </td>
                  <td className="p-5 font-mono text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-transparent">TXN-{tx.id.toString().padStart(6, '0')}</td>
                  <td className="p-5">
                    <div className="font-bold text-slate-800 dark:text-slate-200">
                      {tx.method === 'UPI' ? 'UPI' : ''} {tx.type === 'CREDIT' ? `Received from ${tx.fromAccount}` : `Sent to ${tx.toAccount}`}
                    </div>
                    <div className="text-xs font-medium text-slate-500 mt-1 flex items-center gap-1">
                        <Filter className="w-3 h-3 text-indigo-400" /> {tx.category || "General Transfer"}
                    </div>
                  </td>
                  <td className="p-5 text-center">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${tx.type === 'CREDIT' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'}`}>
                      {tx.type}
                    </span>
                  </td>
                  <td className="p-5 text-center">
                     {tx.isSuspicious ? (
                        <span className="inline-flex items-center gap-1.5 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider w-max mx-auto">
                            <AlertTriangle className="w-3.5 h-3.5" /> FLAGGED REVIEW
                        </span>
                     ) : (
                        <span className="inline-block text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider w-max mx-auto">
                            {tx.status}
                        </span>
                     )}
                  </td>
                  <td className={`p-5 text-right font-extrabold text-lg tracking-tight ${tx.type === 'CREDIT' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-slate-100'}`}>
                    {tx.type === 'CREDIT' ? '+' : '-'}₹{tx.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
