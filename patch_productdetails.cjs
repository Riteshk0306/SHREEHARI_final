const fs = require('fs');
let code = fs.readFileSync('src/pages/customer/ProductDetails.tsx', 'utf-8');

code = code.replace(
  '<div className="flex items-center gap-6">',
  '<div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">'
);

code = code.replace(
  '<div className="flex gap-4">',
  '<div className="flex flex-col sm:flex-row gap-4">'
);

code = code.replace(
  'className="flex-1 bg-amber-50 text-amber-600 font-bold py-3 md:py-4 rounded-xl border-2 border-amber-500 hover:bg-amber-100 transition-colors flex items-center justify-center gap-2 text-sm md:text-base"',
  'className="flex-1 bg-amber-50 text-amber-600 font-bold py-3 md:py-4 rounded-xl border border-amber-500 hover:bg-amber-100 transition-colors flex items-center justify-center gap-2 text-sm uppercase tracking-wider shadow-sm w-full"'
);

code = code.replace(
  'className="flex-1 bg-amber-500 text-white font-bold py-3 md:py-4 rounded-xl hover:bg-amber-600 transition-colors flex items-center justify-center gap-2 text-sm md:text-base"',
  'className="flex-1 bg-slate-900 text-white font-bold py-3 md:py-4 rounded-xl hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 text-sm uppercase tracking-wider shadow-sm w-full"'
);

fs.writeFileSync('src/pages/customer/ProductDetails.tsx', code);
