import { supabase, isSupabaseConfigured } from './lib/supabase';
import { Product, Customer, Order, Bill, User } from './types';

export const api = {
  get: async (url: string): Promise<any> => {
    if (!isSupabaseConfigured()) throw new Error("Supabase not configured");

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
      const { data: orders, error: ordersError } = await supabase.from('orders').select('*');
      if (ordersError) throw ordersError;
      
      const { data: products, error: productsError } = await supabase.from('products').select('*');
      if (productsError) throw productsError;
      
      const { data: profiles, error: profilesError } = await supabase.from('profiles').select('*');
      if (profilesError) throw profilesError;

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
  },

  post: async (url: string, data: any): Promise<any> => {
    if (!isSupabaseConfigured()) throw new Error("Supabase not configured");

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
  },

  put: async (url: string, data: any): Promise<any> => {
    if (!isSupabaseConfigured()) throw new Error("Supabase not configured");

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
  },

  delete: async (url: string): Promise<any> => {
    if (!isSupabaseConfigured()) throw new Error("Supabase not configured");

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
  }
};
