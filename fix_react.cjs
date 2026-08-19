const fs = require('fs');

for (const file of ['src/pages/customer/Home.tsx', 'src/pages/customer/Products.tsx']) {
  let code = fs.readFileSync(file, 'utf-8');
  code = code.replace(/React\.MouseEvent/g, 'any');
  fs.writeFileSync(file, code);
}
