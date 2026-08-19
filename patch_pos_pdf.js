import fs from 'fs';
let code = fs.readFileSync('src/pages/admin/POS.tsx', 'utf-8');

const importSearch = `import jsPDF from 'jspdf';`;
const importReplace = `import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';`;

code = code.replace(importSearch, importReplace);

const handleDownloadInvoiceSearch = /const handleDownloadInvoice = \(bill: any\) => \{[\s\S]*?\}\s*const subtotal =/m;

const handleDownloadInvoiceReplace = `const handleDownloadInvoice = async (bill: any, shouldShare: boolean = false) => {
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
      doc.text(\`Billed To: \${bill.customerName}\`, 14, 40);
      doc.text(\`Mobile: \${bill.mobile}\`, 14, 46);
      doc.text(\`Address: \${bill.address || 'In-Store'}\`, 14, 52);
      
      doc.text(\`Invoice: \${bill.invoiceNumber || bill.billNumber || 'PENDING'}\`, 140, 40);
      doc.text(\`Date: \${format(new Date(bill.date), 'MMM dd, yyyy')}\`, 140, 46);
      
      // Table
      const tableColumn = ["Item", "Quantity", "Price", "Total"];
      const tableRows: any[] = [];
      
      cart.forEach((item: any) => {
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
      let finalY = (doc as any).lastAutoTable.finalY || 60;
      
      const st = cart.reduce((sum, item) => sum + (item.sellingPrice * item.quantity), 0);
      doc.setFontSize(10);
      doc.setTextColor(50);
      doc.text(\`Subtotal: Rs \${st.toFixed(2)}\`, 140, finalY + 10);
      
      if (includeGst) {
        finalY += 10;
        doc.text(\`GST (18%): Rs \${(st * 0.18).toFixed(2)}\`, 140, finalY + 10);
      }
      
      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text(\`Total Amount: Rs \${bill.totalAmount.toFixed(2)}\`, 140, finalY + 25);
      
      const fileName = \`Invoice_\${bill.invoiceNumber || bill.billNumber || Date.now()}.pdf\`;
      
      if (shouldShare && navigator.share) {
        try {
          const pdfBlob = doc.output('blob');
          const file = new File([pdfBlob], fileName, { type: 'application/pdf' });
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: 'Invoice',
              text: 'Here is your invoice from Shree Hari.',
            });
            return; // Successfully shared
          }
        } catch (err) {
          console.error("Share failed", err);
        }
      }
      
      // Fallback to auto download
      doc.save(fileName);
    } catch (err) {
      console.error("Failed to generate PDF", err);
    }
  };

  const subtotal =`;

code = code.replace(handleDownloadInvoiceSearch, handleDownloadInvoiceReplace);
fs.writeFileSync('src/pages/admin/POS.tsx', code);
