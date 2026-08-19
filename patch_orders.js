import fs from 'fs';
let code = fs.readFileSync('src/pages/admin/Orders.tsx', 'utf-8');

const searchOrderHeader = `<h3 className="text-lg font-bold text-slate-900">{order.invoiceNumber}</h3>`;
const replaceOrderHeader = `<div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900">{order.invoiceNumber}</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-slate-100 text-slate-600 border border-slate-200">
                      {order.source || 'Customer'}
                    </span>
                  </div>`;

code = code.replace(searchOrderHeader, replaceOrderHeader);
fs.writeFileSync('src/pages/admin/Orders.tsx', code);
