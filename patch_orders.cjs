const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/Orders.tsx', 'utf-8');

// Add Trash icon import
code = code.replace(
  "Search, Eye, Download",
  "Search, Eye, Download, Trash2"
);
code = code.replace(
  "import { Search, Eye, Download } from 'lucide-react';",
  "import { Search, Eye, Download, Trash2 } from 'lucide-react';"
);
// just in case it's on a different line:
if (!code.includes('Trash2')) {
   code = code.replace("from 'lucide-react';", ", Trash2 } from 'lucide-react';");
}

const handleDeleteOrder = `
  const handleDeleteOrder = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this order?')) return;
    try {
      await api.delete('/api/orders/' + id);
      fetchOrders();
    } catch (err) {
      console.error(err);
      alert('Failed to delete order');
    }
  };
`;
code = code.replace(
  "const handleStatusChange = async (id: string, status: string) => {",
  handleDeleteOrder + "\n  const handleStatusChange = async (id: string, status: string) => {"
);

const actionButtons = `
              <div className="mt-auto flex gap-2">
                {order.orderStatus === 'Completed' && (
                  <button onClick={() => handleDeleteOrder(order.id)} className="flex items-center justify-center bg-red-50 text-red-600 px-3 py-2.5 rounded-lg hover:bg-red-100 transition-colors border border-red-200" title="Delete Order">
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
                <button onClick={() => handleDownloadInvoice(order, 'view')} className="flex-1 flex items-center justify-center gap-2 bg-slate-100 text-slate-700 py-2.5 rounded-lg hover:bg-slate-200 transition-colors border border-slate-200" title="View Invoice">
                  <Eye className="w-5 h-5" />
                </button>
                <button onClick={() => handleDownloadInvoice(order, 'download')} className="flex-1 flex items-center justify-center gap-2 bg-slate-100 text-slate-700 py-2.5 rounded-lg hover:bg-slate-200 transition-colors border border-slate-200" title="Download Invoice">
                  <Download className="w-5 h-5" />
                </button>
              </div>
`;
code = code.replace(
  /<div className="mt-auto flex gap-2">[\s\S]*?<\/div>/,
  actionButtons
);

fs.writeFileSync('src/pages/admin/Orders.tsx', code);
