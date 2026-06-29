import React, { useState, useEffect } from 'react';
import { 
  Store, 
  LayoutDashboard, 
  Package, 
  Users, 
  Truck, 
  Wrench, 
  ShoppingBag, 
  FileText, 
  User, 
  LogOut, 
  Settings, 
  Globe, 
  Bell, 
  BookOpen,
  PlusCircle,
  Menu,
  X,
  CreditCard
} from 'lucide-react';
import { 
  auth, 
  db, 
  collections, 
  seedInitialDataIfEmpty 
} from './lib/firebase';
import { 
  onAuthStateChanged, 
  signOut 
} from 'firebase/auth';
import { 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy,
  where
} from 'firebase/firestore';
import { 
  Product, 
  Customer, 
  Supplier, 
  Invoice, 
  PurchaseBill, 
  JobCard, 
  NotificationItem, 
  UserProfile, 
  UserRole 
} from './types';

// Import Modular Subcomponents
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import Customers from './components/Customers';
import Suppliers from './components/Suppliers';
import Sales from './components/Sales';
import Purchases from './components/Purchases';
import ServiceCenter from './components/ServiceCenter';
import Reports from './components/Reports';
import AiAssistant from './components/AiAssistant';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // Localization and Theming
  const [lang, setLang] = useState<'en' | 'hi'>('en');

  // ERP Central Database states
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [purchases, setPurchases] = useState<PurchaseBill[]>([]);
  const [jobCards, setJobCards] = useState<JobCard[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Current Screen / Tab
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Mobile navigation drawer toggle
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Profile popup state
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // 1. Authenticate Listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        // Default evaluation profile
        setProfile({
          uid: u.uid,
          email: u.email || 'operator@happyautoerp.com',
          name: u.displayName || 'Workshop Admin',
          role: 'Shop Owner',
          shopName: 'Happy Auto Spares & Service Bay',
          createdAt: new Date().toISOString()
        });
        
        // Seed Firestore if it is a fresh evaluation database!
        await seedInitialDataIfEmpty();
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoadingAuth(false);
    });
    return unsub;
  }, []);

  // 2. Real-time Database Sync from Firestore
  useEffect(() => {
    if (!user) return;

    // Listen to Products
    const unsubProducts = onSnapshot(collections.products, (snap) => {
      const items = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      setProducts(items);
    });

    // Listen to Customers
    const unsubCustomers = onSnapshot(collections.customers, (snap) => {
      const items = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Customer));
      setCustomers(items);
    });

    // Listen to Suppliers
    const unsubSuppliers = onSnapshot(collections.suppliers, (snap) => {
      const items = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Supplier));
      setSuppliers(items);
    });

    // Listen to Invoices
    const unsubInvoices = onSnapshot(collections.invoices, (snap) => {
      const items = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Invoice));
      setInvoices(items);
    });

    // Listen to Purchase Bills
    const unsubPurchases = onSnapshot(collections.purchases, (snap) => {
      const items = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as PurchaseBill));
      setPurchases(items);
    });

    // Listen to Job Cards
    const unsubJobCards = onSnapshot(collections.jobCards, (snap) => {
      const items = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as JobCard));
      setJobCards(items);
    });

    // Listen to Notifications
    const unsubNotifications = onSnapshot(collections.notifications, (snap) => {
      const items = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as NotificationItem));
      setNotifications(items);
    });

    return () => {
      unsubProducts();
      unsubCustomers();
      unsubSuppliers();
      unsubInvoices();
      unsubPurchases();
      unsubJobCards();
      unsubNotifications();
    };
  }, [user]);

  // --- Auth Handlers ---
  const handleLogin = async (email: string, pass: string) => {
    // Standard simulation/firebase bypass
    setUser({ uid: 'demo-operator-123', email });
    setProfile({
      uid: 'demo-operator-123',
      email,
      name: email.split('@')[0],
      role: 'Shop Owner',
      shopName: 'Happy Auto Spares & Service Bay',
      createdAt: new Date().toISOString()
    });
    await seedInitialDataIfEmpty();
  };

  const handleRegister = async (email: string, pass: string, name: string, shopName: string, role: UserRole) => {
    setUser({ uid: 'demo-operator-123', email });
    setProfile({
      uid: 'demo-operator-123',
      email,
      name,
      role,
      shopName,
      createdAt: new Date().toISOString()
    });
    await seedInitialDataIfEmpty();
  };

  const handleDemoLogin = async (role: UserRole) => {
    setUser({ uid: `demo-${role.toLowerCase()}`, email: `${role.toLowerCase()}@happyautoerp.com` });
    setProfile({
      uid: `demo-${role.toLowerCase()}`,
      email: `${role.toLowerCase()}@happyautoerp.com`,
      name: `Demo ${role}`,
      role,
      shopName: 'Happy Auto Spares & Service Bay',
      createdAt: new Date().toISOString()
    });
    await seedInitialDataIfEmpty();
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setUser(null);
    setProfile(null);
  };

  // --- Firestore / ERP Database Mutation Operations ---

  // Products CRUD
  const handleAddProduct = async (prodPayload: Omit<Product, 'id'>) => {
    try {
      await addDoc(collections.products, prodPayload);
    } catch (err) {
      console.error("Failed to add product: ", err);
    }
  };

  const handleEditProduct = async (id: string, prodPayload: Partial<Product>) => {
    try {
      await updateDoc(doc(db, 'products', id), prodPayload);
    } catch (err) {
      console.error("Failed to update product: ", err);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (err) {
      console.error("Failed to delete product: ", err);
    }
  };

  // Customers CRUD
  const handleAddCustomer = async (custPayload: Omit<Customer, 'id' | 'createdAt'>) => {
    try {
      await addDoc(collections.customers, {
        ...custPayload,
        createdAt: new Date().toISOString()
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditCustomer = async (id: string, custPayload: Partial<Customer>) => {
    try {
      await updateDoc(doc(db, 'customers', id), custPayload);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'customers', id));
    } catch (err) {
      console.error(err);
    }
  };

  // Suppliers CRUD
  const handleAddSupplier = async (supPayload: Omit<Supplier, 'id' | 'createdAt'>) => {
    try {
      await addDoc(collections.suppliers, {
        ...supPayload,
        createdAt: new Date().toISOString()
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditSupplier = async (id: string, supPayload: Partial<Supplier>) => {
    try {
      await updateDoc(doc(db, 'suppliers', id), supPayload);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSupplier = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'suppliers', id));
    } catch (err) {
      console.error(err);
    }
  };

  // Invoices (POS Sales Checkout) + Instant Stock Decrements!
  const handleAddInvoice = async (invPayload: Omit<Invoice, 'id' | 'invoiceNumber' | 'createdAt'>) => {
    const invNo = `INV-2026-${Math.floor(Math.random() * 90000 + 10000)}`;
    const invoiceRecord = {
      ...invPayload,
      invoiceNumber: invNo,
      createdAt: new Date().toISOString()
    };

    // 1. Save the invoice
    const docRef = await addDoc(collections.invoices, invoiceRecord);
    
    // 2. Decrement inventory stock counts in Firestore
    for (const item of invPayload.items) {
      const prod = products.find(p => p.id === item.productId);
      if (prod) {
        const remainingStock = Math.max(0, prod.stockQuantity - item.quantity);
        await updateDoc(doc(db, 'products', prod.id), { stockQuantity: remainingStock });

        // Trigger auto low stock warning notifications if applicable
        if (remainingStock <= prod.lowStockWarning) {
          await addDoc(collections.notifications, {
            title: "Urgent Low Stock Warning",
            message: `${prod.name} (${prod.partNumber}) has dropped to ${remainingStock} left in stock.`,
            type: "low_stock",
            read: false,
            createdAt: new Date().toISOString()
          });
        }
      }
    }

    return { id: docRef.id, ...invoiceRecord };
  };

  // Purchase Bill Entry + Instant Stock Increments & Vendor Payable Updates!
  const handleAddPurchaseBill = async (billPayload: Omit<PurchaseBill, 'id' | 'createdAt'>) => {
    const billRecord = {
      ...billPayload,
      createdAt: new Date().toISOString()
    };

    // 1. Create Purchase Bill
    await addDoc(collections.purchases, billRecord);

    // 2. Increment stock counts
    for (const item of billPayload.items) {
      const prod = products.find(p => p.id === item.productId);
      if (prod) {
        await updateDoc(doc(db, 'products', prod.id), {
          stockQuantity: prod.stockQuantity + item.quantity
        });
      }
    }

    // 3. Update Supplier Pending Payable balance
    const supplier = suppliers.find(s => s.id === billPayload.supplierId);
    if (supplier) {
      await updateDoc(doc(db, 'suppliers', supplier.id), {
        pendingPayment: (supplier.pendingPayment || 0) + billPayload.grandTotal
      });
    }
  };

  // Job Cards CRUD
  const handleAddJobCard = async (jcPayload: Omit<JobCard, 'id' | 'jobCardNumber' | 'createdAt' | 'updatedAt'>) => {
    const jcNo = `JC-2026-${Math.floor(Math.random() * 90000 + 10000)}`;
    try {
      await addDoc(collections.jobCards, {
        ...jcPayload,
        jobCardNumber: jcNo,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditJobCard = async (id: string, jcPayload: Partial<JobCard>) => {
    try {
      await updateDoc(doc(db, 'jobCards', id), {
        ...jcPayload,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteJobCard = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'jobCards', id));
    } catch (err) {
      console.error(err);
    }
  };

  // Mark notification read
  const handleMarkNotificationRead = async (id: string) => {
    try {
      await updateDoc(doc(db, 'notifications', id), { read: true });
    } catch (err) {
      console.error(err);
    }
  };

  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center text-white space-y-4">
        <Store className="w-12 h-12 text-emerald-500 animate-bounce" />
        <p className="text-sm font-bold tracking-widest text-slate-400">HAPPY AUTO ERP SECURING DATABASE SHARDS...</p>
      </div>
    );
  }

  // Not logged in -> Auth Screen
  if (!user || !profile) {
    return (
      <Login 
        onLogin={handleLogin} 
        onRegister={handleRegister} 
        onDemoLogin={handleDemoLogin} 
        lang={lang} 
      />
    );
  }

  // Multi-lingual navigation translations
  const navItems = [
    { id: 'dashboard', label: lang === 'en' ? 'Dashboard' : 'डैशबोर्ड', icon: LayoutDashboard },
    { id: 'inventory', label: lang === 'en' ? 'Spares Catalog' : 'स्पेयर सूची', icon: Package },
    { id: 'sales', label: lang === 'en' ? 'POS Billing' : 'पीओएस बिलिंग', icon: ShoppingBag },
    { id: 'purchases', label: lang === 'en' ? 'Inward Sourcing' : 'स्टॉक आवक', icon: PlusCircle },
    { id: 'service', label: lang === 'en' ? 'Service Bay' : 'सर्विस सेंटर', icon: Wrench },
    { id: 'customers', label: lang === 'en' ? 'Customers' : 'ग्राहक', icon: Users },
    { id: 'suppliers', label: lang === 'en' ? 'Suppliers' : 'विक्रेता', icon: Truck },
    { id: 'reports', label: lang === 'en' ? 'Audit Reports' : 'ऑडिट रिपोर्ट्स', icon: FileText }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-800">
      
      {/* 1. Sidebar Navigation (Desktop only) */}
      <aside className="hidden md:flex md:w-64 bg-slate-900 text-white flex-col justify-between shrink-0 p-5 border-r border-slate-800">
        <div className="space-y-6">
          
          {/* Logo / Brand */}
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-600 rounded-xl">
              <Store className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-extrabold text-base tracking-tight text-white leading-none">Happy Auto</h1>
              <span className="text-[10px] text-emerald-400 font-bold font-mono uppercase tracking-wider">AI ERP PRO</span>
            </div>
          </div>

          {/* Shop display */}
          <div className="p-3 bg-slate-850 rounded-xl border border-slate-800 text-left">
            <span className="text-[9px] text-slate-500 block font-bold uppercase">Store Terminal</span>
            <span className="text-xs font-bold text-slate-200 block truncate">{profile.shopName}</span>
          </div>

          {/* Menu Link Blocks */}
          <nav className="space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              return (
                <button
                  id={`nav-item-${item.id}`}
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                    activeTab === item.id ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-4.5 h-4.5 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Account Profile settings */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 max-w-[150px]">
            <div className="w-8 h-8 bg-slate-800 text-slate-300 rounded-full flex items-center justify-center font-bold">
              {profile.name.charAt(0).toUpperCase()}
            </div>
            <div className="truncate">
              <p className="font-bold text-slate-200 truncate">{profile.name}</p>
              <p className="text-[9px] text-indigo-400 font-bold">{profile.role}</p>
            </div>
          </div>
          <button 
            id="sidebar-signout"
            onClick={handleSignOut} 
            title="Access Terminal Logout" 
            className="p-1 text-slate-500 hover:text-rose-400 rounded-lg cursor-pointer transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* 2. Top Header / Applet Control bar */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 px-5 py-3.5 flex justify-between items-center z-10 shrink-0">
          
          {/* Mobile Menu Trigger & Logo */}
          <div className="flex items-center gap-3">
            <button
              id="mobile-menu-trigger"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-1.5 hover:bg-slate-100 rounded-lg cursor-pointer text-slate-750"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            
            <div className="flex md:hidden items-center gap-2">
              <Store className="w-5 h-5 text-emerald-600" />
              <span className="font-black text-sm text-slate-900 tracking-tight">Happy Auto</span>
            </div>

            {/* Current screen banner (Desktop) */}
            <span className="hidden md:inline-block font-bold text-xs text-slate-400 uppercase tracking-widest bg-slate-100 px-2.5 py-1 rounded-md">
              {navItems.find(item => item.id === activeTab)?.label}
            </span>
          </div>

          {/* Quick Header Toggles: Language, Notifications, Logout */}
          <div className="flex items-center gap-3">
            
            {/* Lang switcher */}
            <button
              id="lang-toggle-btn"
              onClick={() => setLang(prev => prev === 'en' ? 'hi' : 'en')}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer flex items-center gap-1 transition-all"
              title="Change ERP Language"
            >
              <Globe className="w-3.5 h-3.5 text-indigo-600" />
              <span>{lang === 'en' ? 'Hindi' : 'English'}</span>
            </button>

            {/* Quick stats indicator: Notification Bell */}
            <div className="relative">
              <button 
                id="header-notif-bell"
                onClick={() => setActiveTab('dashboard')} // redirects to dashboard where notifs are visible
                className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-900 rounded-lg cursor-pointer relative"
              >
                <Bell className="w-5 h-5" />
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full" />
                )}
              </button>
            </div>

            {/* Profile Dropdown trigger */}
            <div className="relative">
              <button
                id="header-profile-btn"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="w-8.5 h-8.5 bg-indigo-50 text-indigo-800 hover:bg-indigo-100 rounded-xl flex items-center justify-center font-bold text-xs cursor-pointer transition-colors"
              >
                {profile.name.charAt(0).toUpperCase()}
              </button>

              {/* Popup Menu */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 z-30 text-slate-800 animate-fade-in text-xs">
                  <div className="pb-2 border-b border-slate-100">
                    <p className="font-bold text-slate-800 text-sm">{profile.name}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{profile.email}</p>
                  </div>
                  <div className="py-2 space-y-1.5">
                    <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">ERP Role Permissions</p>
                    <div className="bg-indigo-50/70 text-indigo-900 p-2 rounded-xl">
                      <p className="font-bold">{profile.role}</p>
                      <p className="text-[9px] text-slate-500 leading-relaxed mt-0.5">
                        {profile.role === 'Staff' ? 'Read-only access across invoices, job sheets, and catalog spares.' : 'Full administrative and checkout settlement privileges.'}
                      </p>
                    </div>
                  </div>
                  <button
                    id="header-profile-logout"
                    onClick={handleSignOut}
                    className="w-full bg-slate-900 hover:bg-rose-600 text-white font-bold py-2 rounded-xl text-center cursor-pointer transition-colors mt-2"
                  >
                    Logout ERP System
                  </button>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* 3. Mobile Navigation Menu drawer (Mobile Only) */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-slate-950 text-white border-b border-slate-800 px-5 py-4 space-y-3 z-20">
            <nav className="grid grid-cols-2 gap-2 text-xs">
              {navItems.map(item => {
                const Icon = item.icon;
                return (
                  <button
                    id={`mobile-nav-${item.id}`}
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl font-bold cursor-pointer ${
                      activeTab === item.id ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
            <div className="pt-3 border-t border-slate-850 flex justify-between items-center text-[10px] text-slate-400">
              <span>{profile.shopName}</span>
              <button onClick={handleSignOut} className="text-rose-400 font-bold hover:underline">Logout</button>
            </div>
          </div>
        )}

        {/* 4. Active Component Routing Viewport */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 md:pb-6 max-w-7xl mx-auto w-full">
          
          {activeTab === 'dashboard' && (
            <Dashboard 
              products={products}
              customers={customers}
              suppliers={suppliers}
              invoices={invoices}
              jobCards={jobCards}
              notifications={notifications}
              lang={lang}
              onNavigate={(tab) => {
                setActiveTab(tab);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onMarkNotificationRead={handleMarkNotificationRead}
            />
          )}

          {activeTab === 'inventory' && (
            <Inventory 
              products={products}
              onAddProduct={handleAddProduct}
              onEditProduct={handleEditProduct}
              onDeleteProduct={handleDeleteProduct}
              lang={lang}
            />
          )}

          {activeTab === 'customers' && (
            <Customers 
              customers={customers}
              onAddCustomer={handleAddCustomer}
              onEditCustomer={handleEditCustomer}
              onDeleteCustomer={handleDeleteCustomer}
              lang={lang}
            />
          )}

          {activeTab === 'suppliers' && (
            <Suppliers 
              suppliers={suppliers}
              onAddSupplier={handleAddSupplier}
              onEditSupplier={handleEditSupplier}
              onDeleteSupplier={handleDeleteSupplier}
              lang={lang}
            />
          )}

          {activeTab === 'sales' && (
            <Sales 
              products={products}
              customers={customers}
              onAddInvoice={handleAddInvoice}
              onAddCustomer={handleAddCustomer}
              lang={lang}
            />
          )}

          {activeTab === 'purchases' && (
            <Purchases 
              products={products}
              suppliers={suppliers}
              onAddPurchaseBill={handleAddPurchaseBill}
              lang={lang}
            />
          )}

          {activeTab === 'service' && (
            <ServiceCenter 
              jobCards={jobCards}
              customers={customers}
              onAddJobCard={handleAddJobCard}
              onEditJobCard={handleEditJobCard}
              onDeleteJobCard={handleDeleteJobCard}
              lang={lang}
            />
          )}

          {activeTab === 'reports' && (
            <Reports 
              products={products}
              customers={customers}
              invoices={invoices}
              purchases={purchases}
              lang={lang}
            />
          )}

        </main>

        {/* 5. Mobile Tab Bar (sticky at bottom for easy android-feel navigation) */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 text-white border-t border-slate-850 px-4 py-2.5 flex justify-between items-center z-30">
          {navItems.slice(0, 5).map(item => {
            const Icon = item.icon;
            return (
              <button
                id={`mobile-tabbar-${item.id}`}
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center cursor-pointer ${
                  activeTab === item.id ? 'text-indigo-400' : 'text-slate-400'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[9px] mt-1 font-bold">{item.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* 6. AI Interactive Assistant Slider drawer */}
        <AiAssistant 
          products={products}
          jobCards={jobCards}
          salesData={{
            todaySales: invoices
              .filter(inv => inv.createdAt.startsWith(new Date().toISOString().split('T')[0]) && inv.status !== 'Returned')
              .reduce((sum, inv) => sum + inv.grandTotal, 0),
            monthlySales: invoices
              .filter(inv => inv.status !== 'Returned')
              .reduce((sum, inv) => sum + inv.grandTotal, 0)
          }}
          activeRole={profile.role}
          lang={lang}
        />

      </div>

    </div>
  );
}
