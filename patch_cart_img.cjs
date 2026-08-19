const fs = require('fs');
let code = fs.readFileSync('src/pages/customer/Cart.tsx', 'utf-8');
code = code.replace(
  '<div key={item.productId} className="flex gap-6 bg-white p-4 rounded-xl shadow-sm border border-slate-200">',
  '<div key={item.productId} className="flex flex-col sm:flex-row gap-4 sm:gap-6 bg-white p-4 rounded-xl shadow-sm border border-slate-200">'
);
code = code.replace(
  '<img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-lg bg-slate-100" referrerPolicy="no-referrer" />',
  '<img src={item.image} alt={item.name} className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg bg-slate-100 shrink-0" referrerPolicy="no-referrer" />'
);
fs.writeFileSync('src/pages/customer/Cart.tsx', code);
