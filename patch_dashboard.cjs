const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/Dashboard.tsx', 'utf-8');

// Add customers state for the pending modal
code = code.replace(
  "const [overdueCustomers, setOverdueCustomers] = useState<any[]>([]);",
  "const [overdueCustomers, setOverdueCustomers] = useState<any[]>([]);\n  const [allCustomers, setAllCustomers] = useState<any[]>([]);\n  const [pendingModalOpen, setPendingModalOpen] = useState(false);"
);

// Modify fetchCustomers to also set allCustomers
const fetchCustomers = `
    api.get('/api/stats').then(setStats);
    api.get('/api/customers').then(customers => {
      setAllCustomers(customers);
      const now = new Date();
      const overdue = customers.filter((c: any) => {
        if (c.totalDue <= 0) return false;
        if (c.paymentReminderDate) {
          return new Date(c.paymentReminderDate) <= now;
        }
        if (c.lastPurchaseDate) {
          const diffTime = Math.abs(now.getTime() - new Date(c.lastPurchaseDate).getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays > 30;
        }
        return false;
      });
      setOverdueCustomers(overdue);
    });
`;
code = code.replace(
  /api\.get\('\/api\/stats'\)\.then\(setStats\);\s*api\.get\('\/api\/customers'\)\.then\(customers => \{[\s\S]*?setOverdueCustomers\(overdue\);\s*\}\);/g,
  fetchCustomers
);

// Replace "Total Profit" with "Total Pending Amount"
// Calculate total pending
const totalPendingCalc = `
  const totalPending = allCustomers.reduce((sum, c) => sum + (c.totalDue || 0), 0);
  const pendingCustomers = allCustomers.filter(c => c.totalDue > 0);
`;
code = code.replace(
  "if (!stats) return",
  totalPendingCalc + "\n  if (!stats) return"
);

code = code.replace(
  '<StatCard title="Total Profit" value={`₹${stats.totalProfit.toLocaleString()}`} subtitle="All time profit" />',
  '<StatCard title="Pending Amount" value={`₹${totalPending.toLocaleString()}`} subtitle={`${pendingCustomers.length} customers`} subtitleColor="text-amber-600 underline cursor-pointer" onClick={() => setPendingModalOpen(true)} />'
);

// Add the Pending Modal
const pendingModal = `
      {pendingModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div>
                <h2 className="text-lg font-bold text-slate-900 uppercase tracking-tight">Pending Amounts</h2>
                <p className="text-slate-500 text-sm font-medium">List of customers with outstanding balances</p>
              </div>
              <button onClick={() => setPendingModalOpen(false)} className="text-slate-400 hover:text-red-500 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-auto p-6">
              {pendingCustomers.length === 0 ? (
                <div className="text-center text-slate-500 font-medium py-8">No pending amounts.</div>
              ) : (
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="p-3 font-bold text-slate-900">Customer</th>
                      <th className="p-3 font-bold text-slate-900">Mobile</th>
                      <th className="p-3 font-bold text-slate-900 text-right">Pending Amount</th>
                      <th className="p-3 font-bold text-slate-900 text-right">Last Purchase</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pendingCustomers.sort((a, b) => b.totalDue - a.totalDue).map(c => (
                      <tr key={c.id} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-slate-900">{c.name}</td>
                        <td className="p-3 text-slate-600 font-medium">{c.mobile}</td>
                        <td className="p-3 text-right font-bold text-amber-600">₹{Number(c.totalDue || 0).toFixed(2)}</td>
                        <td className="p-3 text-right text-slate-600 font-medium">
                          {c.lastPurchaseDate ? new Date(c.lastPurchaseDate).toLocaleDateString('en-GB') : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
`;

code = code.replace(
  "{stockModalType && (",
  pendingModal + "\n      {stockModalType && ("
);

fs.writeFileSync('src/pages/admin/Dashboard.tsx', code);
