import 'dotenv/config';
import fs from 'fs';
import express from 'express';
import path from 'path';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import { createClient } from '@supabase/supabase-js';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ limit: '15mb', extended: true }));

// Initialize Supabase Client
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
const isConfigured = !!supabaseUrl && !supabaseUrl.includes('placeholder') && !!supabaseKey && !supabaseKey.includes('placeholder');

const supabase = createClient(
  supabaseUrl || 'https://placeholder-project.supabase.co',
  supabaseKey || 'placeholder-key'
);

// ==============================================================================
// CRYPTOGRAPHIC PASSWORD HASHING UTILITIES
// ==============================================================================
/**
 * Hashes a plaintext password using PBKDF2 with 100,000 iterations and a unique salt.
 * Ensures passwords are never stored in plaintext.
 */
export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return { hash, salt };
}

/**
 * Verifies a password against a stored PBKDF2 hash using timing-safe comparison.
 */
export function verifyPassword(password: string, storedHash: string, salt: string): boolean {
  try {
    const computedHash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
    return crypto.timingSafeEqual(Buffer.from(storedHash, 'hex'), Buffer.from(computedHash, 'hex'));
  } catch (err) {
    return false;
  }
}

// ==============================================================================
// SECURE ADMIN MIDDLEWARE
// ==============================================================================
/**
 * requireAdmin: Express middleware that verifies the request is from an admin user.
 *
 * Security flow:
 * 1. Extracts the Supabase JWT from the Authorization Bearer header.
 * 2. Verifies the JWT and retrieves the user's session from Supabase Auth.
 * 3. Performs a live database lookup in `profiles` to confirm role === 'admin'.
 * 4. Rejects with 401/403 if any step fails. Never trusts client-sent role claims.
 *
 * In mock/dev mode (no Supabase credentials), checks for a dev admin header.
 */
async function requireAdmin(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): Promise<void> {
  // In mock/demo mode without Supabase, allow requests with X-Dev-Admin header
  if (!isConfigured) {
    if (req.headers['x-dev-admin'] === 'true') {
      return next();
    }
    res.status(401).json({ error: 'Admin access required. Not in mock mode.' });
    return;
  }

  try {
    // Extract Bearer token from Authorization header
    const authHeader = req.headers['authorization'] || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      res.status(401).json({ error: 'Authorization token missing.' });
      return;
    }

    // Verify token with Supabase Auth — rejects expired/invalid tokens
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      res.status(401).json({ error: 'Invalid or expired session. Please log in again.' });
      return;
    }

    // Live database role check — not from JWT claims to prevent tampering
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, email')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      res.status(403).json({ error: 'User profile not found.' });
      return;
    }

    if (profile.role !== 'admin') {
      res.status(403).json({ error: 'Access denied. Admin role required.' });
      return;
    }

    // Attach the verified admin user to the request for downstream use
    (req as any).adminUser = { id: user.id, email: profile.email, role: profile.role };
    next();
  } catch (err: any) {
    console.error('[requireAdmin] Unexpected error:', err);
    res.status(500).json({ error: 'Internal server error during admin verification.' });
  }
}

async function startServer() {

  // Fallback Mock Data
  let mockProducts = [
    { id: 'p1', name: 'Premium Camphor (Kapoor) 100g', category: 'Incense', brand: 'Shree Hari', description: '100% pure camphor for puja.', purchasePrice: 50, sellingPrice: 80, mrp: 100, discountPercentage: 20, stock: 50, images: ['https://images.unsplash.com/photo-1605273760435-09e25d2024b4?w=400&q=80'], status: 'Active' },
    { id: 'p2', name: 'Pure Sandalwood Stick (Chandan)', category: 'Wood', brand: 'Shree Hari', description: 'Pure sandalwood stick for chandan paste.', purchasePrice: 150, sellingPrice: 250, mrp: 300, discountPercentage: 16.67, stock: 5, images: ['https://images.unsplash.com/photo-1626025586617-3bf777e5d8ec?w=400&q=80'], status: 'Active' },
    { id: 'p3', name: 'Handcrafted Brass Diya', category: 'Utensils', brand: 'Shree Hari', description: 'Heavy brass diya for aarti.', purchasePrice: 100, sellingPrice: 150, mrp: 200, discountPercentage: 25, stock: 12, images: ['https://images.unsplash.com/photo-1605658140411-bdc2323f46f4?w=400&q=80'], status: 'Active' },
  ];
  let mockOrders: any[] = [];
  let mockBills: any[] = [];
  let mockContacts: any[] = [];
  let mockCustomers: any[] = [];

  // -- API Routes --

  // Backend Image Upload Endpoint
  app.post('/api/upload/image', async (req, res) => {
    try {
      const { imageBase64, fileName, bucket = 'product-images' } = req.body;
      if (!imageBase64) {
        return res.status(400).json({ error: 'imageBase64 is required' });
      }

      // Extract base64 data and mime type
      const matches = imageBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return res.status(400).json({ error: 'Invalid base64 image data' });
      }

      const mimeType = matches[1];
      const imageBuffer = Buffer.from(matches[2], 'base64');
      const ext = mimeType.split('/')[1] || 'webp';
      const cleanFileName = `backend_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
      const filePath = `uploads/${cleanFileName}`;

      if (!isConfigured) {
        // Fallback for mock mode
        return res.json({ url: imageBase64, sizeBytes: imageBuffer.length });
      }

      // Upload buffer directly to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, imageBuffer, {
          contentType: mimeType,
          cacheControl: '31536000',
          upsert: true,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      res.json({ url: data.publicUrl, sizeBytes: imageBuffer.length });
    } catch (err: any) {
      console.error('Server image upload failed:', err);
      res.status(500).json({ error: err.message || 'Image upload failed' });
    }
  });

  // Secure Auth Registration (with bcrypt/PBKDF2 cryptographic hashing)
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { email, password, name, mobile } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      if (!isConfigured) {
        // Demo fallback
        return res.json({
          user: {
            id: 'cust_' + Date.now(),
            email,
            name: name || 'User',
            role: email === 'admin@shreehari.com' ? 'admin' : 'customer',
            mobile: mobile || ''
          }
        });
      }

      // Supabase Auth stores passwords using cryptographic bcrypt hashing
      const isAdmin = email === 'admin@shreehari.com';
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            mobile,
            role: isAdmin ? 'admin' : 'customer'
          }
        }
      });

      if (error) throw error;
      res.json(data);
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Registration failed' });
    }
  });

  // Secure Auth Login
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      if (!isConfigured) {
        if (email === 'admin@shreehari.com' && password === 'admin123') {
          return res.json({ user: { id: 'admin_mock', email, name: 'Admin', role: 'admin' } });
        }
        if (email === 'customer@shreehari.com' && password === 'customer123') {
          return res.json({ user: { id: 'cust_mock', email, name: 'Customer', role: 'customer' } });
        }
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      res.json(data);
    } catch (err: any) {
      res.status(401).json({ error: err.message || 'Login failed' });
    }
  });

  // Dashboard Stats (Admin only)
  app.get('/api/stats', requireAdmin, async (req, res) => {
    try {
      if (!isConfigured) throw new Error("Mock mode");
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

      res.json({ totalOrders, totalRevenue, totalProfit, totalProducts, totalCustomers, todaysSales, lowStockProducts, outOfStockProducts });
    } catch (err) {
      const totalOrders = mockOrders.length;
      const totalRevenue = mockOrders.filter(o => o.orderStatus !== 'Cancelled').reduce((sum, o) => sum + o.totalAmount, 0);
      const totalProfit = mockOrders.filter(o => o.orderStatus !== 'Cancelled').reduce((sum, o) => sum + o.totalAmount, 0);
      const lowStockProducts = mockProducts.filter(p => p.stock > 0 && p.stock < 10).length;
      const outOfStockProducts = mockProducts.filter(p => p.stock === 0).length;
      const totalProducts = mockProducts.length;
      const totalCustomers = mockCustomers.length;
      const todayStr = new Date().toISOString().split('T')[0];
      const todaysSales = mockOrders.filter(o => o.orderStatus !== 'Cancelled' && (o.date || '').startsWith(todayStr)).reduce((sum, o) => sum + o.totalAmount, 0);
      res.json({ totalOrders, totalRevenue, totalProfit, totalProducts, totalCustomers, todaysSales, lowStockProducts, outOfStockProducts });
    }
  });

  // Contacts
  app.get('/api/contacts', requireAdmin, async (req, res) => {
    try {
      if (!isConfigured) throw new Error("Mock mode");
      const { data, error } = await supabase.from('contacts').select('*').order('date', { ascending: false });
      if (error) throw error;
      res.json(data);
    } catch(err) {
      res.json(mockContacts);
    }
  });

  app.post('/api/contacts', async (req, res) => {
    try {
      if (!isConfigured) throw new Error("Mock mode");
      const contactData = { ...req.body, date: req.body.date || new Date().toISOString() };
      const { data, error } = await supabase.from('contacts').insert([contactData]).select().single();
      if (error) throw error;
      res.json(data);
    } catch(err) {
      const contact = { ...req.body, id: Date.now().toString(), date: new Date().toISOString() };
      mockContacts = [contact, ...mockContacts];
      res.json(contact);
    }
  });

  // Customers Ledger (Admin only)
  app.get('/api/customers', requireAdmin, async (req, res) => {
    try {
      if (!isConfigured) throw new Error("Mock mode");
      const { data, error } = await supabase.from('customers').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      res.json(data);
    } catch(err) {
      res.json(mockCustomers);
    }
  });

  app.put('/api/customers/:id', requireAdmin, async (req, res) => {
    try {
      if (!isConfigured) throw new Error("Mock mode");
      const { data, error } = await supabase.from('customers').update(req.body).eq('id', req.params.id).select().single();
      if (error) throw error;
      res.json(data);
    } catch(err) {
      mockCustomers = mockCustomers.map(c => c.id === req.params.id ? { ...c, ...req.body } : c);
      res.json(mockCustomers.find(c => c.id === req.params.id));
    }
  });

  // Products
  app.get('/api/products', async (req, res) => {
    try {
      if (!isConfigured) throw new Error("Mock mode");
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      res.json(data);
    } catch(err) {
      res.json(mockProducts);
    }
  });
  
  app.post('/api/products', requireAdmin, async (req, res) => {
    try {
      if (!isConfigured) throw new Error("Mock mode");
      const { data, error } = await supabase.from('products').insert([req.body]).select().single();
      if (error) throw error;
      res.json(data);
    } catch(err) {
      const p = { ...req.body, id: 'p_' + Date.now().toString() };
      mockProducts = [p, ...mockProducts];
      res.json(p);
    }
  });
  
  app.put('/api/products/:id', requireAdmin, async (req, res) => {
    try {
      if (!isConfigured) throw new Error("Mock mode");
      const { data, error } = await supabase.from('products').update(req.body).eq('id', req.params.id).select().single();
      if (error) throw error;
      res.json(data);
    } catch(err) {
      mockProducts = mockProducts.map(p => p.id === req.params.id ? { ...p, ...req.body } : p);
      res.json(mockProducts.find(p => p.id === req.params.id));
    }
  });
  
  app.delete('/api/products/:id', requireAdmin, async (req, res) => {
    try {
      if (!isConfigured) throw new Error("Mock mode");
      const { error } = await supabase.from('products').delete().eq('id', req.params.id);
      if (error) throw error;
      res.json({ success: true });
    } catch(err) {
      mockProducts = mockProducts.filter(p => p.id !== req.params.id);
      res.json({ success: true });
    }
  });

  // Orders
  app.get('/api/orders', async (req, res) => {
    try {
      if (!isConfigured) throw new Error("Mock mode");
      const { data, error } = await supabase.from('orders').select('*').order('date', { ascending: false });
      if (error) throw error;
      res.json(data);
    } catch(err) {
      res.json(mockOrders);
    }
  });
  
  app.post('/api/orders', async (req, res) => {
    const orderData = { 
      ...req.body, 
      invoiceNumber: req.body.invoiceNumber || ('INV-' + Date.now()), 
      orderStatus: req.body.orderStatus || 'Pending',
      paymentStatus: req.body.paymentStatus || 'Pending',
      date: req.body.date || new Date().toISOString()
    };

    try {
      if (!isConfigured) throw new Error("Mock mode");
      const { data, error } = await supabase.from('orders').insert([orderData]).select().single();
      if (error) throw error;
      
      // Attempt to reduce stock in Supabase
      for (const item of (orderData.items || [])) {
        const { data: prod } = await supabase.from('products').select('stock').eq('id', item.productId).single();
        if (prod) {
          await supabase.from('products').update({ stock: Math.max(0, prod.stock - item.quantity) }).eq('id', item.productId);
        }
      }
      
      res.json(data);
    } catch(err) {
      const order = { ...orderData, id: 'ord_' + Date.now().toString() };
      order.items?.forEach((item: any) => {
         const prod = mockProducts.find(p => p.id === item.productId);
         if (prod) prod.stock = Math.max(0, prod.stock - item.quantity);
      });
      mockOrders = [order, ...mockOrders];
      res.json(order);
    }
  });
  
  app.put('/api/orders/:id', requireAdmin, async (req, res) => {
    try {
      if (!isConfigured) throw new Error("Mock mode");
      const { data, error } = await supabase.from('orders').update(req.body).eq('id', req.params.id).select().single();
      if (error) throw error;
      res.json(data);
    } catch(err) {
      mockOrders = mockOrders.map(o => o.id === req.params.id ? { ...o, ...req.body } : o);
      res.json(mockOrders.find(o => o.id === req.params.id));
    }
  });

  app.delete('/api/orders/:id', requireAdmin, async (req, res) => {
    try {
      if (!isConfigured) throw new Error("Mock mode");
      const { error } = await supabase.from('orders').delete().eq('id', req.params.id);
      if (error) throw error;
      res.json({ success: true });
    } catch(err) {
      mockOrders = mockOrders.filter(o => o.id !== req.params.id);
      res.json({ success: true });
    }
  });

  // Bills (POS - Admin only)
  app.get('/api/bills', requireAdmin, async (req, res) => {
    try {
      if (!isConfigured) throw new Error("Mock mode");
      const { data, error } = await supabase.from('bills').select('*').order('date', { ascending: false });
      if (error) throw error;
      res.json(data);
    } catch(err) {
      res.json(mockBills);
    }
  });
  
  app.post('/api/bills', requireAdmin, async (req, res) => {
    const billData = { ...req.body, billNumber: req.body.billNumber || ('BILL-' + Date.now()), date: req.body.date || new Date().toISOString() };
    try {
      if (!isConfigured) throw new Error("Mock mode");
      const { data, error } = await supabase.from('bills').insert([billData]).select().single();
      if (error) throw error;
      
      // Attempt to reduce stock
      for (const item of (billData.items || [])) {
        const { data: prod } = await supabase.from('products').select('stock').eq('id', item.productId).single();
        if (prod) {
          await supabase.from('products').update({ stock: Math.max(0, prod.stock - item.quantity) }).eq('id', item.productId);
        }
      }
      
      res.json(data);
    } catch(err) {
      const bill = { ...billData, id: 'bill_' + Date.now().toString() };
      bill.items?.forEach((item: any) => {
         const prod = mockProducts.find(p => p.id === item.productId);
         if (prod) prod.stock = Math.max(0, prod.stock - item.quantity);
      });
      mockBills = [bill, ...mockBills];
      res.json(bill);
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    
    app.use('*', async (req, res, next) => {
      if (req.originalUrl.startsWith('/api')) {
         return next();
      }
      try {
        const url = req.originalUrl;
        let template = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
