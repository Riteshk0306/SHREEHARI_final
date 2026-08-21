import { useEffect, useState } from 'react';
import { api } from '../../api';
import { Order } from '../../types';
import { Search, MapPin, Eye, Download, Trash2, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';
import { downloadInvoicePdf, viewInvoicePdf, sendInvoiceViaWhatsApp } from '../../utils/pdfGenerator';

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

  const handleWhatsAppShare = async (order: Order) => {
    try {
      await sendInvoiceViaWhatsApp(order, undefined, order.invoiceUrl);
    } catch (err) {
      console.error('Failed to share invoice via WhatsApp:', err);
      alert('Could not open WhatsApp for invoice sharing.');
    }
  };

  const filtered = orders.filter(o => 
    (o.invoiceNumber || '').toLowerCase().includes(search.toLowerCase()) || 
    (o.customerName || '').toLowerCase().includes(search.toLowerCase()) ||
    (o.mobile || '').includes(search)
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
                  <p className="text-sm text-slate-600">Mobile: {order.mobile}</p>
                  {order.email && <p className="text-sm text-slate-600">Email: {order.email}</p>}
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
                <div className="text-sm font-bold text-slate-900 px-3 py-2 bg-slate-50 rounded-lg border border-slate-200">
                  {order.paymentMethod} ({order.paymentStatus})
                </div>
              </div>
              
              <div className="mt-auto space-y-2 pt-2">
                <button 
                  onClick={() => handleWhatsAppShare(order)}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition-colors font-bold text-xs"
                  title="Send Invoice to WhatsApp"
                >
                  <MessageCircle className="w-4 h-4" />
                  Send WhatsApp Invoice
                </button>

                <div className="flex gap-2">
                  {order.orderStatus === 'Completed' && (
                    <button 
                      onClick={() => handleDeleteOrder(order.id)} 
                      className="flex items-center justify-center bg-red-50 text-red-600 px-3 py-2 rounded-lg hover:bg-red-100 transition-colors border border-red-200" 
                      title="Delete Order"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <button 
                    onClick={() => viewInvoicePdf(order)} 
                    className="flex-1 flex items-center justify-center gap-1.5 bg-slate-100 text-slate-700 py-2 rounded-lg hover:bg-slate-200 transition-colors border border-slate-200 text-xs font-medium" 
                    title="View Invoice PDF"
                  >
                    <Eye className="w-4 h-4" />
                    View PDF
                  </button>
                  <button 
                    onClick={() => downloadInvoicePdf(order)} 
                    className="flex-1 flex items-center justify-center gap-1.5 bg-slate-900 text-white py-2 rounded-lg hover:bg-slate-800 transition-colors border border-slate-900 text-xs font-medium" 
                    title="Download Invoice PDF"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </div>
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
