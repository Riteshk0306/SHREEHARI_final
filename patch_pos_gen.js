import fs from 'fs';
let code = fs.readFileSync('src/pages/admin/POS.tsx', 'utf-8');

const search = `// Removed auto-download PDF

      let msg = "Bill generated successfully!";
      
      if (sendWhatsapp) {
        const message = \\\`*New Bill Generated!*\\n\\n*Name:* \${customerInfo.name}\\n*Amount:* ₹\${total.toFixed(2)}\\n\\n*Items:*\\n\${cart.map((item: any) => \`- \${item.name} x\${item.quantity}\`).join('\\n')}\\n\\n*Bill ID:* \${res.billNumber || 'Pending'}\\n\\n_Thank you for shopping with Shree Hari. Your invoice PDF will be shared shortly._\\\`;
        const whatsappUrl = \\\`https://wa.me/91\${customerInfo.mobile}?text=\${encodeURIComponent(message)}\\\`;
        // Open whatsapp in new tab
        window.open(whatsappUrl, '_blank');
        msg += " WhatsApp opened.";
      }`;

const replace = `await handleDownloadInvoice(res, sendWhatsapp);
      
      let msg = "Bill generated successfully!";
      
      if (sendWhatsapp && (!navigator.share || !navigator.canShare)) {
         // Fallback to whatsapp web if share is not supported
         const message = \\\`*New Bill Generated!*\\n\\n*Name:* \${customerInfo.name}\\n*Amount:* ₹\${total.toFixed(2)}\\n\\n*Items:*\\n\${cart.map((item: any) => \`- \${item.name} x\${item.quantity}\`).join('\\n')}\\n\\n*Bill ID:* \${res.invoiceNumber || res.billNumber || 'Pending'}\\n\\n_Thank you for shopping with Shree Hari. Please find the attached PDF._\\\`;
         const whatsappUrl = \\\`https://wa.me/91\${customerInfo.mobile}?text=\${encodeURIComponent(message)}\\\`;
         window.open(whatsappUrl, '_blank');
         msg += " PDF Downloaded & WhatsApp opened.";
      }`;

code = code.replace(search, replace);
fs.writeFileSync('src/pages/admin/POS.tsx', code);
