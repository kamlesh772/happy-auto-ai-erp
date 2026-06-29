import React from 'react';
import { 
  TrendingUp, 
  Package, 
  Users, 
  Truck, 
  Wrench, 
  AlertCircle, 
  DollarSign, 
  ArrowUpRight, 
  Bell, 
  ShoppingBag,
  IndianRupee
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Product, Customer, Supplier, Invoice, JobCard, NotificationItem } from '../types';

interface DashboardProps {
  products: Product[];
  customers: Customer[];
  suppliers: Supplier[];
  invoices: Invoice[];
  jobCards: JobCard[];
  notifications: NotificationItem[];
  lang: 'en' | 'hi';
  onNavigate: (tab: string) => void;
  onMarkNotificationRead: (id: string) => void;
}

export default function Dashboard({ 
  products, 
  customers, 
  suppliers, 
  invoices, 
  jobCards, 
  notifications, 
  lang,
  onNavigate,
  onMarkNotificationRead
}: DashboardProps) {

  // Multi-lingual translations
  const t = {
    en: {
      todaySales: "Today's Sales",
      monthlySales: "Monthly Sales",
      monthlyProfit: "Monthly Profit",
      totalInventory: "Total Inventory Value",
      lowStockAlerts: "Low Stock Items",
      customers: "Total Customers",
      suppliers: "Suppliers",
      openJobs: "Active Jobs",
      salesOverview: "Sales Overview (Last 30 Days)",
      paymentMethods: "Payment Methods Share",
      lowStockAlertTitle: "Urgent Stock Alerts",
      recentActivity: "Recent Activity",
      activeJobsList: "Active Service Jobs",
      quickActions: "Quick Actions",
      newSale: "New Sale POS",
      newJobCard: "Create Job Card",
      addProduct: "Add New Part",
      noActivity: "No recent activity to show",
      viewAll: "View All",
      currency: "₹"
    },
    hi: {
      todaySales: "आज की बिक्री",
      monthlySales: "मासिक बिक्री",
      monthlyProfit: "मासिक लाभ",
      totalInventory: "कुल स्टॉक मूल्य",
      lowStockAlerts: "कम स्टॉक सामान",
      customers: "कुल ग्राहक",
      suppliers: "आपूर्तिकर्ता",
      openJobs: "सक्रिय काम",
      salesOverview: "बिक्री अवलोकन (पिछले 30 दिन)",
      paymentMethods: "भुगतान विधि शेयर",
      lowStockAlertTitle: "तत्काल स्टॉक अलर्ट",
      recentActivity: "हाल की गतिविधि",
      activeJobsList: "सक्रिय सर्विस काम",
      quickActions: "त्वरित कार्रवाई",
      newSale: "नया सेल (POS)",
      newJobCard: "जॉब कार्ड बनाएं",
      addProduct: "नया पार्ट जोड़ें",
      noActivity: "दिखाने के लिए कोई हालिया गतिविधि नहीं है",
      viewAll: "सभी देखें",
      currency: "₹"
    }
  }[lang];

  // Calculation Logic
  const today = new Date().toISOString().split('T')[0];
  const todaySales = invoices
    .filter(inv => inv.createdAt.startsWith(today) && inv.status !== 'Returned')
    .reduce((sum, inv) => sum + inv.grandTotal, 0);

  const monthlySales = invoices
    .filter(inv => inv.status !== 'Returned') // simplification for the month
    .reduce((sum, inv) => sum + inv.grandTotal, 0);

  // Profit calculation (sellingPrice - purchasePrice) on item level
  const monthlyProfit = invoices
    .filter(inv => inv.status !== 'Returned')
    .reduce((totalProfit, inv) => {
      const invoiceProfit = inv.items.reduce((itemProfit, item) => {
        const prod = products.find(p => p.id === item.productId);
        const costPrice = prod ? prod.purchasePrice : item.sellingPrice * 0.6; // fallback 40% margin
        return itemProfit + ((item.sellingPrice - costPrice) * item.quantity);
      }, 0);
      return totalProfit + invoiceProfit - inv.discount;
    }, 0);

  const totalInventoryValue = products.reduce((sum, p) => sum + (p.purchasePrice * p.stockQuantity), 0);
  const lowStockItems = products.filter(p => p.stockQuantity <= p.lowStockWarning);
  
  // Chart Data preparation
  const salesChartData = [
    { name: 'Week 1', sales: Math.round(monthlySales * 0.2) },
    { name: 'Week 2', sales: Math.round(monthlySales * 0.35) },
    { name: 'Week 3', sales: Math.round(monthlySales * 0.25) },
    { name: 'Week 4', sales: Math.round(monthlySales * 0.2) + todaySales }
  ];

  // Payment Methods chart
  const paymentMethodsCounts: { [key: string]: number } = { Cash: 0, Card: 0, UPI: 0, Credit: 0 };
  invoices.forEach(inv => {
    if (paymentMethodsCounts[inv.paymentMethod] !== undefined) {
      paymentMethodsCounts[inv.paymentMethod] += inv.grandTotal;
    }
  });

  const pieData = Object.keys(paymentMethodsCounts).map(key => ({
    name: key,
    value: paymentMethodsCounts[key] || 1
  }));

  const COLORS = ['#059669', '#3b82f6', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-6">
      
      {/* Upper Welcomer/Stats Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            {lang === 'en' ? "Welcome back, Operator" : "आपका स्वागत है, ऑपरेटर"} 👋
          </h2>
          <p className="text-sm text-indigo-200 mt-1">
            {lang === 'en' ? "Your workshop, parts inventory & billing is synced in real-time." : "आपका वर्कशॉप, पार्ट्स स्टॉक और बिलिंग रीयल-टाइम में सिंक है।"}
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            id="dash-quick-pos"
            onClick={() => onNavigate('sales')}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-4 py-2 rounded-xl text-sm flex items-center gap-2 cursor-pointer shadow-md transition-all duration-200 hover:-translate-y-0.5"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{t.newSale}</span>
          </button>
          <button 
            id="dash-quick-job"
            onClick={() => onNavigate('service')}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2 rounded-xl text-sm flex items-center gap-2 cursor-pointer shadow-md transition-all duration-200 hover:-translate-y-0.5"
          >
            <Wrench className="w-4 h-4" />
            <span>{t.newJobCard}</span>
          </button>
        </div>
      </div>

      {/* Numerical Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Today's Sales */}
        <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200 hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t.todaySales}</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-xl md:text-2xl font-bold text-slate-800 flex items-center">
              {t.currency} {todaySales.toLocaleString('en-IN')}
            </h3>
            <p className="text-[10px] text-emerald-600 font-medium mt-1">Ready for GST Invoice</p>
          </div>
        </div>

        {/* Monthly Sales */}
        <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200 hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t.monthlySales}</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-xl md:text-2xl font-bold text-slate-800 flex items-center">
              {t.currency} {monthlySales.toLocaleString('en-IN')}
            </h3>
            <p className="text-[10px] text-blue-600 font-medium mt-1">Current Billing cycle</p>
          </div>
        </div>

        {/* Monthly Profit */}
        <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200 hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t.monthlyProfit}</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-xl md:text-2xl font-bold text-slate-800 flex items-center">
              {t.currency} {monthlyProfit.toLocaleString('en-IN')}
            </h3>
            <p className="text-[10px] text-indigo-600 font-medium mt-1">Net profit after discounts</p>
          </div>
        </div>

        {/* Inventory Value */}
        <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200 hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t.totalInventory}</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-xl md:text-2xl font-bold text-slate-800 flex items-center">
              {t.currency} {totalInventoryValue.toLocaleString('en-IN')}
            </h3>
            <p className="text-[10px] text-amber-600 font-medium mt-1">{products.length} Parts cataloged</p>
          </div>
        </div>

      </div>

      {/* Multi-role Operational Counts & Active low stock alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Quick Summary Counts Cards */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
          <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">Operations Center</h4>
          
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-indigo-50 transition-colors cursor-pointer" onClick={() => onNavigate('customers')}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">{customers.length} {t.customers}</p>
                <p className="text-xs text-slate-500">With registered vehicles</p>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400" />
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-emerald-50 transition-colors cursor-pointer" onClick={() => onNavigate('suppliers')}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">{suppliers.length} {t.suppliers}</p>
                <p className="text-xs text-slate-500">Parts & Lubes vendors</p>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400" />
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-cyan-50 transition-colors cursor-pointer" onClick={() => onNavigate('service')}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-100 text-cyan-700 rounded-lg">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">{jobCards.filter(jc => jc.status !== 'Delivered').length} {t.openJobs}</p>
                <p className="text-xs text-slate-500">Currently in active repair</p>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400" />
          </div>
        </div>

        {/* Low stock indicators */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">{t.lowStockAlertTitle}</h4>
            <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
              {lowStockItems.length} Warnings
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 max-h-52 pr-1">
            {lowStockItems.length === 0 ? (
              <div className="text-center text-slate-400 py-10 text-xs">
                All spares and lubricants are well-stocked!
              </div>
            ) : (
              lowStockItems.map(item => (
                <div key={item.id} className="p-2.5 bg-rose-50 border border-rose-100 rounded-xl flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-slate-800">{item.name}</p>
                    <p className="text-slate-500 text-[10px] mt-0.5">{item.brand} • {item.vehicleModel}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-extrabold text-rose-700">{item.stockQuantity} Left</p>
                    <p className="text-[9px] text-slate-400 mt-0.5">Min level: {item.lowStockWarning}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Notifications list / Actionable Alerts */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col">
          <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Bell className="w-4 h-4 text-amber-500 animate-pulse" />
            Pending Alerts & Reminders
          </h4>
          <div className="flex-1 overflow-y-auto space-y-2.5 max-h-52 pr-1">
            {notifications.length === 0 ? (
              <div className="text-center text-slate-400 py-10 text-xs">
                No active notifications.
              </div>
            ) : (
              notifications.map(notif => (
                <div 
                  key={notif.id} 
                  className={`p-2.5 rounded-xl border flex gap-2 justify-between items-start text-xs transition-all ${
                    notif.read ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-amber-50/70 border-amber-100'
                  }`}
                >
                  <div className="space-y-0.5">
                    <p className="font-bold text-slate-800 flex items-center gap-1">
                      <AlertCircle className={`w-3.5 h-3.5 ${notif.read ? 'text-slate-400' : 'text-amber-500'}`} />
                      {notif.title}
                    </p>
                    <p className="text-slate-500 leading-relaxed text-[10px]">{notif.message}</p>
                  </div>
                  {!notif.read && (
                    <button 
                      id={`notif-${notif.id}`}
                      onClick={() => onMarkNotificationRead(notif.id)}
                      className="text-[10px] text-indigo-600 hover:underline cursor-pointer font-semibold shrink-0"
                    >
                      Clear
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Sales trend */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200">
          <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">{t.salesOverview}</h4>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesChartData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip />
                <Area type="monotone" dataKey="sales" stroke="#059669" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Shares */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col justify-between">
          <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">{t.paymentMethods}</h4>
          <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-6">
            <div className="h-44 w-44 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="space-y-2 w-full max-w-[200px]">
              {pieData.map((d, index) => (
                <div key={d.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-xs" style={{ backgroundColor: COLORS[index] }} />
                    <span className="text-slate-600 font-medium">{d.name}</span>
                  </div>
                  <span className="font-bold text-slate-800">{t.currency} {d.value.toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Active Service Bay List */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200">
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">{t.activeJobsList}</h4>
          <button 
            id="dash-view-jobs"
            onClick={() => onNavigate('service')}
            className="text-xs text-indigo-600 hover:underline font-bold cursor-pointer"
          >
            {t.viewAll} →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 uppercase tracking-wider text-[10px] text-slate-500">
              <tr>
                <th className="p-3">Job Card No.</th>
                <th className="p-3">Customer / Plate</th>
                <th className="p-3">Assigned Mechanic</th>
                <th className="p-3">Complaints</th>
                <th className="p-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {jobCards.filter(jc => jc.status !== 'Delivered').slice(0, 4).map(jc => (
                <tr key={jc.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 font-bold text-indigo-600">{jc.jobCardNumber}</td>
                  <td className="p-3">
                    <p className="font-bold text-slate-800">{jc.customerName}</p>
                    <p className="text-[10px] text-slate-400">{jc.vehicleModel} ({jc.vehiclePlate})</p>
                  </td>
                  <td className="p-3 font-medium text-slate-700">{jc.assignedMechanic || "Not Assigned"}</td>
                  <td className="p-3 max-w-[200px] truncate">{jc.complaints.join(', ')}</td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                      jc.status === 'Ready' ? 'bg-emerald-100 text-emerald-800' :
                      jc.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-slate-100 text-slate-800'
                    }`}>
                      {jc.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
