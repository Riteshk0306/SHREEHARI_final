const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/Orders.tsx', 'utf-8');
code = code.replace(
  '<div className="flex justify-between items-start">',
  '<div className="flex flex-col sm:flex-row justify-between items-start gap-2">'
);
fs.writeFileSync('src/pages/admin/Orders.tsx', code);
