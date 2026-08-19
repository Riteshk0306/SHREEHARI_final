import fs from 'fs';
let code = fs.readFileSync('src/pages/admin/Orders.tsx', 'utf-8');

code = code.replace(/const fetchOrders = \(\) => api\.get\('\/api\/orders'\)\.then\(setOrders\);/g, `const fetchOrders = () => api.get('/api/orders').then(data => {
    const sorted = [...data].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setOrders(sorted);
  });`);

fs.writeFileSync('src/pages/admin/Orders.tsx', code);
