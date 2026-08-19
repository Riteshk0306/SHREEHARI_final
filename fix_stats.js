import fs from 'fs';
let code = fs.readFileSync('src/api.ts', 'utf-8');

// For Supabase
code = code.replace(
  "const totalCustomers = users.filter(u => u.role === 'customer').length;\n        \n        return { totalOrders, totalRevenue, totalProfit, totalProducts, totalCustomers, todaysSales: totalRevenue, lowStockProducts, outOfStockProducts };",
  `const totalCustomers = users.filter(u => u.role === 'customer').length;
        const todayStr = new Date().toISOString().split('T')[0];
        const todaysSales = orders.filter(o => o.orderStatus === 'Completed' && (o.date || '').startsWith(todayStr)).reduce((sum, o) => sum + o.totalAmount, 0);
        return { totalOrders, totalRevenue, totalProfit, totalProducts, totalCustomers, todaysSales, lowStockProducts, outOfStockProducts };`
);

// For Mock
code = code.replace(
  "const totalCustomers = 0;\n        return { totalOrders, totalRevenue, totalProfit, totalProducts, totalCustomers, todaysSales: totalRevenue, lowStockProducts, outOfStockProducts };",
  `const totalCustomers = 0;
        const todayStr = new Date().toISOString().split('T')[0];
        const todaysSales = mockOrders.filter(o => o.orderStatus === 'Completed' && (o.date || '').startsWith(todayStr)).reduce((sum, o) => sum + o.totalAmount, 0);
        return { totalOrders, totalRevenue, totalProfit, totalProducts, totalCustomers, todaysSales, lowStockProducts, outOfStockProducts };`
);

fs.writeFileSync('src/api.ts', code);
