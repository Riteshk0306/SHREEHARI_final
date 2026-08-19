/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate, Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useStore } from './store';
import { ShoppingCart, User, LogOut, Package, LayoutDashboard, FileText, Settings, ShoppingBag, Menu, X, MessageSquare, BarChart, Users } from 'lucide-react';
import { useState, useEffect, type ReactNode } from 'react';

import { supabase } from './lib/supabase';
import { verifyAdminRole } from './lib/auth';

// --- Layouts ---

/**
 * RequireAdmin: Secure route guard that verifies admin role
 * via a live Supabase database check before rendering any admin page.
 * Cannot be bypassed by editing local/Zustand state in DevTools.
 */
const RequireAdmin = ({ children }: { children: ReactNode }) => {
  const { user, setUser } = useStore();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function checkAdminAccess() {
      setChecking(true);
      // First quick check: if no user in state at all, redirect immediately
      if (!user) {
        if (!cancelled) { setChecking(false); navigate('/login', { replace: true }); }
        return;
      }
      // Live database role verification
      const isAdmin = await verifyAdminRole();
      if (!cancelled) {
        if (isAdmin) {
          setAuthorized(true);
        } else {
          // Role was revoked or tampered with — clear state and redirect
          setUser(null);
          navigate('/login', { replace: true });
        }
        setChecking(false);
      }
    }
    checkAdminAccess();
    return () => { cancelled = true; };
  }, [user?.id]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400 text-sm">Verifying access...</p>
        </div>
      </div>
    );
  }

  return authorized ? <>{children}</> : null;
};

const CustomerLayout = () => {
  const { user, cart, setUser } = useStore();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {}
    setUser(null);
    navigate('/');
  };

  return (
    <div className="min-h-[100dvh] bg-slate-50 flex flex-col font-sans text-slate-900">
      <header className="bg-amber-50/90 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-amber-100">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <img src="/logo.png" alt="Shree Hari Logo" className="h-8 sm:h-10 w-auto object-contain" />
            <span className="text-lg sm:text-2xl font-bold text-amber-600 tracking-tight uppercase hidden min-[360px]:block">Shree Hari</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-slate-600 hover:text-amber-500 font-medium transition-colors">Home</Link>
            <Link to="/products" className="text-slate-600 hover:text-amber-500 font-medium transition-colors">Products</Link>
            <Link to="/about" className="text-slate-600 hover:text-amber-500 font-medium transition-colors">About</Link>
            <Link to="/contact" className="text-slate-600 hover:text-amber-500 font-medium transition-colors">Contact Us</Link>
          </nav>

          <div className="flex items-center gap-1 sm:gap-4 shrink-0">
            <Link to="/cart" className="relative p-2 text-slate-600 hover:text-amber-500 transition-colors">
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-amber-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>
            
            {user ? (
              <div className="hidden md:flex items-center gap-4">
                {user.role === 'admin' && (
                  <Link to="/admin" className="text-sm font-bold text-amber-600 bg-amber-50 border border-amber-100 px-3 py-1.5 rounded hover:bg-amber-100 transition-colors uppercase tracking-wider">Admin</Link>
                )}
                <Link to="/my-orders" className="text-sm font-bold text-slate-600 border border-slate-200 px-3 py-1.5 rounded hover:bg-slate-100 transition-colors uppercase tracking-wider">Account</Link>
                <button onClick={handleLogout} className="text-slate-600 hover:text-red-600 transition-colors" title="Logout">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link to="/login" className="hidden md:flex items-center gap-2 text-slate-600 hover:text-amber-500 font-medium transition-colors">
                <User className="w-5 h-5" />
                <span className="hidden sm:inline">Login</span>
              </Link>
            )}

            <button className="md:hidden p-2 text-slate-600" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X className="w-6 h-6"/> : <Menu className="w-6 h-6"/>}
            </button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-4 shadow-xl absolute w-full left-0 top-16 z-50">
            <Link to="/" onClick={() => setMenuOpen(false)} className="block font-medium text-slate-800 p-2 hover:bg-slate-50 rounded">Home</Link>
            <Link to="/products" onClick={() => setMenuOpen(false)} className="block font-medium text-slate-800 p-2 hover:bg-slate-50 rounded">Products</Link>
            <Link to="/about" onClick={() => setMenuOpen(false)} className="block font-medium text-slate-800 p-2 hover:bg-slate-50 rounded">About</Link>
            <Link to="/contact" onClick={() => setMenuOpen(false)} className="block font-medium text-slate-800 p-2 hover:bg-slate-50 rounded">Contact Us</Link>
            
            <div className="border-t border-slate-200 pt-4 mt-2">
              {user ? (
                <div className="space-y-2">
                  {user.role === 'admin' && (
                    <Link to="/admin" onClick={() => setMenuOpen(false)} className="block font-bold text-amber-600 p-2 hover:bg-amber-50 rounded">Admin Dashboard</Link>
                  )}
                  <Link to="/profile" onClick={() => setMenuOpen(false)} className="block font-medium text-slate-800 p-2 hover:bg-slate-50 rounded">My Account</Link>
                  <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="block font-medium text-red-600 p-2 hover:bg-red-50 rounded w-full text-left">Logout</button>
                </div>
              ) : (
                <Link to="/login" onClick={() => setMenuOpen(false)} className="block font-medium text-slate-800 p-2 hover:bg-slate-50 rounded">Login / Register</Link>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-2xl font-bold text-amber-500 mb-4 tracking-tight uppercase">Shree Hari</h3>
            <p className="text-slate-400">Premium Pooja Samagri for your spiritual needs.</p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4 text-slate-200">Quick Links</h4>
            <ul className="space-y-2 text-slate-400">
              <li><Link to="/" className="hover:text-amber-500 transition-colors">Home</Link></li>
              <li><Link to="/products" className="hover:text-amber-500 transition-colors">Shop</Link></li>
              <li><Link to="/contact" className="hover:text-amber-500 transition-colors">Contact Us</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4 text-slate-200">Contact</h4>
            <p className="text-slate-400">WhatsApp: +91 7058117155</p>
            <p className="text-slate-400">Email: contact@shreehari.com</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const AdminLayout = () => {
  const { user, setUser } = useStore();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { to: "/admin", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/admin/customers", icon: Users, label: "Customers" },
    { to: "/admin/products", icon: Package, label: "Products" },
    { to: "/admin/orders", icon: ShoppingBag, label: "Orders" },
    { to: "/admin/pos", icon: FileText, label: "POS / Bill" },
    { to: "/admin/sales", icon: BarChart, label: "Sales History" },
    { to: "/admin/contacts", icon: MessageSquare, label: "Messages" },
  ];

  return (
    <div className="flex h-[100dvh] w-full bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {/* Sidebar */}
      {/* Mobile Overlay */}
      {menuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-slate-900 flex flex-col h-full border-r border-slate-800 z-50 transform transition-transform duration-300 lg:relative lg:translate-x-0 ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-slate-800 mb-4 flex items-center gap-3">
          <img src="/logo.png" alt="Shree Hari Logo" className="h-10 w-auto object-contain bg-white/10 rounded px-1" />
          <div>
            <h1 className="text-amber-500 font-bold text-xl tracking-tight uppercase">Shree Hari</h1>
            <p className="text-slate-400 text-[10px] uppercase tracking-widest mt-1">Management SaaS</p>
          </div>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className="flex items-center px-3 py-2 text-slate-300 hover:bg-slate-800 rounded-md text-sm font-medium transition-colors"
            >
              <link.icon className="w-5 h-5 mr-3" />
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 rounded bg-amber-600 flex items-center justify-center text-xs font-bold text-white">AD</div>
            <div>
              <p className="text-xs text-white font-semibold">Admin User</p>
              <p className="text-[10px] text-slate-500">Master Access</p>
            </div>
          </div>
          <button 
            onClick={async () => { 
              try { await supabase.auth.signOut(); } catch (e) {}
              setUser(null); 
              navigate('/'); 
            }}
            className="flex items-center gap-3 px-3 py-2 w-full text-red-400 hover:bg-slate-800 rounded-md transition-colors text-sm font-medium"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full w-full overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 shrink-0 lg:hidden">
           <div className="flex items-center gap-3">
             <button onClick={() => setMenuOpen(true)} className="text-slate-600 hover:text-amber-600 transition-colors">
               <Menu className="w-6 h-6" />
             </button>
             <h2 className="text-lg sm:text-xl font-bold text-amber-500 uppercase tracking-tight">Shree Hari Admin</h2>
           </div>
           <Link to="/" className="text-sm text-slate-500 hover:text-amber-600 underline">View Store</Link>
        </header>
        <div className="flex-1 overflow-auto bg-slate-50 flex flex-col p-4 lg:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

// --- App Router ---

// Placeholders for views
import Home from './pages/customer/Home';
import Products from './pages/customer/Products';
import ProductDetails from './pages/customer/ProductDetails';
import Cart from './pages/customer/Cart';
import Checkout from './pages/customer/Checkout';
import About from './pages/customer/About';
import Contact from './pages/customer/Contact';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import MyOrders from './pages/customer/Orders';
import Profile from './pages/customer/Profile';
import Dashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/Products';
import AdminOrders from './pages/admin/Orders';
import POS from './pages/admin/POS';
import SalesHistory from './pages/admin/SalesHistory';

import AdminContacts from './pages/admin/Contacts';
import AdminCustomers from './pages/admin/Customers';



const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Customer Routes (including Auth) */}
        <Route path="/" element={<CustomerLayout />}>
          <Route index element={<Home />} />
          <Route path="products" element={<Products />} />
          <Route path="products/:id" element={<ProductDetails />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="my-orders" element={<MyOrders />} />
          <Route path="profile/*" element={<Profile />} />
        </Route>

        {/* Admin Routes - Protected by RequireAdmin live database check */}
        <Route path="/admin" element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="pos" element={<POS />} />
          
          <Route path="sales" element={<SalesHistory />} />
          <Route path="customers" element={<AdminCustomers />} />

          <Route path="contacts" element={<AdminContacts />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

