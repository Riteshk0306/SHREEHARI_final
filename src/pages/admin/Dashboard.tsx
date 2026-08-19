import { useEffect, useState } from 'react';
import { api } from '../../api';
import { DashboardStats } from '../../types';
import { ShoppingBag, DollarSign, Package, Users, AlertTriangle, X, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getLogoBase64 } from '../../utils/pdfHelper';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const StatCard = ({ title, value, color, alert, subtitle, subtitleColor, onClick }: { title: string, value: string | number, color?: string, alert?: boolean, subtitle?: string, subtitleColor?: string, onClick?: () => void }) => (
  <div onClick={onClick} className={`bg-white p-5 rounded-xl border shadow-sm ${alert ? 'border-red-200 bg-red-50 shadow-red-100' : 'border-slate-200'} ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}>
    <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${alert ? 'text-red-600' : 'text-slate-500'}`}>{title}</p>
    <p className={`text-2xl font-bold ${alert ? 'text-red-700' : 'text-slate-900'}`}>{value}</p>
    {subtitle && <p className={`text-[10px] font-medium mt-1 ${subtitleColor || 'text-emerald-600'}`}>{subtitle}</p>}
  </div>
);

export default function Dashboard() {
  
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [stockModalType, setStockModalType] = useState<'low' | 'out' | null>(null);
  const [stockProducts, setStockProducts] = useState<any[]>([]);
  const [overdueCustomers, setOverdueCustomers] = useState<any[]>([]);
  const [allCustomers, setAllCustomers] = useState<any[]>([]);
  const [pendingModalOpen, setPendingModalOpen] = useState(false);
  const [chartData, setChartData] = useState<any[]>([]);

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
      `Rs ${p.sellingPrice}`
    ]);

    autoTable(doc, {
      startY: 45,
      head: [["#", "Product", "Category", "Brand", "Stock", "Price"]],
      body: rows,
      theme: 'striped',
      headStyles: { fillColor: [245, 158, 11] }
    });

    doc.save(`${stockModalType}_stock_report_${Date.now()}.pdf`);
  };


  useEffect(() => {
    
    
    
    api.get('/api/stats').then(setStats);
    api.get('/api/customers').then(customers => {
      setAllCustomers(customers);
      const now = new Date();
      const overdue = customers.filter((c: any) => {
        if (c.totalDue <= 0) return false;
        if (c.paymentReminderDate) {
          return new Date(c.paymentReminderDate) <= now;
        }
        if (c.lastPurchaseDate) {
          const diffTime = Math.abs(now.getTime() - new Date(c.lastPurchaseDate).getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays > 30;
        }
        return false;
      });
      setOverdueCustomers(overdue);
    });
    api.get('/api/orders').then(orders => {
      // Create last 7 days chart data
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        days.push({
          dateStr: d.toISOString().split('T')[0],
          name: d.toLocaleDateString('en-US', { weekday: 'short' }),
          revenue: 0,
          ordersCount: 0
        });
      }
      orders.forEach((o: any) => {
        if (o.orderStatus !== 'Cancelled' && o.date) {
          const dStr = o.date.split('T')[0];
          const day = days.find(d => d.dateStr === dStr);
          if (day) {
            day.revenue += (o.totalAmount || 0);
            day.ordersCount += 1;
          }
        }
      });
      setChartData(days);
    });



  }, []);

  
  const totalPending = allCustomers.reduce((sum, c) => sum + (c.totalDue || 0), 0);
  const pendingCustomers = allCustomers.filter(c => c.totalDue > 0);

  if (!stats) return <div className="p-8 text-neutral-500">Loading dashboard...</div>;



  

  return (
    <div className="space-y-6">
      
      
      {overdueCustomers.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3 shadow-sm shadow-amber-100">
          <AlertTriangle className="text-amber-500 w-5 h-5 shrink-0" />
          <div>
            <h3 className="text-amber-800 font-bold text-sm">Payment Collection Required</h3>
            <p className="text-amber-700 text-xs mt-1">{overdueCustomers.length} customers have overdue payments pending for more than a month or have reached their reminder date. Check the Customers Ledger.</p>
          </div>
        </div>
      )}

      {stats.lowStockProducts > 0 && (
        <div onClick={() => handleOpenStockModal('low')} className="bg-red-50 border border-red-200 p-4 rounded-xl flex items-start gap-3 shadow-sm shadow-red-100 cursor-pointer hover:shadow-md transition-shadow">
          <AlertTriangle className="text-red-500 w-5 h-5 shrink-0" />
          <div>
            <h3 className="text-red-800 font-bold text-sm">Stock Alert Action Required</h3>
            <p className="text-red-600 text-xs mt-1">{stats.lowStockProducts} products are running low on stock. Click here to view and download the list.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Revenue" value={`₹${stats.totalRevenue.toLocaleString()}`} subtitle="All time revenue" />
        <StatCard title="Pending Amount" value={`₹${totalPending.toLocaleString()}`} subtitle={`${pendingCustomers.length} customers`} subtitleColor="text-amber-600 underline cursor-pointer" onClick={() => setPendingModalOpen(true)} />
        <StatCard title="Today's Sales" value={`₹${stats.todaysSales.toLocaleString()}`} subtitle="Revenue for today" />
        <StatCard title="Total Orders" value={stats.totalOrders} subtitle="Completed & pending" subtitleColor="text-amber-600" />
        
        <StatCard title="Total Products" value={stats.totalProducts} />
        <StatCard title="Total Customers" value={stats.totalCustomers} />
        <StatCard title="Low Stock" value={stats.lowStockProducts} alert={stats.lowStockProducts > 0} subtitle={stats.lowStockProducts > 0 ? "Action Required" : "Stock healthy"} subtitleColor={stats.lowStockProducts > 0 ? "text-red-600 underline" : "text-slate-500"} onClick={() => handleOpenStockModal("low")} />
        <StatCard title="Out of Stock" value={stats.outOfStockProducts} alert={stats.outOfStockProducts > 0} subtitle={stats.outOfStockProducts > 0 ? "Immediate Action Required" : "None out of stock"} subtitleColor={stats.outOfStockProducts > 0 ? "text-red-600 underline" : "text-slate-500"} onClick={() => handleOpenStockModal("out")} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-800 mb-6">Weekly Revenue</h3>
          <div className="h-72">
            <ResponsiveContainer width="99%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `₹${value}`} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="revenue" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-800 mb-6">Order Trends</h3>
          <div className="h-72">
            <ResponsiveContainer width="99%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Line type="monotone" dataKey="ordersCount" stroke="#f59e0b" strokeWidth={3} dot={{r: 4, fill: '#f59e0b', strokeWidth: 0}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      
      {pendingModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div>
                <h2 className="text-lg font-bold text-slate-900 uppercase tracking-tight">Pending Amounts</h2>
                <p className="text-slate-500 text-sm font-medium">List of customers with outstanding balances</p>
              </div>
              <button onClick={() => setPendingModalOpen(false)} className="text-slate-400 hover:text-red-500 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-auto p-6">
              {pendingCustomers.length === 0 ? (
                <div className="text-center text-slate-500 font-medium py-8">No pending amounts.</div>
              ) : (
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="p-3 font-bold text-slate-900">Customer</th>
                      <th className="p-3 font-bold text-slate-900">Mobile</th>
                      <th className="p-3 font-bold text-slate-900 text-right">Pending Amount</th>
                      <th className="p-3 font-bold text-slate-900 text-right">Last Purchase</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pendingCustomers.sort((a, b) => b.totalDue - a.totalDue).map(c => (
                      <tr key={c.id} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-slate-900">{c.name}</td>
                        <td className="p-3 text-slate-600 font-medium">{c.mobile}</td>
                        <td className="p-3 text-right font-bold text-amber-600">₹{Number(c.totalDue || 0).toFixed(2)}</td>
                        <td className="p-3 text-right text-slate-600 font-medium">
                          {c.lastPurchaseDate ? new Date(c.lastPurchaseDate).toLocaleDateString('en-GB') : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

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
                          <span className={`font-bold ${p.stock === 0 ? 'text-red-600' : 'text-amber-600'}`}>{p.stock}</span>
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

