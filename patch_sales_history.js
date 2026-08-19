import fs from 'fs';
let code = fs.readFileSync('src/pages/admin/SalesHistory.tsx', 'utf-8');

code = code.replace(
  "setOrders(data.filter((o: any) => o.orderStatus === 'Completed'));",
  "const completedOrders = data.filter((o: any) => o.orderStatus === 'Completed');\n      const sortedOrders = completedOrders.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());\n      setOrders(sortedOrders);"
);

fs.writeFileSync('src/pages/admin/SalesHistory.tsx', code);
