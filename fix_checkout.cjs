const fs = require('fs');
let code = fs.readFileSync('src/pages/customer/Checkout.tsx', 'utf-8');

code = code.replace(
  "const [paymentMethod,\n        paymentStatus: paymentMethod === 'Cash on Delivery' ? 'Pending' : 'Paid', setPaymentMethod] = useState('UPI');",
  "const [paymentMethod, setPaymentMethod] = useState('UPI');"
);

code = code.replace(
  "paymentMethod,\n        date: new Date().toISOString(),",
  "paymentMethod,\n        paymentStatus: paymentMethod === 'Cash on Delivery' ? 'Pending' : 'Paid',\n        date: new Date().toISOString(),"
);

fs.writeFileSync('src/pages/customer/Checkout.tsx', code);
