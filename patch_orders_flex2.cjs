const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/Orders.tsx', 'utf-8');
code = code.replace(
  '<div className="text-right">',
  '<div className="text-left sm:text-right">'
);
fs.writeFileSync('src/pages/admin/Orders.tsx', code);
