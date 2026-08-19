import { useEffect, useState } from 'react';
import { api } from '../../api';
import { Order } from '../../types';
import { FileText, Search, MapPin, Eye, Download, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getLogoBase64 } from '../../utils/pdfHelper';

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState('');

  const fetchOrders = () => api.get('/api/orders').then(data => {
    const sorted = [...data].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setOrders(sorted);
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    await api.put(`/api/orders/${id}`, { orderStatus: newStatus });
    fetchOrders();
  };

  
    const handleDeleteOrder = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      try {
        await api.delete('/api/orders/' + id);
        fetchOrders();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleDownloadInvoice = async (order: Order, action: 'view' | 'download' = 'download') => {
    try {
      const doc = new jsPDF();
      
      try {
        const logoData = await getLogoBase64();
        doc.addImage(logoData, 'PNG', 14, 10, 16, 16);
      } catch (err) {
        console.warn('Failed to load logo', err);
      }
      
      try {
        const logoData = await getLogoBase64();
        doc.addImage(logoData, 'PNG', 14, 10, 16, 16);
      } catch (err) {
        console.warn('Failed to load logo', err);
      }
      
      // Header
      doc.setFontSize(22);
      doc.setTextColor(245, 158, 11);
      doc.text("SHREE HARI", 35, 20);
      
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text("Premium Pooja Samagri", 35, 26);
      
      // Details
      doc.setFontSize(12);
      doc.setTextColor(50);
      doc.text(`Billed To: ${order.customerName}`, 14, 40);
      doc.text(`Mobile: ${order.mobile}`, 14, 46);
      doc.text(`Address: ${order.address || 'In-Store'}`, 14, 52);
      
      doc.text(`Invoice: ${order.invoiceNumber || 'PENDING'}`, 140, 40);
      doc.text(`Date: ${format(new Date(order.date), 'MMM dd, yyyy')}`, 140, 46);
      
      // Table
      const tableColumn = ["#", "Item", "Quantity", "Price", "Total"];
      const tableRows: any[] = [];
      
      order.items.forEach((item: any, index: number) => {
        tableRows.push([
          index + 1,
          item.name,
          item.quantity,
          `Rs ${Number(item.sellingPrice || 0).toFixed(2)}`,
          `Rs ${(Number(item.sellingPrice || 0) * Number(item.quantity || 0)).toFixed(2)}`
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
      doc.text(`Total Amount: Rs ${Number(order.totalAmount || 0).toFixed(2)}`, 140, finalY + 15);
      
      const fileName = `Invoice_${order.invoiceNumber || Date.now()}.pdf`;
      if (action === 'view') {
        window.open(doc.output('bloburl'), '_blank');
      } else {
        doc.save(fileName);
      }
    } catch(err) {
      console.error(err);
      alert("Failed to generate PDF");
    }
  };

  const filtered = orders.filter(o => 
    o.invoiceNumber.toLowerCase().includes(search.toLowerCase()) || 
    o.customerName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight uppercase">Manage Orders</h1>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by invoice or customer..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 text-sm"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filtered.map(order => (
          <div key={order.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col lg:flex-row gap-6">
            <div className="flex-1 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900">{order.invoiceNumber}</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-slate-100 text-slate-600 border border-slate-200">
                      {order.source || 'Customer'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500">{format(new Date(order.date), 'MMM dd, yyyy - hh:mm a')}</p>
                </div>
                <div className="text-left sm:text-right">
                  <div className="text-xl font-bold text-slate-900">₹{Number(order.totalAmount || 0).toFixed(2)}</div>
                  <p className="text-sm font-medium text-emerald-600">Profit: ₹{Number(order.profit || 0).toFixed(2)}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg">
                <div>
                  <p className="text-sm font-bold text-slate-900">{order.customerName}</p>
                  <p className="text-sm text-slate-600">{order.mobile}</p>
                  <p className="text-sm text-slate-600">{order.email}</p>
                </div>
                <div className="flex items-start gap-2 text-sm text-slate-600 font-medium">
                  <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                  <p>{order.address}</p>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Items</h4>
                <div className="space-y-2">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-slate-600 font-medium">{item.quantity}x {item.name}</span>
                      <span className="font-bold text-slate-900">₹{(Number(item.sellingPrice || 0) * Number(item.quantity || 0)).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:w-64 flex flex-col gap-3 lg:border-l border-slate-200 lg:pl-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Order Status</label>
                <select 
                  value={order.orderStatus} 
                  onChange={(e) => handleStatusChange(order.id, e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-amber-500 font-medium text-slate-900"
                >
                  <option value="Pending">Pending</option>
                  <option value="Accepted">Accepted</option>
                  <option value="Packed">Packed</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Out for Delivery">Out for Delivery</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Payment Method</label>
                <div className="text-sm font-bold text-slate-900 px-3 py-2 bg-slate-50 rounded-lg border border-slate-200">{order.paymentMethod}</div>
              </div>
              
              
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

            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-500 font-medium">
            No orders found.
          </div>
        )}
      </div>
    </div>
  );
}
