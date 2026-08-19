const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/POS.tsx', 'utf-8');

code = code.replace(
  "const [paymentMethod,\n        paidAmount: paidAmount === '' ? total : paidAmount,\n        paymentStatus: (paidAmount === '' || paidAmount >= total) ? 'Paid' : 'Pending', setPaymentMethod] = useState('Cash');",
  "const [paymentMethod, setPaymentMethod] = useState('Cash');"
);

// Now correctly replace in handleGenerateBill
const badApiPost = `
      const res = await api.post('/api/orders', {
        customerName: customerInfo.name,
        mobile: customerInfo.mobile,
        address: 'In-Store',
        items: cart,
        paymentMethod,
        date: new Date().toISOString(),
`;

const goodApiPost = `
      const res = await api.post('/api/orders', {
        customerName: customerInfo.name,
        mobile: customerInfo.mobile,
        address: 'In-Store',
        items: cart,
        paymentMethod,
        paidAmount: paidAmount === '' ? total : paidAmount,
        paymentStatus: (paidAmount === '' || paidAmount >= total) ? 'Paid' : 'Pending',
        date: new Date().toISOString(),
`;

code = code.replace(badApiPost, goodApiPost);

fs.writeFileSync('src/pages/admin/POS.tsx', code);
