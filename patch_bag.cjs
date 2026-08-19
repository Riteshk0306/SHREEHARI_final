const fs = require('fs');

let code = fs.readFileSync('src/pages/customer/ProductDetails.tsx', 'utf-8');

// Replace ShoppingCart import
code = code.replace("import { ShoppingCart, ArrowLeft, ShieldCheck, Truck, RotateCcw }", "import { ShoppingBag, ArrowLeft, ShieldCheck, Truck, RotateCcw }");

// Replace the icon usage
code = code.replace("<ShoppingCart className=\"w-5 h-5 shrink-0\" />", "<ShoppingBag className=\"w-4 h-4 shrink-0\" />");

// Make padding a bit sleeker
code = code.replace("py-3.5 px-4 rounded-xl border border-amber-500", "py-3 px-6 rounded-full border border-amber-500");
code = code.replace("py-3.5 px-4 rounded-xl border border-slate-900", "py-3 px-6 rounded-full border border-slate-900");

fs.writeFileSync('src/pages/customer/ProductDetails.tsx', code);
