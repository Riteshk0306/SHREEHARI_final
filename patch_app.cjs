const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf-8');

// Update imports
if (!code.includes("import Profile from './pages/customer/Profile';")) {
  code = code.replace(
    "import MyOrders from './pages/customer/Orders';",
    "import MyOrders from './pages/customer/Orders';\nimport Profile from './pages/customer/Profile';"
  );
}

// Update routes
if (!code.includes('<Route path="profile/*" element={<Profile />} />')) {
  code = code.replace(
    '<Route path="my-orders" element={<MyOrders />} />',
    '<Route path="my-orders" element={<MyOrders />} />\n          <Route path="profile/*" element={<Profile />} />'
  );
}

// Update nav link in Header
code = code.replace(
  '<Link to="/my-orders" onClick={() => setMenuOpen(false)} className="block font-medium text-slate-800 p-2 hover:bg-slate-50 rounded">My Account / Orders</Link>',
  '<Link to="/profile" onClick={() => setMenuOpen(false)} className="block font-medium text-slate-800 p-2 hover:bg-slate-50 rounded">My Account</Link>'
);

code = code.replace(
  '<Link to="/my-orders" className="text-slate-600 hover:text-amber-500 font-medium transition-colors">My Account</Link>',
  '<Link to="/profile" className="text-slate-600 hover:text-amber-500 font-medium transition-colors">My Account</Link>'
);

fs.writeFileSync('src/App.tsx', code);
