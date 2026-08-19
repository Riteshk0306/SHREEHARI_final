const fs = require('fs');
let code = fs.readFileSync('src/pages/customer/Checkout.tsx', 'utf-8');

code = code.replace(
  "paymentMethod,",
  "paymentMethod,\n        paymentStatus: paymentMethod === 'Cash on Delivery' ? 'Pending' : 'Paid',"
);

fs.writeFileSync('src/pages/customer/Checkout.tsx', code);
