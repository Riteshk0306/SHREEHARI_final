export interface Product {
  id: string;
  name: string;
  category: string;
  brand: string;
  description: string;
  purchasePrice: number;
  sellingPrice: number;
  mrp: number;
  discountPercentage: number;
  stock: number;
  images: string[];
  status: 'Active' | 'Inactive';
}

export interface Address {
  id: string;
  fullName: string;
  mobile: string;
  alternateMobile?: string;
  houseFlat: string;
  street: string;
  area: string;
  city: string;
  state: string;
  pinCode: string;
  landmark?: string;
  isDefault: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'customer';
  mobile: string;
  companyName?: string;
  gstNumber?: string;
  profilePicture?: string;
  addresses?: Address[];
}

export interface Order {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  mobile: string;
  email: string;
  items: CartItem[];
  address: string;
  paymentMethod: string;
  paymentStatus: 'Pending' | 'Paid' | 'Failed';
  orderStatus: 'Pending' | 'Accepted' | 'Packed' | 'Shipped' | 'Out for Delivery' | 'Completed' | 'Cancelled';
  date: string;
  totalAmount: number;
  paidAmount?: number;
  dueAmount?: number;
  profit: number;
  source?: string;
}

export interface CartItem {
  productId: string;
  name: string;
  sellingPrice: number;
  quantity: number;
  image: string;
  purchasePrice: number;
}

export interface Bill {
  id: string;
  billNumber: string;
  customerName: string;
  mobile: string;
  items: CartItem[];
  paymentMethod: string;
  date: string;
  totalAmount: number;
  profit: number;
  source?: string;
}

export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalProfit: number;
  totalProducts: number;
  totalCustomers: number;
  todaysSales: number;
  lowStockProducts: number;
  outOfStockProducts: number;
}

export interface Customer {
  id: string;
  name: string;
  mobile: string;
  email?: string;
  address?: string;
  totalPurchases: number;
  totalPaid: number;
  totalDue: number;
  lastPurchaseDate?: string;
  paymentReminderDate?: string;
  paymentHistory?: { date: string; amount: number; }[];
}
