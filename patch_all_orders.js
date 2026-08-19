import fs from 'fs';

const pdfLogic = `const handleDownloadInvoice = (order: Order) => {
    try {
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(22);
      doc.setTextColor(245, 158, 11);
      doc.text("SHREE HARI", 14, 20);
      
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text("Premium Pooja Samagri", 14, 26);
      
      // Details
      doc.setFontSize(12);
      doc.setTextColor(50);
      doc.text(\`Billed To: \${order.customerName}\`, 14, 40);
      doc.text(\`Mobile: \${order.mobile}\`, 14, 46);
      doc.text(\`Address: \${order.address || 'In-Store'}\`, 14, 52);
      
      doc.text(\`Invoice: \${order.invoiceNumber || 'PENDING'}\`, 140, 40);
      doc.text(\`Date: \${format(new Date(order.date), 'MMM dd, yyyy')}\`, 140, 46);
      
      // Table
      const tableColumn = ["Item", "Quantity", "Price", "Total"];
      const tableRows: any[] = [];
      
      order.items.forEach((item: any) => {
        tableRows.push([
          item.name,
          item.quantity,
          \`Rs \${item.sellingPrice.toFixed(2)}\`,
          \`Rs \${(item.sellingPrice * item.quantity).toFixed(2)}\`
        ]);
      });
      
      autoTable(doc, {
        startY: 60,
        head: [tableColumn],
        body: tableRows,
        theme: 'striped',
        headStyles: { fillColor: [245, 158, 11] }
      });
      
      // Total
      const finalY = (doc as any).lastAutoTable.finalY || 60;
      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text(\`Total Amount: Rs \${order.totalAmount.toFixed(2)}\`, 140, finalY + 15);
      
      const fileName = \`Invoice_\${order.invoiceNumber || Date.now()}.pdf\`;
      doc.save(fileName);
    } catch(err) {
      console.error(err);
      alert("Failed to generate PDF");
    }
  };`;

// Update Admin Orders
let adminOrders = fs.readFileSync('src/pages/admin/Orders.tsx', 'utf-8');
// add imports
if(!adminOrders.includes('jsPDF')) {
    adminOrders = adminOrders.replace(`import { format } from 'date-fns';`, `import { format } from 'date-fns';\nimport jsPDF from 'jspdf';\nimport autoTable from 'jspdf-autotable';`);
}
adminOrders = adminOrders.replace(/const handleDownloadInvoice = \(order: Order\) => \{[\s\S]*?win\.document\.close\(\);\s*\};/, pdfLogic);
fs.writeFileSync('src/pages/admin/Orders.tsx', adminOrders);

// Update Customer Orders
let customerOrders = fs.readFileSync('src/pages/customer/Orders.tsx', 'utf-8');
// add imports
if(!customerOrders.includes('jsPDF')) {
    customerOrders = customerOrders.replace(`import { format } from 'date-fns';`, `import { format } from 'date-fns';\nimport jsPDF from 'jspdf';\nimport autoTable from 'jspdf-autotable';`);
}
customerOrders = customerOrders.replace(/const handleDownloadInvoice = \(order: Order\) => \{[\s\S]*?win\.document\.close\(\);\s*\};/, pdfLogic);
fs.writeFileSync('src/pages/customer/Orders.tsx', customerOrders);

