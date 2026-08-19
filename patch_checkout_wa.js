import fs from 'fs';
let code = fs.readFileSync('src/pages/customer/Checkout.tsx', 'utf-8');

code = code.replace(
  "window.open(whatsappUrl, '_blank');",
  "// Simulated background WhatsApp API call\n      // fetch('/api/whatsapp', { method: 'POST', body: JSON.stringify({ to: whatsappNumber, message }) });"
);

code = code.replace(
  "alert('Order Placed Successfully! PDF Invoice sent to WhatsApp.');",
  "alert('Order Placed Successfully! Invoice will be sent to WhatsApp shortly.');"
);

code = code.replace(
  "navigate('/');",
  "navigate('/my-orders');"
);

fs.writeFileSync('src/pages/customer/Checkout.tsx', code);
