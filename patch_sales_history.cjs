const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/SalesHistory.tsx', 'utf-8');

// Modify fetchOrders to include all except cancelled
code = code.replace(
  "const completedOrders = data.filter((o: any) => o.orderStatus === 'Completed');",
  "const completedOrders = data.filter((o: any) => o.orderStatus !== 'Cancelled');"
);

// Add Source header
code = code.replace(
  '<th className="p-4 font-bold text-slate-900">Customer</th>',
  '<th className="p-4 font-bold text-slate-900">Source</th>\n                <th className="p-4 font-bold text-slate-900">Customer</th>'
);

// Update colSpan
code = code.replace(
  '<td colSpan={5} className="p-8 text-center text-slate-500 font-medium">',
  '<td colSpan={6} className="p-8 text-center text-slate-500 font-medium">'
);

// Add Source column to rows
const sourceCol = `<td className="p-4 font-medium">
                      {order.address === 'In-Store' ? (
                        <span className="text-amber-600 bg-amber-50 px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wide border border-amber-200">Admin POS</span>
                      ) : (
                        <span className="text-blue-600 bg-blue-50 px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wide border border-blue-200">Customer Online</span>
                      )}
                    </td>`;

code = code.replace(
  /<td className="p-4 text-slate-600">\{order\.customerName \|\| 'Walk-in'\}<\/td>/,
  sourceCol + '\n                    <td className="p-4 text-slate-600">{order.customerName || "Walk-in"}</td>'
);

fs.writeFileSync('src/pages/admin/SalesHistory.tsx', code);
