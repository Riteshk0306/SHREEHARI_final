import fs from 'fs';

let content = fs.readFileSync('src/pages/admin/Dashboard.tsx', 'utf-8');

// Add imports
content = content.replace(
  "import { ShoppingBag, DollarSign, Package, Users, AlertTriangle } from 'lucide-react';",
  "import { ShoppingBag, DollarSign, Package, Users, AlertTriangle, X, Download } from 'lucide-react';\nimport jsPDF from 'jspdf';\nimport autoTable from 'jspdf-autotable';\nimport { getLogoBase64 } from '../../utils/pdfHelper';"
);

// Add states and functions inside Dashboard
const statesAndFunctions = `
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [stockModalType, setStockModalType] = useState<'low' | 'out' | null>(null);
  const [stockProducts, setStockProducts] = useState<any[]>([]);

  const handleOpenStockModal = async (type: 'low' | 'out') => {
    setStockModalType(type);
    try {
      const data = await api.get('/api/products');
      if (type === 'low') {
        setStockProducts(data.filter((p: any) => p.stock > 0 && p.stock < 10));
      } else {
        setStockProducts(data.filter((p: any) => p.stock === 0));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownloadStockPDF = async () => {
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
    const title = stockModalType === 'low' ? 'LOW STOCK REPORT' : 'OUT OF STOCK REPORT';
    doc.text(title, 14, 40);
    
    const rows = stockProducts.map((p, i) => [
      i + 1,
      p.name,
      p.category,
      p.brand,
      p.stock.toString(),
      \`Rs \${p.sellingPrice}\`
    ]);

    autoTable(doc, {
      startY: 45,
      head: [["#", "Product", "Category", "Brand", "Stock", "Price"]],
      body: rows,
      theme: 'striped',
      headStyles: { fillColor: [245, 158, 11] }
    });

    doc.save(\`\${stockModalType}_stock_report_\${Date.now()}.pdf\`);
  };
`;

content = content.replace(
  "const [stats, setStats] = useState<DashboardStats | null>(null);",
  statesAndFunctions
);

// Update StatCard definition
content = content.replace(
  "const StatCard = ({ title, value, color, alert, subtitle, subtitleColor }: { title: string, value: string | number, color?: string, alert?: boolean, subtitle?: string, subtitleColor?: string }) => (",
  "const StatCard = ({ title, value, color, alert, subtitle, subtitleColor, onClick }: { title: string, value: string | number, color?: string, alert?: boolean, subtitle?: string, subtitleColor?: string, onClick?: () => void }) => ("
);

content = content.replace(
  "<div className={`bg-white p-5 rounded-xl border shadow-sm ${alert ? 'border-red-200 bg-red-50 shadow-red-100' : 'border-slate-200'}`}>",
  "<div onClick={onClick} className={`bg-white p-5 rounded-xl border shadow-sm ${alert ? 'border-red-200 bg-red-50 shadow-red-100' : 'border-slate-200'} ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}>"
);

// Update Alert Banner onClick
content = content.replace(
  '<div className="bg-red-50 border border-red-200 p-4 rounded-xl flex items-start gap-3 shadow-sm shadow-red-100">',
  '<div onClick={() => handleOpenStockModal(\'low\')} className="bg-red-50 border border-red-200 p-4 rounded-xl flex items-start gap-3 shadow-sm shadow-red-100 cursor-pointer hover:shadow-md transition-shadow">'
);
content = content.replace(
  "{stats.lowStockProducts} products are running low on stock. Please check inventory.",
  "{stats.lowStockProducts} products are running low on stock. Click here to view and download the list."
);

// Add onClick to StatCards
content = content.replace(
  '<StatCard title="Low Stock" value={stats.lowStockProducts} alert={stats.lowStockProducts > 0} subtitle={stats.lowStockProducts > 0 ? "Action Required" : "Stock healthy"} subtitleColor={stats.lowStockProducts > 0 ? "text-red-600 underline" : "text-slate-500"} />',
  '<StatCard title="Low Stock" value={stats.lowStockProducts} alert={stats.lowStockProducts > 0} subtitle={stats.lowStockProducts > 0 ? "Action Required" : "Stock healthy"} subtitleColor={stats.lowStockProducts > 0 ? "text-red-600 underline" : "text-slate-500"} onClick={() => handleOpenStockModal("low")} />'
);

content = content.replace(
  '<StatCard title="Out of Stock" value={stats.outOfStockProducts} alert={stats.outOfStockProducts > 0} subtitle={stats.outOfStockProducts > 0 ? "Immediate Action Required" : "None out of stock"} subtitleColor={stats.outOfStockProducts > 0 ? "text-red-600 underline" : "text-slate-500"} />',
  '<StatCard title="Out of Stock" value={stats.outOfStockProducts} alert={stats.outOfStockProducts > 0} subtitle={stats.outOfStockProducts > 0 ? "Immediate Action Required" : "None out of stock"} subtitleColor={stats.outOfStockProducts > 0 ? "text-red-600 underline" : "text-slate-500"} onClick={() => handleOpenStockModal("out")} />'
);

const modalCode = `
      {stockModalType && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 rounded-t-xl">
              <h2 className="text-lg font-bold text-slate-900 uppercase tracking-tight">
                {stockModalType === 'low' ? 'Low Stock Products' : 'Out of Stock Products'}
              </h2>
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleDownloadStockPDF}
                  disabled={stockProducts.length === 0}
                  className="flex items-center gap-2 bg-amber-500 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-amber-600 transition-colors disabled:opacity-50"
                >
                  <Download className="w-4 h-4" /> Download PDF
                </button>
                <button onClick={() => setStockModalType(null)} className="text-slate-400 hover:text-red-500 transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="p-4 overflow-auto flex-1">
              {stockProducts.length === 0 ? (
                <div className="text-center py-12 text-slate-500 font-medium">No products found.</div>
              ) : (
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="p-3 font-bold text-slate-900">Image</th>
                      <th className="p-3 font-bold text-slate-900">Name</th>
                      <th className="p-3 font-bold text-slate-900">Category</th>
                      <th className="p-3 font-bold text-slate-900">Brand</th>
                      <th className="p-3 font-bold text-slate-900 text-center">Stock</th>
                      <th className="p-3 font-bold text-slate-900">Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {stockProducts.map(p => (
                      <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3">
                          <img src={p.images?.[0] || 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400&q=80'} alt={p.name} className="w-10 h-10 rounded-lg object-cover bg-slate-100" referrerPolicy="no-referrer" />
                        </td>
                        <td className="p-3 font-medium text-slate-900 max-w-[200px] truncate" title={p.name}>{p.name}</td>
                        <td className="p-3 text-slate-600">{p.category}</td>
                        <td className="p-3 text-slate-600">{p.brand}</td>
                        <td className="p-3 text-center">
                          <span className={\`font-bold \${p.stock === 0 ? 'text-red-600' : 'text-amber-600'}\`}>{p.stock}</span>
                        </td>
                        <td className="p-3 font-bold text-slate-900">₹{p.sellingPrice}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
`;

content = content.replace(
  "    </div>\n  );\n}",
  modalCode
);

fs.writeFileSync('src/pages/admin/Dashboard.tsx', content);
