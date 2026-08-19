import fs from 'fs';
let code = fs.readFileSync('src/pages/customer/Checkout.tsx', 'utf-8');

const invoiceFunction = `
  const handleDownloadInvoice = (order: any) => {
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(\`
      <html>
        <head>
          <title>\${order.customerName.trim().replace(/[^a-zA-Z0-9]/g, '_')}.pdf</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
            .header { border-bottom: 2px solid #f59e0b; padding-bottom: 20px; margin-bottom: 30px; }
            .header h1 { margin: 0; color: #f59e0b; text-transform: uppercase; }
            .header p { margin: 5px 0; color: #666; }
            .details { display: flex; justify-content: space-between; margin-bottom: 40px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th, td { padding: 12px; border-bottom: 1px solid #ddd; text-align: left; }
            th { background-color: #f9fafb; color: #111; font-weight: bold; text-transform: uppercase; font-size: 12px; }
            .total { text-align: right; font-size: 18px; font-weight: bold; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header" style="display: flex; align-items: center; gap: 20px;">
            <img src="\${window.location.origin}/logo.png" alt="Shree Hari Logo" style="height: 60px; width: auto; object-fit: contain;" />
            <div>
              <h1>Shree Hari</h1>
              <p>Premium Pooja Samagri</p>
            </div>
          </div>
          <div class="details">
            <div>
              <h3>Billed To:</h3>
              <p><strong>\${order.customerName}</strong></p>
              <p>\${order.mobile}</p>
              <p>\${order.address}</p>
            </div>
            <div style="text-align: right;">
              <h3>Invoice: \${order.invoiceNumber}</h3>
              <p>Date: \${format(new Date(order.date), 'MMM dd, yyyy')}</p>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              \${order.items.map((item: any) => \`
                <tr>
                  <td>\${item.name}</td>
                  <td>\${item.quantity}</td>
                  <td>₹\${item.sellingPrice.toFixed(2)}</td>
                  <td>₹\${(item.sellingPrice * item.quantity).toFixed(2)}</td>
                </tr>
              \`).join('')}
            </tbody>
          </table>
          <div class="total">
            Total Amount: ₹\${order.totalAmount.toFixed(2)}
          </div>
          <script>
            setTimeout(() => {
              window.print();
            }, 500);
          </script>
        </body>
      </html>
    \`);
    win.document.close();
  };
`;

code = code.replace(
  "const handlePlaceOrder = async (e: React.FormEvent) => {",
  invoiceFunction + "\n  const handlePlaceOrder = async (e: React.FormEvent) => {"
);

code = code.replace(
  "const whatsappNumber = \"917058117155\";\n      const pdfFileName = `${customerName.trim().replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;\n      \n      // Simulated backend API call to generate and send PDF invoice to WhatsApp\n      // fetch('/api/whatsapp/send-invoice', { \n      //   method: 'POST', \n      //   body: JSON.stringify({ \n      //     to: \"917058117155\", \n      //     customerMobile: mobileNumber,\n      //     message: message, \n      //     pdfFileName: pdfFileName, \n      //     invoiceData: order \n      //   }) \n      // });",
  ""
);

code = code.replace(
  "const message = `*New Order Placed!*\\n\\n*Name:* ${customerName}\\n*Mobile:* ${mobileNumber}\\n*Address:* ${address}\\n*Payment:* ${paymentMethod}\\n*Amount:* ₹${total.toFixed(2)}\\n\\n*Items:*\\n${cart.map((item: any) => `- ${item.name} x${item.quantity}`).join('\\n')}\\n\\n*Order ID:* ${res.invoiceNumber || 'Pending'}`;",
  "const message = `*New Order Placed!*\\n\\n*Name:* ${customerName}\\n*Mobile:* ${mobileNumber}\\n*Address:* ${address}\\n*Payment:* ${paymentMethod}\\n*Amount:* ₹${total.toFixed(2)}\\n\\n*Items:*\\n${cart.map((item: any) => `- ${item.name} x${item.quantity}`).join('\\n')}\\n\\n*Order ID:* ${res.invoiceNumber || 'Pending'}`;\n      const pdfFileName = `${customerName.trim().replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;\n      // Simulated backend API call to generate and send PDF invoice to WhatsApp\n      // fetch('/api/whatsapp/send-invoice', { \n      //   method: 'POST', \n      //   body: JSON.stringify({ \n      //     to: \"917058117155\", \n      //     customerMobile: mobileNumber,\n      //     message: message, \n      //     pdfFileName: pdfFileName, \n      //     invoiceData: order \n      //   }) \n      // });"
);

code = code.replace(
  "if (cart.length === 0) {\n    return <Navigate to=\"/cart\" />;\n  }",
  `if (cart.length === 0 && !placedOrder) {
    return <Navigate to="/cart" />;
  }

  if (placedOrder) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">Order Placed Successfully!</h1>
        <p className="text-slate-600 mb-2">Thank you for your purchase. Your order <span className="font-bold text-slate-900">{placedOrder.invoiceNumber}</span> is confirmed.</p>
        <p className="text-sm text-slate-500 mb-10">An invoice has been generated and sent to WhatsApp number 7058117155.</p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button onClick={() => handleDownloadInvoice(placedOrder)} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900 text-white px-8 py-3.5 rounded-lg font-bold uppercase tracking-wider text-sm hover:bg-slate-800 transition-colors">
            <FileText className="w-5 h-5" /> Download Invoice
          </button>
          <button onClick={() => navigate('/my-orders')} className="w-full sm:w-auto bg-amber-500 text-white px-8 py-3.5 rounded-lg font-bold uppercase tracking-wider text-sm hover:bg-amber-600 transition-colors">
            View My Orders
          </button>
        </div>
      </div>
    );
  }`
);

fs.writeFileSync('src/pages/customer/Checkout.tsx', code);
