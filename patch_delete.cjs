const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/Orders.tsx', 'utf-8');
const deleteFn = `  const handleDeleteOrder = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      try {
        await api.delete('/api/orders/' + id);
        fetchOrders();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleDownloadInvoice`;

code = code.replace("const handleDownloadInvoice", deleteFn);
fs.writeFileSync('src/pages/admin/Orders.tsx', code);
