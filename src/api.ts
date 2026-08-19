import { supabase, isSupabaseConfigured } from './lib/supabase';
import { Product, Customer, Order, Bill, User } from './types';

let mockProducts: Product[] = [
  { id: 'p1', name: 'Premium Camphor (Kapoor) 100g', category: 'Incense', brand: 'Shree Hari', description: '100% pure camphor for puja.', purchasePrice: 50, sellingPrice: 80, mrp: 100, discountPercentage: 20, stock: 50, images: ['https://images.unsplash.com/photo-1605273760435-09e25d2024b4?w=400&q=80'], status: 'Active' },
  { id: 'p2', name: 'Pure Sandalwood Stick (Chandan)', category: 'Wood', brand: 'Shree Hari', description: 'Pure sandalwood stick for chandan paste.', purchasePrice: 150, sellingPrice: 250, mrp: 300, discountPercentage: 16.67, stock: 5, images: ['https://images.unsplash.com/photo-1626025586617-3bf777e5d8ec?w=400&q=80'], status: 'Active' },
  { id: 'p3', name: 'Handcrafted Brass Diya', category: 'Utensils', brand: 'Shree Hari', description: 'Heavy brass diya for aarti.', purchasePrice: 100, sellingPrice: 150, mrp: 200, discountPercentage: 25, stock: 12, images: ['https://images.unsplash.com/photo-1605658140411-bdc2323f46f4?w=400&q=80'], status: 'Active' },
];
let mockOrders: Order[] = [];
let mockBills: Bill[] = [];
let mockContacts: any[] = [];
let mockCustomers: Customer[] = [];

export const api = {
  get: async (url: string): Promise<any> => {
    try {
      if (!isSupabaseConfigured()) throw new Error("Mock Mode: Supabase not configured");

      if (url === '/api/customers') {
        const { data, error } = await supabase.from('customers').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
      }

      if (url === '/api/products') {
        const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
      }

      if (url === '/api/orders') {
        const { data, error } = await supabase.from('orders').select('*').order('date', { ascending: false });
        if (error) throw error;
        return data || [];
      }

      if (url === '/api/contacts') {
        const { data, error } = await supabase.from('contacts').select('*').order('date', { ascending: false });
        if (error) throw error;
        return data || [];
      }

      if (url === '/api/bills') {
        const { data, error } = await supabase.from('bills').select('*').order('date', { ascending: false });
        if (error) throw error;
        return data || [];
      }

      if (url.startsWith('/api/profiles/') || url.startsWith('/api/users/')) {
        const id = url.split('/').pop();
        const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single();
        if (error) throw error;
        return data;
      }

      if (url === '/api/stats') {
        const { data: orders } = await supabase.from('orders').select('*');
        const { data: products } = await supabase.from('products').select('*');
        const { data: profiles } = await supabase.from('profiles').select('*');

        const orderList = orders || [];
        const productList = products || [];
        const userList = profiles || [];

        const totalOrders = orderList.length;
        const totalRevenue = orderList.filter(o => o.orderStatus !== 'Cancelled').reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
        const totalProfit = orderList.filter(o => o.orderStatus !== 'Cancelled').reduce((sum, o) => sum + (Number(o.profit) || 0), 0);
        const lowStockProducts = productList.filter(p => Number(p.stock) > 0 && Number(p.stock) < 10).length;
        const outOfStockProducts = productList.filter(p => Number(p.stock) === 0).length;
        const totalProducts = productList.length;
        const totalCustomers = userList.filter(u => u.role === 'customer').length;
        const todayStr = new Date().toISOString().split('T')[0];
        const todaysSales = orderList
          .filter(o => o.orderStatus !== 'Cancelled' && (o.date || '').startsWith(todayStr))
          .reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);

        return { totalOrders, totalRevenue, totalProfit, totalProducts, totalCustomers, todaysSales, lowStockProducts, outOfStockProducts };
      }

      throw new Error(`Endpoint not found: ${url}`);
    } catch (err) {
      if (url === '/api/customers') return mockCustomers;
      if (url === '/api/products') return mockProducts;
      if (url === '/api/orders') return mockOrders;
      if (url === '/api/bills') return mockBills;
      if (url === '/api/contacts') return mockContacts;
      if (url === '/api/stats') {
        const totalOrders = mockOrders.length;
        const totalRevenue = mockOrders.filter(o => o.orderStatus !== 'Cancelled').reduce((sum, o) => sum + o.totalAmount, 0);
        const totalProfit = mockOrders.filter(o => o.orderStatus !== 'Cancelled').reduce((sum, o) => sum + (o.profit || 0), 0);
        const lowStockProducts = mockProducts.filter(p => p.stock > 0 && p.stock < 10).length;
        const outOfStockProducts = mockProducts.filter(p => p.stock === 0).length;
        const totalProducts = mockProducts.length;
        const totalCustomers = mockCustomers.length;
        const todayStr = new Date().toISOString().split('T')[0];
        const todaysSales = mockOrders
          .filter(o => o.orderStatus !== 'Cancelled' && (o.date || '').startsWith(todayStr))
          .reduce((sum, o) => sum + o.totalAmount, 0);
        return { totalOrders, totalRevenue, totalProfit, totalProducts, totalCustomers, todaysSales, lowStockProducts, outOfStockProducts };
      }
      throw err;
    }
  },

  post: async (url: string, data: any): Promise<any> => {
    try {
      if (!isSupabaseConfigured()) throw new Error("Mock Mode: Supabase not configured");

      if (url === '/api/contacts') {
        const contactData = { ...data, date: data.date || new Date().toISOString() };
        const { data: res, error } = await supabase.from('contacts').insert([contactData]).select().single();
        if (error) throw error;
        return res;
      }

      if (url === '/api/products') {
        const { data: res, error } = await supabase.from('products').insert([data]).select().single();
        if (error) throw error;
        return res;
      }

      if (url === '/api/orders') {
        const orderData = {
          ...data,
          invoiceNumber: data.invoiceNumber || 'INV-' + Date.now(),
          orderStatus: data.orderStatus || 'Pending',
          paymentStatus: data.paymentStatus || 'Pending',
          date: data.date || new Date().toISOString()
        };

        // Customer Ledger Update in Supabase
        if (orderData.mobile) {
          try {
            const { data: existingCust } = await supabase.from('customers').select('*').eq('mobile', orderData.mobile).maybeSingle();
            const paid = orderData.paidAmount !== undefined ? Number(orderData.paidAmount) : (orderData.paymentStatus === 'Paid' ? Number(orderData.totalAmount) : 0);
            const due = Number(orderData.totalAmount) - paid;

            if (existingCust) {
              await supabase.from('customers').update({
                name: orderData.customerName || existingCust.name,
                totalPurchases: Number(existingCust.totalPurchases || 0) + Number(orderData.totalAmount || 0),
                totalPaid: Number(existingCust.totalPaid || 0) + paid,
                totalDue: Number(existingCust.totalDue || 0) + due,
                lastPurchaseDate: new Date().toISOString()
              }).eq('id', existingCust.id);
            } else {
              await supabase.from('customers').insert([{
                name: orderData.customerName || 'Customer',
                mobile: orderData.mobile,
                email: orderData.email || '',
                address: orderData.address || '',
                totalPurchases: Number(orderData.totalAmount || 0),
                totalPaid: paid,
                totalDue: due,
                lastPurchaseDate: new Date().toISOString(),
                paymentHistory: paid > 0 ? [{ date: new Date().toISOString(), amount: paid }] : []
              }]);
            }
          } catch (e) {
            console.warn("Customer ledger update failed:", e);
          }
        }

        const { data: res, error } = await supabase.from('orders').insert([orderData]).select().single();
        if (error) throw error;

        // Auto-decrement inventory stock in Supabase
        for (const item of (orderData.items || [])) {
          try {
            const { data: prod } = await supabase.from('products').select('stock').eq('id', item.productId).single();
            if (prod) {
              const newStock = Math.max(0, prod.stock - item.quantity);
              await supabase.from('products').update({ stock: newStock }).eq('id', item.productId);
            }
          } catch (e) {
            console.warn("Stock update error for item:", item.productId, e);
          }
        }

        return res;
      }

      if (url === '/api/bills') {
        const billData = {
          ...data,
          billNumber: data.billNumber || 'BILL-' + Date.now(),
          date: data.date || new Date().toISOString()
        };
        const { data: res, error } = await supabase.from('bills').insert([billData]).select().single();
        if (error) throw error;

        // Auto-decrement inventory stock
        for (const item of (billData.items || [])) {
          try {
            const { data: prod } = await supabase.from('products').select('stock').eq('id', item.productId).single();
            if (prod) {
              const newStock = Math.max(0, prod.stock - item.quantity);
              await supabase.from('products').update({ stock: newStock }).eq('id', item.productId);
            }
          } catch (e) {
            console.warn("Stock update error for bill item:", item.productId, e);
          }
        }

        return res;
      }

      throw new Error(`Endpoint not found: ${url}`);
    } catch (err) {
      if (url === '/api/contacts') {
        const contact = { ...data, id: Date.now().toString(), date: new Date().toISOString() };
        mockContacts = [contact, ...mockContacts];
        return contact;
      }

      if (url === '/api/products') {
        const p = { ...data, id: 'p_' + Date.now().toString() };
        mockProducts = [p, ...mockProducts];
        return p;
      }

      if (url === '/api/orders') {
        const order: Order = {
          ...data,
          id: 'ord_' + Date.now().toString(),
          invoiceNumber: data.invoiceNumber || 'INV-' + Date.now(),
          orderStatus: data.orderStatus || 'Pending',
          paymentStatus: data.paymentStatus || 'Pending',
          date: data.date || new Date().toISOString()
        };

        if (order.mobile) {
          const paid = order.paidAmount !== undefined ? order.paidAmount : (order.paymentStatus === 'Paid' ? order.totalAmount : 0);
          const due = order.totalAmount - paid;
          let custIndex = mockCustomers.findIndex(c => c.mobile === order.mobile);
          if (custIndex >= 0) {
            mockCustomers[custIndex].totalPurchases += order.totalAmount;
            mockCustomers[custIndex].totalPaid += paid;
            mockCustomers[custIndex].totalDue += due;
            mockCustomers[custIndex].lastPurchaseDate = new Date().toISOString();
          } else {
            mockCustomers.push({
              id: Date.now().toString(),
              name: order.customerName || 'Customer',
              mobile: order.mobile,
              totalPurchases: order.totalAmount,
              totalPaid: paid,
              totalDue: due,
              lastPurchaseDate: new Date().toISOString()
            });
          }
        }

        order.items?.forEach((item: any) => {
          mockProducts = mockProducts.map(p => p.id === item.productId ? { ...p, stock: Math.max(0, p.stock - item.quantity) } : p);
        });

        mockOrders = [order, ...mockOrders];
        return order;
      }

      if (url === '/api/bills') {
        const bill: Bill = {
          ...data,
          id: 'bill_' + Date.now().toString(),
          billNumber: data.billNumber || 'BILL-' + Date.now(),
          date: data.date || new Date().toISOString()
        };
        bill.items?.forEach((item: any) => {
          mockProducts = mockProducts.map(p => p.id === item.productId ? { ...p, stock: Math.max(0, p.stock - item.quantity) } : p);
        });
        mockBills = [bill, ...mockBills];
        return bill;
      }

      throw err;
    }
  },

  put: async (url: string, data: any): Promise<any> => {
    try {
      if (!isSupabaseConfigured()) throw new Error("Mock Mode: Supabase not configured");

      if (url.startsWith('/api/products/')) {
        const id = url.split('/').pop();
        const { data: res, error } = await supabase.from('products').update(data).eq('id', id).select().single();
        if (error) throw error;
        return res;
      }

      if (url.startsWith('/api/customers/')) {
        const id = url.split('/').pop();
        const { data: res, error } = await supabase.from('customers').update(data).eq('id', id).select().single();
        if (error) throw error;
        return res;
      }

      if (url.startsWith('/api/orders/')) {
        const id = url.split('/').pop();
        const { data: res, error } = await supabase.from('orders').update(data).eq('id', id).select().single();
        if (error) throw error;
        return res;
      }

      if (url.startsWith('/api/profiles/') || url.startsWith('/api/users/')) {
        const id = url.split('/').pop();
        const { data: res, error } = await supabase.from('profiles').update(data).eq('id', id).select().single();
        if (error) throw error;
        return res;
      }

      throw new Error(`Endpoint not found: ${url}`);
    } catch (err) {
      if (url.startsWith('/api/customers/')) {
        const id = url.split('/').pop();
        mockCustomers = mockCustomers.map(c => c.id === id ? { ...c, ...data } : c);
        return mockCustomers.find(c => c.id === id);
      }
      if (url.startsWith('/api/products/')) {
        const id = url.split('/').pop();
        mockProducts = mockProducts.map(p => p.id === id ? { ...p, ...data } : p);
        return mockProducts.find(p => p.id === id);
      }
      if (url.startsWith('/api/orders/')) {
        const id = url.split('/').pop();
        mockOrders = mockOrders.map(o => o.id === id ? { ...o, ...data } : o);
        return mockOrders.find(o => o.id === id);
      }
      throw err;
    }
  },

  delete: async (url: string): Promise<any> => {
    try {
      if (!isSupabaseConfigured()) throw new Error("Mock Mode: Supabase not configured");

      if (url.startsWith('/api/products/')) {
        const id = url.split('/').pop();
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) throw error;
        return { success: true };
      }

      if (url.startsWith('/api/orders/')) {
        const id = url.split('/').pop();
        const { error } = await supabase.from('orders').delete().eq('id', id);
        if (error) throw error;
        return { success: true };
      }

      if (url.startsWith('/api/contacts/')) {
        const id = url.split('/').pop();
        const { error } = await supabase.from('contacts').delete().eq('id', id);
        if (error) throw error;
        return { success: true };
      }

      throw new Error(`Endpoint not found: ${url}`);
    } catch (err) {
      if (url.startsWith('/api/products/')) {
        const id = url.split('/').pop();
        mockProducts = mockProducts.filter(p => p.id !== id);
        return { success: true };
      }
      if (url.startsWith('/api/orders/')) {
        const id = url.split('/').pop();
        mockOrders = mockOrders.filter(o => o.id !== id);
        return { success: true };
      }
      if (url.startsWith('/api/contacts/')) {
        const id = url.split('/').pop();
        mockContacts = mockContacts.filter(c => c.id !== id);
        return { success: true };
      }
      throw err;
    }
  }
};
