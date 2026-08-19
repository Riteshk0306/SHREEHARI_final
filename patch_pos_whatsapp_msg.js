import fs from 'fs';
let code = fs.readFileSync('src/pages/admin/POS.tsx', 'utf-8');

const searchMessage = `         // Fallback to whatsapp web if share is not supported
         const message = \\\`*New Bill Generated!*\\n\\n*Name:* \${customerInfo.name}\\n*Amount:* ₹\${total.toFixed(2)}\\n\\n*Items:*\\n\${cart.map((item: any) => \`- \${item.name} x\${item.quantity}\`).join('\\n')}\\n\\n*Bill ID:* \${res.invoiceNumber || res.billNumber || 'Pending'}\\n\\n_Thank you for shopping with Shree Hari. Please find the attached PDF._\\\`;
         const whatsappUrl = \\\`https://wa.me/91\${customerInfo.mobile}?text=\${encodeURIComponent(message)}\\\`;
         window.open(whatsappUrl, '_blank');
         msg += " PDF Downloaded & WhatsApp opened.";`;

const replaceMessage = `         // Fallback to whatsapp web if share is not supported
         const message = \\\`_Thank you for shopping with Shree Hari. Please find your invoice attached._\\\`;
         const whatsappUrl = \\\`https://wa.me/91\${customerInfo.mobile}?text=\${encodeURIComponent(message)}\\\`;
         window.open(whatsappUrl, '_blank');
         msg += " WhatsApp opened (Please attach PDF from Orders manually).";`;

code = code.replace(searchMessage, replaceMessage);
fs.writeFileSync('src/pages/admin/POS.tsx', code);
