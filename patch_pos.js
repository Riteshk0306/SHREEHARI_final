import fs from 'fs';
let code = fs.readFileSync('src/pages/admin/POS.tsx', 'utf-8');

// Replace handleGenerateBill
const searchGenerate = `const handleGenerateBill = async () => {
    if (cart.length === 0) return alert('Cart is empty');
    if (!customerInfo.name || !customerInfo.mobile) return alert('Enter customer details');
    
    try {
      const res = await api.post('/api/bills', {
        customerName: customerInfo.name,
        mobile: customerInfo.mobile,
        items: cart,
        paymentMethod,
        date: new Date().toISOString(),
        totalAmount: total,
        profit: totalProfit,
        gstIncluded: includeGst,
        gstAmount: gst
      });
      
      // Auto-download PDF
      handleDownloadInvoice(res);`;

const replaceGenerate = `const handleGenerateBill = async () => {
    if (cart.length === 0) return alert('Cart is empty');
    if (!customerInfo.name || !customerInfo.mobile) return alert('Enter customer details');
    
    try {
      const res = await api.post('/api/orders', {
        customerName: customerInfo.name,
        mobile: customerInfo.mobile,
        address: 'In-Store',
        items: cart,
        paymentMethod,
        date: new Date().toISOString(),
        totalAmount: total,
        profit: totalProfit,
        gstIncluded: includeGst,
        gstAmount: gst,
        source: 'Admin (POS)',
        orderStatus: 'Completed'
      });
      
      // Removed auto-download PDF`;

code = code.replace(searchGenerate, replaceGenerate);
fs.writeFileSync('src/pages/admin/POS.tsx', code);
