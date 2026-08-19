const fs = require('fs');
let code = fs.readFileSync('src/api.ts', 'utf-8');

// 1. Add mockCustomers
code = code.replace(
  "let mockContacts: any[] = [];",
  "let mockContacts: any[] = [];\nlet mockCustomers: any[] = [];"
);

// 2. Add /api/customers to GET
const getSupabase = `
      if (url === '/api/customers') {
        const { data, error } = await supabase.from('customers').select('*');
        if (error) throw error;
        return data;
      }
`;
code = code.replace(
  "if (url === '/api/products') {",
  getSupabase + "      if (url === '/api/products') {"
);

const getMock = `
      if (url === '/api/customers') return mockCustomers;
`;
code = code.replace(
  "if (url === '/api/products') return mockProducts;",
  getMock + "      if (url === '/api/products') return mockProducts;"
);

// 3. Update stats to include customers from mockCustomers (or users? wait, totalCustomers was from users before).
code = code.replace(
  "const totalCustomers = mockCustomers.length;",
  "const totalCustomers = mockCustomers.length;" // wait, the original was "const totalCustomers = 0;"
);
code = code.replace(
  "const totalCustomers = 0;",
  "const totalCustomers = mockCustomers.length;"
);

// 4. Update /api/orders POST
const postOrderSupabase = `
      if (url === '/api/orders') {
        const orderData = { ...data, invoiceNumber: 'INV-' + Date.now(), orderStatus: data.orderStatus || 'Pending' };
        
        // Customer Ledger Update (Supabase)
        if (orderData.mobile) {
          try {
            const { data: existingCust } = await supabase.from('customers').select('*').eq('mobile', orderData.mobile).single();
            const paid = orderData.paidAmount !== undefined ? orderData.paidAmount : (orderData.paymentStatus === 'Paid' ? orderData.totalAmount : 0);
            const due = orderData.totalAmount - paid;
            
            if (existingCust) {
              await supabase.from('customers').update({
                totalPurchases: existingCust.totalPurchases + orderData.totalAmount,
                totalPaid: existingCust.totalPaid + paid,
                totalDue: existingCust.totalDue + due,
                lastPurchaseDate: new Date().toISOString()
              }).eq('id', existingCust.id);
            } else {
              await supabase.from('customers').insert([{
                id: Date.now().toString(),
                name: orderData.customerName || 'Unknown',
                mobile: orderData.mobile,
                totalPurchases: orderData.totalAmount,
                totalPaid: paid,
                totalDue: due,
                lastPurchaseDate: new Date().toISOString()
              }]);
            }
          } catch(e) { console.warn("Customer ledger update failed in Supabase"); }
        }

        const { data: res, error } = await supabase.from('orders').insert([orderData]).select().single();
`;

code = code.replace(
  "if (url === '/api/orders') {\n        const orderData = { ...data, invoiceNumber: 'INV-' + Date.now(), orderStatus: data.orderStatus || 'Pending' };\n        const { data: res, error } = await supabase.from('orders').insert([orderData]).select().single();",
  postOrderSupabase
);

const postOrderMock = `
      if (url === '/api/orders') {
        const order = { ...data, id: Date.now().toString(), invoiceNumber: 'INV-' + Date.now(), orderStatus: data.orderStatus || 'Pending' };
        
        // Customer Ledger Update (Mock)
        if (order.mobile) {
          const paid = order.paidAmount !== undefined ? order.paidAmount : (order.paymentStatus === 'Paid' ? order.totalAmount : 0);
          const due = order.totalAmount - paid;
          
          let custIndex = mockCustomers.findIndex(c => c.mobile === order.mobile);
          if (custIndex >= 0) {
            mockCustomers[custIndex].totalPurchases += order.totalAmount;
            mockCustomers[custIndex].totalPaid += paid;
            mockCustomers[custIndex].totalDue += due;
            mockCustomers[custIndex].lastPurchaseDate = new Date().toISOString();
          } else {
            mockCustomers.push({
              id: Date.now().toString(),
              name: order.customerName || 'Unknown',
              mobile: order.mobile,
              totalPurchases: order.totalAmount,
              totalPaid: paid,
              totalDue: due,
              lastPurchaseDate: new Date().toISOString()
            });
          }
        }

        order.items?.forEach((item: any) => {
`;

code = code.replace(
  "if (url === '/api/orders') {\n        const order = { ...data, id: Date.now().toString(), invoiceNumber: 'INV-' + Date.now(), orderStatus: data.orderStatus || 'Pending' };\n        order.items?.forEach((item: any) => {",
  postOrderMock
);

// 5. Add /api/customers PUT for manual payment/updates
const putCustomerSupabase = `
      if (url.startsWith('/api/customers/')) {
        const id = url.split('/').pop();
        const { data: res, error } = await supabase.from('customers').update(data).eq('id', id).select().single();
        if (error) throw error;
        return res;
      }
`;
code = code.replace(
  "if (url.startsWith('/api/orders/')) {",
  putCustomerSupabase + "      if (url.startsWith('/api/orders/')) {"
);

const putCustomerMock = `
      if (url.startsWith('/api/customers/')) {
        const id = url.split('/').pop();
        mockCustomers = mockCustomers.map(c => c.id === id ? { ...c, ...data } : c);
        return mockCustomers.find(c => c.id === id);
      }
`;
code = code.replace(
  "if (url.startsWith('/api/orders/')) {",
  putCustomerMock + "      if (url.startsWith('/api/orders/')) {" // Note: this replaces the second occurrence (in catch)
);

fs.writeFileSync('src/api.ts', code);
