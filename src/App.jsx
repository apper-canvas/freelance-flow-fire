import { Routes, Route, Link, useLocation } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { useAuth } from './context/AuthContext';
import getIcon from './utils/iconUtils';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import Home from './pages/Home';
import Invoices from './pages/Invoices';
import NotFound from './pages/NotFound';
import Clients from './pages/Clients';
import Documents from './pages/Documents';
import Reports from './pages/Reports';
import Expenses from './pages/Expenses';
import Projects from './pages/Projects';
import Login from './pages/Login';
import Signup from './pages/Signup';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('darkMode') === 'true' || 
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );
  const location = useLocation();
  const { isAuthenticated } = useSelector(state => state.user);
  const { logout } = useAuth();
  
  // Icons
  const HomeIcon = getIcon('Home');
  const ClockIcon = getIcon('Clock');
  const UsersIcon = getIcon('Users');
  const FolderIcon = getIcon('Folder');
  const FileTextIcon = getIcon('FileText');
  const DollarSignIcon = getIcon('DollarSign');
  const BarChartIcon = getIcon('BarChart');
  const FileIcon = getIcon('File');
  const SunIcon = getIcon('Sun');
  const MoonIcon = getIcon('Moon');
  const MenuIcon = getIcon('Menu');
  const XIcon = getIcon('X');
  const LogOutIcon = getIcon('LogOut');
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);
  
  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    toast.info(`${!darkMode ? 'Dark' : 'Light'} mode activated`, {
      icon: !darkMode ? "🌙" : "☀️"
    });
  };

  const handleLogout = () => {
    logout();
    toast.info('You have been logged out');
  };

  const navLinks = [
    { to: '/', label: 'Dashboard', icon: HomeIcon },
    { to: '/time', label: 'Time Tracker', icon: ClockIcon },
    { to: '/clients', label: 'Clients', icon: UsersIcon },
    { to: '/projects', label: 'Projects', icon: FolderIcon },
    { to: '/invoices', label: 'Invoices', icon: FileTextIcon },
    { to: '/expenses', label: 'Expenses', icon: DollarSignIcon },
    { to: '/reports', label: 'Reports', icon: BarChartIcon },
    { to: '/documents', label: 'Documents', icon: FileIcon },
  ];

  // Determine if we're on a auth page (login or signup)
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  return (
    <div className="min-h-screen flex flex-col">
      {/* Only show header when authenticated or not on auth pages */}
      {isAuthenticated && (
        <header className="bg-white dark:bg-surface-800 border-b border-surface-200 dark:border-surface-700 z-10">
          <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <button 
                className="md:hidden p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <XIcon size={24} /> : <MenuIcon size={24} />}
              </button>
              <Link to="/" className="flex items-center space-x-2">
                <div className="bg-primary rounded-lg p-1">
                  <ClockIcon size={24} className="text-white" />
                </div>
                <span className="text-xl font-bold text-primary hidden sm:block">FreelanceFlow</span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
                aria-label="Toggle dark mode"
              >
                {darkMode ? <SunIcon size={20} /> : <MoonIcon size={20} />}
              </button>
              
              <div className="relative group">
                <button 
                  className="flex items-center space-x-2"
                  onClick={handleLogout}
                >
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
                    <span className="text-sm font-semibold">AJ</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </header>
      )}
      
      {/* Mobile Menu */}
      <AnimatePresence>
        {isAuthenticated && isMobileMenuOpen && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <motion.div 
              className="absolute top-0 left-0 h-full w-2/3 max-w-xs bg-white dark:bg-surface-800 p-4 overflow-y-auto"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="py-4 border-b border-surface-200 dark:border-surface-700 mb-4">
                <Link to="/" className="flex items-center space-x-2 mb-6">
                  <div className="bg-primary rounded-lg p-1">
                    <ClockIcon size={24} className="text-white" />
                  </div>
                  <span className="text-xl font-bold text-primary">FreelanceFlow</span>
                </Link>
                
                <div className="space-y-1">
                  {navLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors ${
                        location.pathname === link.to ? 'bg-primary/10 text-primary font-medium' : ''
                      }`}
                    >
                      {React.createElement(link.icon, { size: 20 })}
                      <span>{link.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
              <button 
                className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors w-full text-left"
                onClick={handleLogout}
              >
                <LogOutIcon size={20} />
                <span>Logout</span>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Main Content */}
      <div className="flex flex-1">
        {/* Sidebar - Desktop only for authenticated users */}
        {isAuthenticated && (
          <aside className="hidden md:block w-64 bg-white dark:bg-surface-800 border-r border-surface-200 dark:border-surface-700 overflow-y-auto">
            <div className="py-6 px-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors ${
                    location.pathname === link.to ? 'bg-primary/10 text-primary font-medium' : ''
                  }`}
                >
                  {React.createElement(link.icon, { size: 20 })}
                  <span>{link.label}</span>
                </Link>
              ))}
              <button 
                className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors w-full text-left mt-auto"
                onClick={handleLogout}
              >
                <LogOutIcon size={20} />
                <span>Logout</span>
              </button>
            </div>
          </aside>
        )}
        
        {/* Main Content Area */}
        <main className={`flex-1 overflow-y-auto ${isAuthPage ? '' : ''}`}>
          {!isAuthPage && (
            <div className="container mx-auto px-4 py-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <Routes>
                    <Route element={<ProtectedRoute />}>
                      <Route path="/" element={<Home />} />
                      <Route path="/time" element={<Home />} />
                      <Route path="/clients" element={<Clients />} />
                      <Route path="/projects" element={<Projects />} />
                      <Route path="/invoices" element={<Invoices />} />
                      <Route path="/expenses" element={<Expenses />} />
                      <Route path="/reports" element={<Reports />} />
                      <Route path="/documents" element={<Documents />} />
                    </Route>
                  </Routes>
                </motion.div>
              </AnimatePresence>
            </div>
          )}
          
          {/* Auth pages don't need container */}
          {isAuthPage && (
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Routes>
                  <Route element={<PublicRoute />}>
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                  </Route>
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </motion.div>
            </AnimatePresence>
          )}
        </main>
      </div>
      
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={darkMode ? "dark" : "light"}
        toastClassName="rounded-lg shadow-lg"
      />
      
      {/* Hidden div for authentication UI rendering */}
      <div id="authentication" className="hidden"></div>
    </div>
  );
}

export default App;