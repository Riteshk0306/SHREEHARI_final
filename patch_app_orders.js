import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  "import Register from './pages/auth/Register';",
  "import Register from './pages/auth/Register';\nimport MyOrders from './pages/customer/Orders';"
);

code = code.replace(
  '<Route path="register" element={<Register />} />',
  '<Route path="register" element={<Register />} />\n          <Route path="my-orders" element={<MyOrders />} />'
);

code = code.replace(
  '<button onClick={handleLogout} className="text-slate-600 hover:text-red-600 transition-colors" title="Logout">',
  `<Link to="/my-orders" className="text-sm font-bold text-slate-600 border border-slate-200 px-3 py-1.5 rounded hover:bg-slate-100 transition-colors uppercase tracking-wider">Account</Link>
                <button onClick={handleLogout} className="text-slate-600 hover:text-red-600 transition-colors" title="Logout">`
);

fs.writeFileSync('src/App.tsx', code);
