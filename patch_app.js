import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Add BarChart icon import
content = content.replace(
  "import { LayoutDashboard, Package, ShoppingBag, MessageSquare, LogOut, Menu, FileText } from 'lucide-react';",
  "import { LayoutDashboard, Package, ShoppingBag, MessageSquare, LogOut, Menu, FileText, BarChart } from 'lucide-react';"
);

// Add SalesHistory to links
content = content.replace(
  '{ to: "/admin/pos", icon: FileText, label: "POS / Bill" },\n    { to: "/admin/contacts", icon: MessageSquare, label: "Messages" },',
  `{ to: "/admin/pos", icon: FileText, label: "POS / Bill" },
    { to: "/admin/sales", icon: BarChart, label: "Sales History" },
    { to: "/admin/contacts", icon: MessageSquare, label: "Messages" },`
);

// Import SalesHistory component
content = content.replace(
  "import POS from './pages/admin/POS';\nimport AdminContacts from './pages/admin/Contacts';",
  "import POS from './pages/admin/POS';\nimport SalesHistory from './pages/admin/SalesHistory';\nimport AdminContacts from './pages/admin/Contacts';"
);

// Add Route
content = content.replace(
  `<Route path="pos" element={<POS />} />\n          <Route path="contacts" element={<AdminContacts />} />`,
  `<Route path="pos" element={<POS />} />
          <Route path="sales" element={<SalesHistory />} />
          <Route path="contacts" element={<AdminContacts />} />`
);

fs.writeFileSync('src/App.tsx', content);
