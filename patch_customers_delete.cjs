const fs = require('fs');

let code = fs.readFileSync('src/pages/admin/Customers.tsx', 'utf-8');

if (code.includes('if (!window.confirm(')) {
  code = code.replace(
    /if \(!window\.confirm\("Are you sure you want to delete this customer's payment history\?"\)\) return;/g,
    '// Bypassing window.confirm for iframe compatibility'
  );
}

fs.writeFileSync('src/pages/admin/Customers.tsx', code);
