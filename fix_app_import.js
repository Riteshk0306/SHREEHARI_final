import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');
content = content.replace(
  "import { ShoppingCart, User, LogOut, Package, LayoutDashboard, FileText, Settings, ShoppingBag, Menu, X, MessageSquare } from 'lucide-react';",
  "import { ShoppingCart, User, LogOut, Package, LayoutDashboard, FileText, Settings, ShoppingBag, Menu, X, MessageSquare, BarChart } from 'lucide-react';"
);
fs.writeFileSync('src/App.tsx', content);
