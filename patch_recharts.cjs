const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/Dashboard.tsx', 'utf-8');

code = code.replace(/<ResponsiveContainer width="100%" height="100%">/g, '<ResponsiveContainer width="99%" height="100%">');

fs.writeFileSync('src/pages/admin/Dashboard.tsx', code);
