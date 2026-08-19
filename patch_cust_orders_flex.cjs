const fs = require('fs');
let code = fs.readFileSync('src/pages/customer/Orders.tsx', 'utf-8');
code = code.replace(
  '<div className="flex justify-between items-start">',
  '<div className="flex flex-col sm:flex-row justify-between items-start gap-4">'
);
code = code.replace(
  '<div className="text-right">',
  '<div className="text-left sm:text-right">'
);
fs.writeFileSync('src/pages/customer/Orders.tsx', code);
