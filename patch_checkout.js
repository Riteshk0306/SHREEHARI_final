import fs from 'fs';
let code = fs.readFileSync('src/pages/customer/Checkout.tsx', 'utf-8');

code = code.replace(
  "import React, { useState } from 'react';",
  "import React, { useState, useEffect } from 'react';"
);

code = code.replace(
  "const [loading, setLoading] = useState(false);",
  `const [loading, setLoading] = useState(false);
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [mobileNumber, setMobileNumber] = useState(user?.mobile || '');
  
  useEffect(() => {
    if (user) {
      if (!customerName) setCustomerName(user.name);
      if (!mobileNumber) setMobileNumber(user.mobile);
    }
  }, [user]);`
);

code = code.replace(
  "customerName: user.name,",
  "customerName: customerName,"
);

code = code.replace(
  "mobile: user.mobile,",
  "mobile: mobileNumber,"
);

code = code.replace(
  "await api.post('/api/orders', order);",
  `const res = await api.post('/api/orders', order);
      
      const whatsappNumber = "917058117155";
      const message = \`*New Order Placed!*\\n\\n*Name:* \${customerName}\\n*Mobile:* \${mobileNumber}\\n*Address:* \${address}\\n*Payment:* \${paymentMethod}\\n*Amount:* ₹\${total.toFixed(2)}\\n\\n*Items:*\\n\${cart.map((item: any) => \`- \${item.name} x\${item.quantity}\`).join('\\n')}\\n\\n*Order ID:* \${res.invoiceNumber || 'Pending'}\`;
      const whatsappUrl = \`https://wa.me/\${whatsappNumber}?text=\${encodeURIComponent(message)}\`;
      window.open(whatsappUrl, '_blank');
`
);

code = code.replace(
  `<input type="text" value={user.name} disabled className="w-full px-4 py-2.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 font-medium" />`,
  `<input type="text" required value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 font-medium text-slate-900 transition-all bg-white" />`
);

code = code.replace(
  `<input type="text" value={user.mobile} disabled className="w-full px-4 py-2.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 font-medium" />`,
  `<input type="tel" required value={mobileNumber} onChange={e => setMobileNumber(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 font-medium text-slate-900 transition-all bg-white" />`
);

fs.writeFileSync('src/pages/customer/Checkout.tsx', code);
