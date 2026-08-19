const fs = require('fs');
let code = fs.readFileSync('src/api.ts', 'utf-8');

// For Supabase block
code = code.replace(
  "const totalRevenue = orders.filter(o => o.orderStatus === 'Completed').reduce((sum, o) => sum + o.totalAmount, 0);",
  "const totalRevenue = orders.filter(o => o.orderStatus !== 'Cancelled').reduce((sum, o) => sum + o.totalAmount, 0);"
);
code = code.replace(
  "const totalProfit = orders.filter(o => o.orderStatus === 'Completed').reduce((sum, o) => sum + (o.profit || 0), 0);",
  "const totalProfit = orders.filter(o => o.orderStatus !== 'Cancelled').reduce((sum, o) => sum + (o.profit || 0), 0);"
);
code = code.replace(
  "const todaysSales = orders.filter(o => o.orderStatus === 'Completed' && (o.date || '').startsWith(todayStr)).reduce((sum, o) => sum + o.totalAmount, 0);",
  "const todaysSales = orders.filter(o => o.orderStatus !== 'Cancelled' && (o.date || '').startsWith(todayStr)).reduce((sum, o) => sum + o.totalAmount, 0);"
);

// For Mock block
code = code.replace(
  "const totalRevenue = mockOrders.filter(o => o.orderStatus === 'Completed').reduce((sum, o) => sum + o.totalAmount, 0);",
  "const totalRevenue = mockOrders.filter(o => o.orderStatus !== 'Cancelled').reduce((sum, o) => sum + o.totalAmount, 0);"
);
code = code.replace(
  "const totalProfit = mockOrders.filter(o => o.orderStatus === 'Completed').reduce((sum, o) => sum + (o.profit || 0), 0);",
  "const totalProfit = mockOrders.filter(o => o.orderStatus !== 'Cancelled').reduce((sum, o) => sum + (o.profit || 0), 0);"
);
code = code.replace(
  "const todaysSales = mockOrders.filter(o => o.orderStatus === 'Completed' && (o.date || '').startsWith(todayStr)).reduce((sum, o) => sum + o.totalAmount, 0);",
  "const todaysSales = mockOrders.filter(o => o.orderStatus !== 'Cancelled' && (o.date || '').startsWith(todayStr)).reduce((sum, o) => sum + o.totalAmount, 0);"
);

fs.writeFileSync('src/api.ts', code);
