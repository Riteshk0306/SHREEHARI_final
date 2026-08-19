import fs from 'fs';
let code = fs.readFileSync('src/pages/customer/Contact.tsx', 'utf-8');

code = code.replace(
  "window.open(whatsappUrl, '_blank');",
  "// Simulated background WhatsApp API call\n      // fetch('/api/whatsapp', { method: 'POST', body: JSON.stringify({ to: whatsappNumber, message: waMessage }) });"
);

fs.writeFileSync('src/pages/customer/Contact.tsx', code);
