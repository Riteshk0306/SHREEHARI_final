import fs from 'fs';
let code = fs.readFileSync('src/pages/customer/Checkout.tsx', 'utf-8');

const searchStr = `const message = \`*New Order Placed!*\\n\\n*Name:* \${customerName}\\n*Mobile:* \${mobileNumber}\\n*Address:* \${address}\\n*Payment:* \${paymentMethod}\\n*Amount:* ₹\${total.toFixed(2)}\\n\\n*Items:*\\n\${cart.map((item: any) => \`- \${item.name} x\${item.quantity}\`).join('\\n')}\\n\\n*Order ID:* \${res.invoiceNumber || 'Pending'}\`;
      const pdfFileName = \`\${customerName.trim().replace(/[^a-zA-Z0-9]/g, '_')}.pdf\`;
      // Simulated backend API call to generate and send PDF invoice to WhatsApp
      // fetch('/api/whatsapp/send-invoice', { 
      //   method: 'POST', 
      //   body: JSON.stringify({ 
      //     to: "917058117155", 
      //     customerMobile: mobileNumber,
      //     message: message, 
      //     pdfFileName: pdfFileName, 
      //     invoiceData: order 
      //   }) 
      // });`;

const replacementStr = `const message = \`*New Order Placed!*\\n\\n*Name:* \${customerName}\\n*Mobile:* \${mobileNumber}\\n*Address:* \${address}\\n*Payment:* \${paymentMethod}\\n*Amount:* ₹\${total.toFixed(2)}\\n\\n*Items:*\\n\${cart.map((item: any) => \`- \${item.name} x\${item.quantity}\`).join('\\n')}\\n\\n*Order ID:* \${res.invoiceNumber || 'Pending'}\\n\\n_Please find the attached invoice PDF._\`;
      
      // Auto-generate and download PDF invoice
      handleDownloadInvoice(res);

      // Open WhatsApp web with message
      const whatsappUrl = \`https://wa.me/917058117155?text=\${encodeURIComponent(message)}\`;
      window.open(whatsappUrl, '_blank');`;

code = code.replace(searchStr, replacementStr);
fs.writeFileSync('src/pages/customer/Checkout.tsx', code);
