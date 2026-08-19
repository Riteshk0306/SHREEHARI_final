const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/Products.tsx', 'utf-8');

code = code.replace(
  '<button onClick={handleDownloadStockList} className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg font-medium hover:bg-slate-50 transition flex items-center gap-2 whitespace-nowrap text-sm tracking-wide shadow-sm">',
  '<button onClick={handleDownloadStockList} className="w-full sm:w-auto justify-center bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg font-medium hover:bg-slate-50 transition flex items-center gap-2 whitespace-nowrap text-sm tracking-wide shadow-sm">'
);

code = code.replace(
  '<button onClick={openAddModal} className="bg-slate-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-slate-800 transition flex items-center gap-2 whitespace-nowrap text-sm tracking-wide shadow-sm">',
  '<button onClick={openAddModal} className="w-full sm:w-auto justify-center bg-slate-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-slate-800 transition flex items-center gap-2 whitespace-nowrap text-sm tracking-wide shadow-sm">'
);

fs.writeFileSync('src/pages/admin/Products.tsx', code);
