export type UserRole = 'Super Admin' | 'Shop Owner' | 'Manager' | 'Staff';

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  shopName: string;
  phoneNumber?: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  brand: string;
  vehicleModel: string;
  partNumber: string;
  barcode: string;
  qrCode: string;
  purchasePrice: number;
  sellingPrice: number;
  gstPercent: number; // e.g. 18 for 18%
  stockQuantity: number;
  lowStockWarning: number;
  imageUrl?: string;
  location?: string; // Rack info
}

export interface Vehicle {
  model: string;
  registrationNumber: string;
  chassisNumber?: string;
  year?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  creditBalance: number;
  vehicles: Vehicle[];
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  email?: string;
  companyName: string;
  gstin?: string;
  pendingPayment: number;
  createdAt: string;
}

export interface InvoiceItem {
  productId: string;
  name: string;
  partNumber: string;
  quantity: number;
  sellingPrice: number;
  gstPercent: number;
  gstAmount: number;
  subtotal: number; // Includes GST
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  items: InvoiceItem[];
  totalBeforeGst: number;
  totalGst: number;
  discount: number;
  grandTotal: number;
  paymentMethod: 'Cash' | 'Card' | 'UPI' | 'Credit';
  status: 'Paid' | 'Pending' | 'Returned';
  createdAt: string;
}

export interface PurchaseItem {
  productId: string;
  name: string;
  quantity: number;
  purchasePrice: number;
  subtotal: number;
}

export interface PurchaseBill {
  id: string;
  billNumber: string;
  supplierId: string;
  supplierName: string;
  items: PurchaseItem[];
  grandTotal: number;
  paymentStatus: 'Paid' | 'Pending';
  createdAt: string;
}

export interface JobCard {
  id: string;
  jobCardNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  vehicleModel: string;
  vehiclePlate: string;
  complaints: string[];
  assignedMechanic: string;
  status: 'Received' | 'In Progress' | 'Inspection' | 'Parts Pending' | 'Ready' | 'Delivered';
  estimatedCost: number;
  actualCost?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'low_stock' | 'pending_payment' | 'service_due' | 'system';
  read: boolean;
  createdAt: string;
}
