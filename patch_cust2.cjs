const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/Customers.tsx', 'utf-8');

const historyHtml = `              </div>

              {selectedCustomer.paymentHistory && selectedCustomer.paymentHistory.length > 0 && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 max-h-40 overflow-y-auto">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Payment History</h4>
                  <div className="space-y-2">
                    {[...selectedCustomer.paymentHistory].reverse().map((hist, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm">
                        <span className="text-slate-500 font-medium">{format(new Date(hist.date), 'dd MMM yyyy, hh:mm a')}</span>
                        <span className="text-emerald-600 font-bold">+ ₹{Number(hist.amount).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-4">`;

code = code.replace(/<\/div>\s*<div className="space-y-4">/, historyHtml);

fs.writeFileSync('src/pages/admin/Customers.tsx', code);
