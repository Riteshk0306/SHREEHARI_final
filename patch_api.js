import fs from 'fs';
let code = fs.readFileSync('src/api.ts', 'utf-8');

// Fix Supabase block
code = code.replace(
  "const orderData = { ...data, invoiceNumber: 'INV-' + Date.now(), orderStatus: 'Pending' };",
  "const orderData = { ...data, invoiceNumber: 'INV-' + Date.now(), orderStatus: data.orderStatus || 'Pending' };"
);

// Fix Mock block
code = code.replace(
  "const order = { ...data, id: Date.now().toString(), invoiceNumber: 'INV-' + Date.now(), orderStatus: 'Pending' };",
  "const order = { ...data, id: Date.now().toString(), invoiceNumber: 'INV-' + Date.now(), orderStatus: data.orderStatus || 'Pending' };"
);

fs.writeFileSync('src/api.ts', code);
