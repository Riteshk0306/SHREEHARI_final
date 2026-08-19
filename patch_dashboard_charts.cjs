const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/Dashboard.tsx', 'utf-8');

// Add chart data state
code = code.replace(
  "const [pendingModalOpen, setPendingModalOpen] = useState(false);",
  "const [pendingModalOpen, setPendingModalOpen] = useState(false);\n  const [chartData, setChartData] = useState<any[]>([]);"
);

const fetchCode = `
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
    api.get('/api/orders').then(orders => {
      // Create last 7 days chart data
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        days.push({
          dateStr: d.toISOString().split('T')[0],
          name: d.toLocaleDateString('en-US', { weekday: 'short' }),
          revenue: 0,
          ordersCount: 0
        });
      }
      orders.forEach((o: any) => {
        if (o.orderStatus !== 'Cancelled' && o.date) {
          const dStr = o.date.split('T')[0];
          const day = days.find(d => d.dateStr === dStr);
          if (day) {
            day.revenue += (o.totalAmount || 0);
            day.ordersCount += 1;
          }
        }
      });
      setChartData(days);
    });
`;

code = code.replace(
  /api\.get\('\/api\/stats'\)\.then\(setStats\);\s*api\.get\('\/api\/customers'\)\.then\(customers => \{[\s\S]*?setOverdueCustomers\(overdue\);\s*\}\);/g,
  fetchCode
);

const mockChartDataDef = `  const mockChartData = [
    { name: 'Mon', revenue: 4000 },
    { name: 'Tue', revenue: 3000 },
    { name: 'Wed', revenue: 2000 },
    { name: 'Thu', revenue: 2780 },
    { name: 'Fri', revenue: 1890 },
    { name: 'Sat', revenue: 2390 },
    { name: 'Sun', revenue: 3490 },
  ];`;
code = code.replace(mockChartDataDef, "");

code = code.replace(/<BarChart data={mockChartData}>/g, '<BarChart data={chartData}>');
code = code.replace(/<LineChart data={mockChartData}>/g, '<LineChart data={chartData}>');

// Update LineChart dataKey to ordersCount for trend of orders
code = code.replace(
  '<Line type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={3}',
  '<Line type="monotone" dataKey="ordersCount" stroke="#f59e0b" strokeWidth={3}'
);

fs.writeFileSync('src/pages/admin/Dashboard.tsx', code);
