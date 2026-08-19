import fs from 'fs';
let code = fs.readFileSync('src/pages/customer/Checkout.tsx', 'utf-8');

code = code.replace(
  "const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;",
  ""
);

fs.writeFileSync('src/pages/customer/Checkout.tsx', code);
