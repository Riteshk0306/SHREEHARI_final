import React, { useEffect, useState } from 'react';
import { useStore } from '../../store';
import { Navigate, Link } from 'react-router-dom';
import { api } from '../../api';
import { format } from 'date-fns';
import { FileText, Package, Mail, MapPin, Phone, Eye, Download } from 'lucide-react';
import { Order } from '../../types';
import { downloadInvoicePdf, viewInvoicePdf } from '../../utils/pdfGenerator';

export default function MyOrders() {
  const { user } = useStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  if (!user) {
    return <Navigate to="/login" />;
  }

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    try {
      const data = await api.get('/api/orders');
      const myOrders = (data || []).filter((o: Order) => o.customerId === user.id);
      myOrders.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setOrders(myOrders);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div></div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-slate-900 mb-8 uppercase tracking-tight">My Account</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 sticky top-24">
            <h2 className="font-bold text-lg text-slate-900 mb-4">{user.name}</h2>
            <div className="space-y-3 text-sm text-slate-600 mb-6">
              <p className="flex items-center gap-2"><Mail className="w-4 h-4"/> {user.email}</p>
              {user.mobile && <p className="flex items-center gap-2"><Phone className="w-4 h-4"/> {user.mobile}</p>}
            </div>
            <div className="border-t border-slate-200 pt-4">
              <div className="font-medium text-amber-600 cursor-pointer flex items-center gap-2">
                <Package className="w-4 h-4"/> My Orders
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Order History</h2>
          
          {orders.length === 0 ? (
            <div className="bg-white p-12 rounded-xl border border-slate-200 text-center shadow-sm">
              <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-900 mb-2">No orders yet</h3>
              <p className="text-slate-500 mb-6">Looks like you haven't placed any orders.</p>
              <Link to="/products" className="bg-amber-500 text-white px-6 py-3 rounded-lg font-bold uppercase tracking-wider text-sm hover:bg-amber-600 transition-colors">Start Shopping</Link>
            </div>
          ) : (
            orders.map(order => (
              <div key={order.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row gap-6">
                <div className="flex-1 space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Order {order.invoiceNumber}</h3>
                      <p className="text-sm text-slate-500">{format(new Date(order.date), 'MMM dd, yyyy - hh:mm a')}</p>
                    </div>
                    <div className="text-left sm:text-right">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2
                        ${order.orderStatus === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 
                          order.orderStatus === 'Cancelled' ? 'bg-red-100 text-red-700' : 
                          'bg-amber-100 text-amber-700'}
                      `}>
                        {order.orderStatus}
                      </span>
                      <div className="text-xl font-bold text-slate-900 block">₹{Number(order.totalAmount || 0).toFixed(2)}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2 text-sm text-slate-600 font-medium bg-slate-50 p-4 rounded-lg">
                    <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-amber-500" />
                    <p>{order.address}</p>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Items Purchased</h4>
                    <div className="space-y-2">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm items-center">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-100 rounded flex items-center justify-center">
                               {item.image ? <img src={item.image} alt={item.name} className="w-8 h-8 object-cover rounded-sm" /> : <Package className="w-5 h-5 text-slate-400" />}
                            </div>
                            <span className="text-slate-800 font-medium">{item.name} <span className="text-slate-500">x{item.quantity}</span></span>
                          </div>
                          <span className="font-bold text-slate-900">₹{(Number(item.sellingPrice || 0) * Number(item.quantity || 0)).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="md:w-48 flex flex-col gap-3 md:border-l border-slate-200 md:pl-6 justify-end">
                  <div className="flex gap-2 w-full">
                    <button 
                      onClick={() => viewInvoicePdf(order)}
                      className="flex-1 flex items-center justify-center bg-slate-100 text-slate-700 py-3 rounded-lg hover:bg-slate-200 transition-colors shadow-sm text-xs font-bold gap-1"
                      title="View Invoice PDF"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                    <button 
                      onClick={() => downloadInvoicePdf(order)}
                      className="flex-1 flex items-center justify-center bg-slate-900 text-white py-3 rounded-lg hover:bg-slate-800 transition-colors shadow-sm text-xs font-bold gap-1"
                      title="Download Invoice PDF"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
