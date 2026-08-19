import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const titleSearch = `<span className="text-2xl font-bold text-amber-600 tracking-tight uppercase">Shree Hari</span>`;
const titleReplace = `<span className="text-xl sm:text-2xl font-bold text-amber-600 tracking-tight uppercase">Shree Hari</span>`;
code = code.replace(titleSearch, titleReplace);

const gapSearch = `<div className="flex items-center gap-4">
            <Link to="/cart" className="relative p-2 text-slate-600 hover:text-amber-500 transition-colors">`;
const gapReplace = `<div className="flex items-center gap-2 sm:gap-4">
            <Link to="/cart" className="relative p-2 text-slate-600 hover:text-amber-500 transition-colors">`;
code = code.replace(gapSearch, gapReplace);

const userSearch = `{user ? (
              <div className="flex items-center gap-4">
                {user.role === 'admin' && (
                  <Link to="/admin" className="text-sm font-bold text-amber-600 bg-amber-50 border border-amber-100 px-3 py-1.5 rounded hover:bg-amber-100 transition-colors uppercase tracking-wider">Admin</Link>
                )}
                <Link to="/my-orders" className="text-sm font-bold text-slate-600 border border-slate-200 px-3 py-1.5 rounded hover:bg-slate-100 transition-colors uppercase tracking-wider">Account</Link>
                <button onClick={handleLogout} className="text-slate-600 hover:text-red-600 transition-colors" title="Logout">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link to="/login" className="flex items-center gap-2 text-slate-600 hover:text-amber-500 font-medium transition-colors">
                <User className="w-5 h-5" />
                <span className="hidden sm:inline">Login</span>
              </Link>
            )}`;

const userReplace = `{user ? (
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
            )}`;
code = code.replace(userSearch, userReplace);

const mobileMenuSearch = `{/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-4">
            <Link to="/" onClick={() => setMenuOpen(false)} className="block font-medium text-slate-800">Home</Link>
            <Link to="/products" onClick={() => setMenuOpen(false)} className="block font-medium text-slate-800">Products</Link>
            <Link to="/about" onClick={() => setMenuOpen(false)} className="block font-medium text-slate-800">About</Link>
            <Link to="/contact" onClick={() => setMenuOpen(false)} className="block font-medium text-slate-800">Contact Us</Link>
          </div>
        )}`;

const mobileMenuReplace = `{/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-4 shadow-lg absolute w-full left-0">
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
                  <Link to="/my-orders" onClick={() => setMenuOpen(false)} className="block font-medium text-slate-800 p-2 hover:bg-slate-50 rounded">My Account / Orders</Link>
                  <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="block font-medium text-red-600 p-2 hover:bg-red-50 rounded w-full text-left">Logout</button>
                </div>
              ) : (
                <Link to="/login" onClick={() => setMenuOpen(false)} className="block font-medium text-slate-800 p-2 hover:bg-slate-50 rounded">Login / Register</Link>
              )}
            </div>
          </div>
        )}`;

code = code.replace(mobileMenuSearch, mobileMenuReplace);
fs.writeFileSync('src/App.tsx', code);
