import fs from 'fs';
let code = fs.readFileSync('src/pages/customer/Products.tsx', 'utf-8');

code = code.replace("import { Package } from 'lucide-react'; // needed for empty state", "");
code = code.replace("import { ShoppingCart, Search, Filter } from 'lucide-react';", "import { ShoppingCart, Search, Filter, Package } from 'lucide-react';");

fs.writeFileSync('src/pages/customer/Products.tsx', code);
