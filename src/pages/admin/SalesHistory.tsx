import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { Download, Calendar } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getLogoBase64 } from '../../utils/pdfHelper';
import { format, subDays, startOfMonth, subMonths, isWithinInterval, startOfDay, endOfDay, parseISO } from 'date-fns';

export default function SalesHistory() {
  const [orders, setOrders] = useState<any[]>([]);
  const [filter, setFilter] = useState('today');
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await api.get('/api/orders');
      // Only include completed orders
      const completedOrders = data.filter((o: any) => o.orderStatus !== 'Cancelled');
      const sortedOrders = completedOrders.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setOrders(sortedOrders);
    } catch (err) {
      console.error(err);
    }
  };

  const getFilteredOrders = () => {
    const today = new Date();
    let start: Date, end: Date;

    switch (filter) {
      case 'today':
        start = startOfDay(today);
        end = endOfDay(today);
        break;
      case 'yesterday':
        start = startOfDay(subDays(today, 1));
        end = endOfDay(subDays(today, 1));
        break;
      case '7days':
        start = startOfDay(subDays(today, 6));
        end = endOfDay(today);
        break;
      case 'lastMonth':
        start = startOfMonth(subMonths(today, 1));
        end = endOfDay(subDays(startOfMonth(today), 1));
        break;
      case 'custom':
        start = startOfDay(parseISO(startDate));
        end = endOfDay(parseISO(endDate));
        break;
      default:
        start = startOfDay(today);
        end = endOfDay(today);
    }

    return orders.filter(order => {
      const orderDate = parseISO(order.date);
      return isWithinInterval(orderDate, { start, end });
    });
  };

  const filteredOrders = getFilteredOrders();
  const totalSales = filteredOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const totalProfit = filteredOrders.reduce((sum, o) => sum + (o.profit || 0), 0);

  const getProductSales = () => {
    const productMap: Record<string, { name: string; quantity: number; revenue: number }> = {};
    filteredOrders.forEach(order => {
      if (order.items) {
        order.items.forEach((item: any) => {
          if (!productMap[item.productId]) {
            productMap[item.productId] = { name: item.name, quantity: 0, revenue: 0 };
          }
          productMap[item.productId].quantity += item.quantity;
          productMap[item.productId].revenue += (item.price || item.sellingPrice || 0) * item.quantity;
        });
      }
    });
    return Object.values(productMap).sort((a, b) => b.revenue - a.revenue);
  };

  const handleDownloadPDF = async () => {
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
    doc.text("SALES STATEMENT", 14, 40);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Filter: ${filter.toUpperCase()}`, 14, 46);
    if (filter === 'custom') {
      doc.text(`Range: ${startDate} to ${endDate}`, 14, 52);
    }

    // Summary
    doc.setFillColor(245, 247, 250);
    doc.rect(14, 58, 182, 20, 'F');
    doc.setFontSize(12);
    doc.setTextColor(15);
    doc.text(`Total Sales: Rs ${Number(totalSales || 0).toFixed(2)}`, 20, 68);
    doc.text(`Total Profit: Rs ${Number(totalProfit || 0).toFixed(2)}`, 100, 68);

    let startY = 85;

    // Product Sales Table
    const productSales = getProductSales();
    if (productSales.length > 0) {
      doc.setFontSize(12);
      doc.text("Product Sales Summary", 14, startY);
      
      const productRows = productSales.map((p, i) => [
        i + 1,
        p.name,
        p.quantity.toString(),
        `Rs ${Number(p.revenue || 0).toFixed(2)}`
      ]);

      autoTable(doc, {
        startY: startY + 5,
        head: [["#", "Product", "Qty Sold", "Revenue"]],
        body: productRows,
        theme: 'striped',
        headStyles: { fillColor: [245, 158, 11] }
      });
      startY = (doc as any).lastAutoTable.finalY + 15;
    }

    // Orders Table
    doc.setFontSize(12);
    doc.text("Order Details", 14, startY);
    
    const orderRows = filteredOrders.map((o, i) => [
      i + 1,
      o.invoiceNumber || 'N/A',
      format(parseISO(o.date), 'dd MMM yyyy, p'),
      o.customerName || 'Walk-in',
      `Rs ${Number(o.totalAmount || 0).toFixed(2)}`,
      `Rs ${Number(o.profit || 0).toFixed(2)}`
    ]);

    autoTable(doc, {
      startY: startY + 5,
      head: [["#", "Invoice", "Date", "Customer", "Amount", "Profit"]],
      body: orderRows,
      theme: 'striped',
      headStyles: { fillColor: [245, 158, 11] }
    });

    doc.save(`Sales_Statement_${Date.now()}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight uppercase">Sales History</h1>
        <button 
          onClick={handleDownloadPDF} 
          disabled={filteredOrders.length === 0}
          className="bg-amber-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-amber-600 transition flex items-center gap-2 whitespace-nowrap text-sm tracking-wide shadow-sm disabled:opacity-50"
        >
          <Download className="w-4 h-4" /> Download Statement
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 items-end">
        <div className="w-full md:w-auto">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Date Range</label>
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="w-full md:w-48 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 font-medium text-slate-900"
          >
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="7days">Last 7 Days</option>
            <option value="lastMonth">Last Month</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>

        {filter === 'custom' && (
          <>
            <div className="w-full md:w-auto">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Start Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 font-medium text-slate-900"
                />
              </div>
            </div>
            <div className="w-full md:w-auto">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">End Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 font-medium text-slate-900"
                />
              </div>
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider mb-1 text-slate-500">Total Sales (Selected Range)</p>
          <p className="text-2xl font-bold text-slate-900">₹{Number(totalSales || 0).toFixed(2)}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider mb-1 text-slate-500">Total Profit (Selected Range)</p>
          <p className="text-2xl font-bold text-emerald-600">₹{Number(totalProfit || 0).toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-4 font-bold text-slate-900">Date</th>
                <th className="p-4 font-bold text-slate-900">Invoice</th>
                <th className="p-4 font-bold text-slate-900">Source</th>
                <th className="p-4 font-bold text-slate-900">Customer</th>
                <th className="p-4 font-bold text-slate-900">Amount</th>
                <th className="p-4 font-bold text-slate-900">Profit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 font-medium">
                    No sales found for the selected date range.
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 text-slate-600">{format(parseISO(order.date), 'MMM dd, yyyy, p')}</td>
                    <td className="p-4 font-medium text-slate-900">{order.invoiceNumber || '-'}</td>
                    <td className="p-4 font-medium">
                      {order.address === 'In-Store' ? (
                        <span className="text-amber-600 bg-amber-50 px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wide border border-amber-200">Admin POS</span>
                      ) : (
                        <span className="text-blue-600 bg-blue-50 px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wide border border-blue-200">Customer Online</span>
                      )}
                    </td>
                    <td className="p-4 text-slate-600">{order.customerName || "Walk-in"}</td>
                    <td className="p-4 font-bold text-slate-900">₹{Number(order.totalAmount || 0).toFixed(2)}</td>
                    <td className="p-4 font-medium text-emerald-600">₹{Number(order.profit || 0).toFixed(2)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
