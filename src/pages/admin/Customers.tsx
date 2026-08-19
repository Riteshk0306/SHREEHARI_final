import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { Customer } from '../../types';
import { Search, Edit2, AlertCircle, Calendar, Plus, Phone } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [reminderDate, setReminderDate] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const data = await api.get('/api/customers');
      // Sort by due amount (highest first) then by name
      setCustomers(data.sort((a: Customer, b: Customer) => b.totalDue - a.totalDue || a.name.localeCompare(b.name)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenModal = (c: Customer) => {
    setSelectedCustomer(c);
    setPaymentAmount('');
    setReminderDate(c.paymentReminderDate || '');
    // Format current date for datetime-local (YYYY-MM-DDThh:mm)
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(now.getTime() - offset)).toISOString().slice(0, 16);
    setPaymentDate(localISOTime);
    setIsModalOpen(true);
  };

    const handleClearHistory = async () => {
    if (!selectedCustomer) return;
    // Bypassing window.confirm for iframe compatibility
    try {
      await api.put(`/api/customers/${selectedCustomer.id}`, {
        paymentHistory: []
      });
      setIsModalOpen(false);
      fetchCustomers();
    } catch (err) {
      console.error(err);
      alert('Failed to clear history');
    }
  };

  const handleUpdateCustomer = async () => {
    if (!selectedCustomer) return;
    try {
      let totalPaid = selectedCustomer.totalPaid;
      let totalDue = selectedCustomer.totalDue;
      
      let newHistory = selectedCustomer.paymentHistory ? [...selectedCustomer.paymentHistory] : [];
      
      const payment = Number(paymentAmount);
      if (payment > 0) {
        totalPaid += payment;
        totalDue = Math.max(0, totalDue - payment);
        newHistory.push({
          date: paymentDate ? new Date(paymentDate).toISOString() : new Date().toISOString(),
          amount: payment
        });
      }

      await api.put(`/api/customers/${selectedCustomer.id}`, {
        totalPaid,
        totalDue,
        paymentReminderDate: reminderDate || null,
        paymentHistory: newHistory
      });

      setIsModalOpen(false);
      fetchCustomers();
    } catch (err) {
      console.error(err);
      alert('Failed to update customer');
    }
  };

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.mobile.includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 uppercase tracking-tight">Customers Ledger</h1>
          <p className="text-slate-500 font-medium">Manage customer accounts and pending payments</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search name or mobile..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-4 font-bold text-slate-900">Customer</th>
                <th className="p-4 font-bold text-slate-900 text-right">Total Purchases</th>
                <th className="p-4 font-bold text-slate-900 text-right">Total Paid</th>
                <th className="p-4 font-bold text-slate-900 text-right">Pending Due</th>
                <th className="p-4 font-bold text-slate-900">Last Purchase</th>
                <th className="p-4 font-bold text-slate-900 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 font-medium">No customers found.</td>
                </tr>
              ) : (
                filtered.map(c => {
                  const isOverdue = c.totalDue > 0 && c.lastPurchaseDate && differenceInDays(new Date(), new Date(c.lastPurchaseDate)) > 30;
                  return (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-slate-900">{c.name}</div>
                        <div className="text-slate-500 font-medium flex items-center gap-1 text-xs mt-1">
                          <Phone className="w-3 h-3" /> {c.mobile}
                        </div>
                      </td>
                      <td className="p-4 text-right font-medium text-slate-900">₹{Number(c.totalPurchases || 0).toFixed(2)}</td>
                      <td className="p-4 text-right font-medium text-emerald-600">₹{Number(c.totalPaid || 0).toFixed(2)}</td>
                      <td className="p-4 text-right font-bold">
                        <span className={c.totalDue > 0 ? 'text-red-600' : 'text-emerald-600'}>
                          ₹{Number(c.totalDue || 0).toFixed(2)}
                        </span>
                        {isOverdue && (
                          <div className="text-[10px] text-red-500 uppercase tracking-widest mt-1 flex items-center justify-end gap-1">
                            <AlertCircle className="w-3 h-3" /> Overdue
                          </div>
                        )}
                        {c.paymentReminderDate && c.totalDue > 0 && (
                          <div className="text-[10px] text-amber-600 uppercase tracking-widest mt-1 flex items-center justify-end gap-1">
                            <Calendar className="w-3 h-3" /> Due {format(new Date(c.paymentReminderDate), 'dd MMM')}
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-slate-600 font-medium">
                        {c.lastPurchaseDate ? format(new Date(c.lastPurchaseDate), 'dd MMM yyyy') : '-'}
                      </td>
                      <td className="p-4 text-right">
                        <button onClick={() => handleOpenModal(c)} className="p-2 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider">
                          <Edit2 className="w-4 h-4" /> Manage
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && selectedCustomer && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 shrink-0">
              <h2 className="text-lg font-bold text-slate-900 uppercase tracking-tight">Manage Account</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-red-500 transition-colors">
                <AlertCircle className="w-6 h-6 hidden" />
                <span className="text-3xl leading-none px-2">&times;</span>
              </button>
            </div>
            <div className="p-6 space-y-6 overflow-y-auto">
              <div>
                <h3 className="font-bold text-slate-900 text-xl">{selectedCustomer.name}</h3>
                <p className="text-slate-500 font-medium text-sm flex items-center gap-1 mt-1">
                  <Phone className="w-4 h-4" /> {selectedCustomer.mobile}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                  <div className="text-xs font-bold text-red-600 uppercase tracking-wider mb-1">Total Due</div>
                  <div className="text-2xl font-bold text-red-700">₹{Number(selectedCustomer.totalDue || 0).toFixed(2)}</div>
                </div>
                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                  <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Total Paid</div>
                  <div className="text-2xl font-bold text-emerald-700">₹{Number(selectedCustomer.totalPaid || 0).toFixed(2)}</div>
                </div>
                            </div>

              {selectedCustomer.paymentHistory && selectedCustomer.paymentHistory.length > 0 && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 max-h-40 overflow-y-auto">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Payment History</h4>
                  <div className="space-y-2">
                    {[...selectedCustomer.paymentHistory].reverse().map((hist, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm">
                        <span className="text-slate-500 font-medium">{format(new Date(hist.date), 'dd MMM yyyy, hh:mm a')}</span>
                        <span className="text-emerald-600 font-bold">+ ₹{Number(hist.amount).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Record New Payment (₹)</label>
                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={e => setPaymentAmount(e.target.value)}
                    max={selectedCustomer.totalDue}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 transition-all font-medium"
                    placeholder={`Max ₹${selectedCustomer.totalDue}`}
                    disabled={selectedCustomer.totalDue === 0}
                  />
                                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Payment Date & Time</label>
                  <input
                    type="datetime-local"
                    value={paymentDate}
                    onChange={e => setPaymentDate(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 transition-all font-medium"
                    disabled={selectedCustomer.totalDue === 0}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Set Payment Reminder Date</label>
                  <input
                    type="date"
                    value={reminderDate}
                    onChange={e => setReminderDate(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 transition-all font-medium"
                  />
                </div>
              </div>

              <button
                onClick={handleUpdateCustomer}
                className="w-full bg-slate-900 text-white font-bold uppercase tracking-wider text-sm py-3 rounded-lg hover:bg-slate-800 transition-colors shrink-0"
              >
                Save Changes
              </button>
              {selectedCustomer.totalDue === 0 && selectedCustomer.paymentHistory && selectedCustomer.paymentHistory.length > 0 && (
                <button
                  onClick={handleClearHistory}
                  className="w-full bg-red-50 text-red-600 border border-red-200 font-bold uppercase tracking-wider text-sm py-3 rounded-lg hover:bg-red-100 transition-colors mt-2 shrink-0"
                >
                  Delete Payment History
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
