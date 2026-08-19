const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/Dashboard.tsx', 'utf-8');

// Add customers state
code = code.replace(
  "const [stockProducts, setStockProducts] = useState<any[]>([]);",
  "const [stockProducts, setStockProducts] = useState<any[]>([]);\n  const [overdueCustomers, setOverdueCustomers] = useState<any[]>([]);"
);

// Fetch customers
const fetchCustomers = `
    api.get('/api/stats').then(setStats);
    api.get('/api/customers').then(customers => {
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
  "api.get('/api/stats').then(setStats);",
  fetchCustomers
);

// Add Alert
const overdueAlert = `
      {overdueCustomers.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3 shadow-sm shadow-amber-100">
          <AlertTriangle className="text-amber-500 w-5 h-5 shrink-0" />
          <div>
            <h3 className="text-amber-800 font-bold text-sm">Payment Collection Required</h3>
            <p className="text-amber-700 text-xs mt-1">{overdueCustomers.length} customers have overdue payments pending for more than a month or have reached their reminder date. Check the Customers Ledger.</p>
          </div>
        </div>
      )}
`;

code = code.replace(
  "{stats.lowStockProducts > 0 && (",
  overdueAlert + "\n      {stats.lowStockProducts > 0 && ("
);

fs.writeFileSync('src/pages/admin/Dashboard.tsx', code);
