import React, { useEffect, useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Shield, LayoutDashboard, Send, History, LogOut, User, Bell, PieChart, ShieldAlert, Moon, Sun } from 'lucide-react';
import api from '../api';
import { motion, AnimatePresence } from 'framer-motion';
import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';

export default function Layout() {
  const { user, logout } = React.useContext(AuthContext);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotif, setShowNotif] = useState(false);

  useEffect(() => {
    // Initial fetch
    const fetchNotifs = async () => {
      try {
        const res = await api.get('/notifications');
        setNotifications(res.data);
      } catch (err) {}
    };
    fetchNotifs();

    // Socket.io Connection for Real-Time Sync
    const token = localStorage.getItem('token');
    let socket: Socket | null = null;
    
    if (token) {
        socket = io(window.location.origin, {
            auth: { token }
        });

        socket.on('notification', (notif) => {
            setNotifications(prev => [notif, ...prev]);
            
            // Show toast for real-time engagement
            if (notif.type === 'warning' || notif.type === 'danger') {
               toast.warning(notif.title, { description: notif.message, duration: 8000 });
            } else if(notif.type === 'success') {
               toast.success(notif.title, { description: notif.message });
            } else {
               toast.info(notif.title, { description: notif.message });
            }
        });
    }

    return () => {
        if (socket) socket.disconnect();
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const markRead = async () => {
    await api.post('/notifications/read');
    setNotifications(prev => prev.map(n => ({...n, read: true})));
    setShowNotif(false);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Transfer & UPI', path: '/transfer', icon: Send },
    { name: 'Analytics', path: '/analytics', icon: PieChart },
    { name: 'History & Statements', path: '/history', icon: History },
  ];

  if (user?.role === 'ADMIN') {
      navItems.push({ name: 'Security Admin', path: '/admin', icon: ShieldAlert });
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Premium Sidebar */}
      <div className="w-72 bg-white/50 dark:bg-slate-900/50 backdrop-blur-2xl border-r border-slate-200/50 dark:border-slate-800/50 flex flex-col z-20 shadow-[-10px_0_30px_rgba(0,0,0,0.05)]">
        <div className="p-8 flex items-center gap-3">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2.5 rounded-xl shadow-lg shadow-indigo-500/30">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">PaySecure India</span>
        </div>
        
        <div className="px-6 pb-6">
          <div className="flex items-center gap-4 p-4 bg-slate-100/50 dark:bg-slate-800/50 backdrop-blur-md rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm transition-all hover:shadow-md">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-2.5 rounded-full shadow-inner">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100 placeholder:">{user?.name}</p>
              <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400 capitalize">{user?.role} Account</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl transition-all duration-300 relative group overflow-hidden ${
                  isActive 
                    ? 'text-indigo-700 dark:text-indigo-300 font-semibold' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {isActive && (
                  <motion.div 
                    layoutId="active-navIndicator"
                    className="absolute inset-0 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-xl -z-10"
                  />
                )}
                <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                <span className="z-10">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-6 space-y-3">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full px-4 py-3.5 text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 rounded-xl transition-all font-medium border border-transparent hover:border-red-100 dark:hover:border-red-500/20"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out Session</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed dark:bg-none relative">
        <div className="absolute inset-0 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-3xl -z-10"></div>
        
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 px-8 py-5 flex justify-between items-center shadow-sm">
          <div className="flex flex-col">
            <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">
              {navItems.find(i => i.path === location.pathname)?.name || 'Dashboard'}
            </h1>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-full">
              <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
              <span className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold uppercase tracking-wider">Secured</span>
            </div>

            <button onClick={toggleTheme} className="p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors">
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <div className="relative">
              <button onClick={() => setShowNotif(!showNotif)} className="p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors relative">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-900 border-none"></span>
                )}
              </button>

              <AnimatePresence>
                {showNotif && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50"
                  >
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                      <h4 className="font-bold text-slate-800 dark:text-slate-200">Notifications</h4>
                      <button onClick={markRead} className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 font-medium">Mark all read</button>
                    </div>
                    <div className="max-h-96 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/50">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-slate-500 text-sm">No recent notifications</div>
                      ) : (
                        notifications.map(n => (
                          <div key={n.id} className={`p-4 ${!n.read ? 'bg-indigo-50/50 dark:bg-indigo-500/5' : ''}`}>
                             <p className={`text-sm font-semibold mb-1 ${n.type === 'danger' || n.type === 'warning' ? 'text-amber-600' : 'text-slate-800 dark:text-slate-200'}`}>
                                {n.title}
                             </p>
                             <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{n.message}</p>
                             <p className="text-[10px] text-slate-400 mt-2">{new Date(n.date).toLocaleString()}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <main className="p-8 max-w-7xl mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
