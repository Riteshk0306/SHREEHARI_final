import fs from 'fs';

let code = fs.readFileSync('src/pages/admin/Products.tsx', 'utf-8');

// 1. Update imports
if (!code.includes("jspdf")) {
  code = code.replace(
    `import { Plus, Edit2, Trash2, Copy, Search, AlertCircle, X } from 'lucide-react';`,
    `import { Plus, Edit2, Trash2, Copy, Search, AlertCircle, X, Printer } from 'lucide-react';\nimport jsPDF from 'jspdf';\nimport autoTable from 'jspdf-autotable';\nimport { getLogoBase64 } from '../../utils/pdfHelper';`
  );
}

// 2. Add handleDownloadStockList
const injectionPoint = `  const fetchProducts = () => api.get('/api/products').then(setProducts);`;
const functionCode = `  const handleDownloadStockList = async () => {
    const doc = new jsPDF();
    
    try {
      const logoData = await getLogoBase64();
      doc.addImage(logoData, 'PNG', 14, 10, 16, 16);
    } catch (err) {
      console.warn('Failed to load logo', err);
    }
    
    doc.setFontSize(22);
    doc.setTextColor(245, 158, 11);
    doc.text("SHREE HARI", 35, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("Premium Pooja Samagri", 35, 26);
    
    doc.setFontSize(14);
    doc.setTextColor(15);
    doc.text("INVENTORY STOCK LIST", 14, 40);
    
    const dateStr = new Date().toLocaleString('en-IN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true
    });
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(\`Generated on: \${dateStr}\`, 14, 46);

    const tableData = products.map((p, index) => [
      index + 1,
      p.name,
      p.category,
      \`Rs \${p.purchasePrice.toFixed(2)}\`,
      \`Rs \${p.sellingPrice.toFixed(2)}\`,
      p.stock.toString(),
      p.stock > 0 ? (p.stock < 10 ? 'Low Stock' : 'In Stock') : 'Out of Stock'
    ]);

    autoTable(doc, {
      startY: 52,
      head: [['#', 'Product Name', 'Category', 'Purchase', 'Selling', 'Qty', 'Status']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [245, 158, 11] },
      styles: { fontSize: 9 },
      didParseCell: function(data) {
        if (data.section === 'body' && data.column.index === 6) {
           const status = data.cell.raw;
           if (status === 'Out of Stock') {
              data.cell.styles.textColor = [239, 68, 68];
              data.cell.styles.fontStyle = 'bold';
           } else if (status === 'Low Stock') {
              data.cell.styles.textColor = [245, 158, 11];
              data.cell.styles.fontStyle = 'bold';
           } else {
              data.cell.styles.textColor = [34, 197, 94];
           }
        }
      }
    });

    doc.save(\`Stock_List_\${Date.now()}.pdf\`);
  };

  const fetchProducts`;

code = code.replace(injectionPoint, functionCode);

// 3. Add button
const searchButton = `<button onClick={openAddModal} className="bg-slate-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-slate-800 transition flex items-center gap-2 whitespace-nowrap text-sm tracking-wide">`;
const replaceButton = `<button onClick={handleDownloadStockList} className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg font-medium hover:bg-slate-50 transition flex items-center gap-2 whitespace-nowrap text-sm tracking-wide shadow-sm">
            <Printer className="w-4 h-4" /> Print Stock List
          </button>
          <button onClick={openAddModal} className="bg-slate-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-slate-800 transition flex items-center gap-2 whitespace-nowrap text-sm tracking-wide shadow-sm">`;

code = code.replace(searchButton, replaceButton);

fs.writeFileSync('src/pages/admin/Products.tsx', code);
