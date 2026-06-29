import React, { useState } from 'react';
import { 
  Plus, 
  Minus, 
  Trash2, 
  Search, 
  ShoppingCart, 
  User, 
  CreditCard, 
  Percent, 
  CheckCircle, 
  Printer, 
  X, 
  FileText,
  UserPlus
} from 'lucide-react';
import { Product, Customer, Invoice, InvoiceItem } from '../types';

interface SalesProps {
  products: Product[];
  customers: Customer[];
  onAddInvoice: (invoice: Omit<Invoice, 'id' | 'invoiceNumber' | 'createdAt'>) => Promise<Invoice>;
  onAddCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => Promise<void>;
  lang: 'en' | 'hi';
}

export default function Sales({ products, customers, onAddInvoice, onAddCustomer, lang }: SalesProps) {
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Checkout Parameters
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Card' | 'UPI' | 'Credit'>('Cash');
  
  // GST Invoice Modal View
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null);

  // Quick register customer inside billing
  const [isQuickCustOpen, setIsQuickCustOpen] = useState(false);
  const [quickCustName, setQuickCustName] = useState('');
  const [quickCustPhone, setQuickCustPhone] = useState('');

  const availableProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.partNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.barcode.includes(searchTerm)
  );

  const handleAddToCart = (product: Product) => {
    if (product.stockQuantity <= 0) {
      alert("Product is out of stock!");
      return;
    }
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stockQuantity) {
          alert(`Only ${product.stockQuantity} items available in inventory!`);
          return prev;
        }
        return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleUpdateQty = (productId: string, val: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        const newQty = item.quantity + val;
        if (newQty <= 0) return null;
        if (newQty > item.product.stockQuantity) {
          alert(`Only ${item.product.stockQuantity} items in stock.`);
          return item;
        }
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(Boolean) as { product: Product; quantity: number }[]);
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  // Calculation parameters
  const totalBeforeGst = cart.reduce((sum, item) => {
    const singlePreGst = item.product.sellingPrice / (1 + (item.product.gstPercent / 100));
    return sum + (singlePreGst * item.quantity);
  }, 0);

  const totalGst = cart.reduce((sum, item) => {
    const singlePreGst = item.product.sellingPrice / (1 + (item.product.gstPercent / 100));
    const singleGstAmt = item.product.sellingPrice - singlePreGst;
    return sum + (singleGstAmt * item.quantity);
  }, 0);

  const subtotal = cart.reduce((sum, item) => sum + (item.product.sellingPrice * item.quantity), 0);
  const grandTotal = Math.max(0, subtotal - discount);

  const handleQuickCustomerSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickCustName || !quickCustPhone) return;
    await onAddCustomer({
      name: quickCustName,
      phone: quickCustPhone,
      creditBalance: 0,
      vehicles: []
    });
    setQuickCustName('');
    setQuickCustPhone('');
    setIsQuickCustOpen(false);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    
    const customer = customers.find(c => c.id === selectedCustomerId);
    const customerName = customer ? customer.name : "Walk-in Customer";
    const customerPhone = customer ? customer.phone : "N/A";

    const invoiceItems: InvoiceItem[] = cart.map(item => {
      const singlePreGst = item.product.sellingPrice / (1 + (item.product.gstPercent / 100));
      const singleGstAmt = item.product.sellingPrice - singlePreGst;
      return {
        productId: item.product.id,
        name: item.product.name,
        partNumber: item.product.partNumber,
        quantity: item.quantity,
        sellingPrice: item.product.sellingPrice,
        gstPercent: item.product.gstPercent,
        gstAmount: Math.round(singleGstAmt * item.quantity * 100) / 100,
        subtotal: item.product.sellingPrice * item.quantity
      };
    });

    try {
      const invoiceData = {
        customerId: selectedCustomerId || 'walk-in',
        customerName,
        customerPhone,
        items: invoiceItems,
        totalBeforeGst: Math.round(totalBeforeGst * 100) / 100,
        totalGst: Math.round(totalGst * 100) / 100,
        discount,
        grandTotal: Math.round(grandTotal * 100) / 100,
        paymentMethod,
        status: 'Paid' as const
      };

      const finalInvoice = await onAddInvoice(invoiceData);
      setCurrentInvoice(finalInvoice);
      setCart([]);
      setDiscount(0);
      setSelectedCustomerId('');
    } catch (err) {
      console.error(err);
      alert("Checkout failed. Check stock levels or database connectivity.");
    }
  };

  const t = {
    en: {
      title: "POS Billing Terminal",
      searchPlaceholder: "Scan barcode or search spare parts...",
      selectCust: "Select Customer profile",
      walkIn: "Walk-in Retail Customer",
      addCustBtn: "Register New Customer",
      cartTitle: "Sales Draft Bill",
      emptyCart: "Cart is empty. Select items from catalog.",
      subtotal: "Gross Bill Total",
      gst: "Calculated Tax GST",
      discount: "Promo Discount (₹)",
      total: "Grand Total (Net)",
      payMethod: "Payment Method",
      checkoutBtn: "Complete GST Sale",
      printInvoice: "Print Invoice",
      invoiceTitle: "Tax Invoice / Delivery Challan"
    },
    hi: {
      title: "पीओएस बिलिंग टर्मिनल",
      searchPlaceholder: "बारकोड स्कैन करें या पार्ट्स खोजें...",
      selectCust: "ग्राहक प्रोफ़ाइल चुनें",
      walkIn: "सामान्य खुदरा ग्राहक",
      addCustBtn: "नया ग्राहक पंजीकृत करें",
      cartTitle: "विक्रय ड्राफ्ट बिल",
      emptyCart: "कार्ट खाली है। सूची से पार्ट्स चुनें।",
      subtotal: "सकल बिल राशि",
      gst: "परिकलित जीएसटी टैक्स",
      discount: "डिस्काउंट छूट (₹)",
      total: "कुल देय राशि (Net)",
      payMethod: "भुगतान विधि",
      checkoutBtn: "जीएसटी बिक्री पूर्ण करें",
      printInvoice: "बिल प्रिंट करें",
      invoiceTitle: "टैक्स इनवॉइस / बिल"
    }
  }[lang];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">{t.title}</h2>
        <p className="text-sm text-slate-500">Fast automotive checkout, instant inventory deduction & GST invoicing.</p>
      </div>

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Product catalog picking */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200">
            <div className="relative">
              <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input
                id="pos-search-input"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full bg-slate-50 text-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm border border-slate-200 focus:outline-hidden focus:border-slate-800 focus:bg-white transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-1">
            {availableProducts.map(p => (
              <div 
                key={p.id} 
                onClick={() => handleAddToCart(p)}
                className={`bg-white border p-3.5 rounded-2xl cursor-pointer hover:border-indigo-600 hover:shadow-xs transition-all flex flex-col justify-between ${
                  p.stockQuantity <= 0 ? 'opacity-50 border-slate-200 bg-slate-100 cursor-not-allowed' : 'border-slate-200'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <span className="font-bold text-slate-800 text-sm line-clamp-1">{p.name}</span>
                    <span className="bg-slate-100 text-slate-600 font-mono text-[9px] px-1.5 py-0.5 rounded-sm shrink-0">{p.partNumber}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">{p.vehicleModel} • {p.brand}</p>
                </div>

                <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-slate-100">
                  <span className="font-extrabold text-indigo-700 text-sm">₹ {p.sellingPrice}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    p.stockQuantity <= p.lowStockWarning ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {p.stockQuantity <= 0 ? 'Out of Stock' : `${p.stockQuantity} Left`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Sales Cart and Checkouts */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between shadow-xs">
          <div className="space-y-4">
            
            {/* Header bar */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-indigo-600" />
                {t.cartTitle}
              </h3>
              <span className="bg-slate-900 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
                {cart.reduce((sum, item) => sum + item.quantity, 0)} Items
              </span>
            </div>

            {/* Customer profiling select */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <div className="flex-1">
                  <select
                    id="pos-cust-select"
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    className="w-full bg-slate-50 text-slate-800 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-indigo-600 cursor-pointer"
                  >
                    <option value="">{t.walkIn}</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name} (+91 {c.phone})</option>
                    ))}
                  </select>
                </div>
                <button
                  id="pos-quick-cust-btn"
                  onClick={() => setIsQuickCustOpen(true)}
                  title={t.addCustBtn}
                  className="bg-slate-900 hover:bg-slate-800 text-white p-2 rounded-xl cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Selected items list */}
            <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
              {cart.length === 0 ? (
                <div className="text-center text-slate-400 py-12 text-xs">
                  {t.emptyCart}
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.product.id} className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-slate-800 max-w-[180px] truncate">{item.product.name}</p>
                      <p className="text-slate-400 text-[10px] mt-0.5">₹ {item.product.sellingPrice} each</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center bg-white border border-slate-200 rounded-lg overflow-hidden">
                        <button id={`pos-qty-minus-${item.product.id}`} onClick={() => handleUpdateQty(item.product.id, -1)} className="p-1 hover:bg-slate-100 cursor-pointer">
                          <Minus className="w-3 h-3 text-slate-600" />
                        </button>
                        <span className="px-2 font-bold text-slate-800">{item.quantity}</span>
                        <button id={`pos-qty-plus-${item.product.id}`} onClick={() => handleUpdateQty(item.product.id, 1)} className="p-1 hover:bg-slate-100 cursor-pointer">
                          <Plus className="w-3 h-3 text-slate-600" />
                        </button>
                      </div>

                      <button id={`pos-remove-${item.product.id}`} onClick={() => handleRemoveFromCart(item.product.id)} className="text-slate-400 hover:text-rose-600 cursor-pointer">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>

          {/* Pricing settlement summary panel */}
          <div className="mt-6 border-t border-slate-100 pt-4 space-y-3 text-xs">
            
            <div className="flex justify-between text-slate-500">
              <span>{t.subtotal}</span>
              <span>₹ {subtotal.toLocaleString('en-IN')}</span>
            </div>

            <div className="flex justify-between text-slate-400 text-[11px]">
              <span>{t.gst} (Breakup)</span>
              <span>₹ {Math.round(totalGst).toLocaleString('en-IN')}</span>
            </div>

            <div className="flex items-center justify-between text-slate-600">
              <span className="flex items-center gap-1">
                <Percent className="w-3.5 h-3.5 text-slate-400" />
                {t.discount}
              </span>
              <input
                id="pos-discount-input"
                type="number"
                min={0}
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
                className="w-20 bg-slate-50 text-right border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800 font-bold focus:outline-hidden"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-600 font-medium">{t.payMethod}</span>
              <div className="flex gap-1">
                {(['Cash', 'Card', 'UPI', 'Credit'] as const).map(m => (
                  <button
                    id={`pay-${m}`}
                    key={m}
                    onClick={() => setPaymentMethod(m)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer border ${
                      paymentMethod === m ? 'bg-slate-900 border-slate-900 text-white' : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between border-t border-slate-100 pt-3 text-sm font-black">
              <span className="text-slate-800">{t.total}</span>
              <span className="text-indigo-700 text-base">₹ {grandTotal.toLocaleString('en-IN')}</span>
            </div>

            <button
              id="pos-checkout-confirm-btn"
              onClick={handleCheckout}
              disabled={cart.length === 0}
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl text-center flex items-center justify-center gap-2 mt-2 cursor-pointer shadow-md transition-colors"
            >
              <CheckCircle className="w-5 h-5" />
              <span>{t.checkoutBtn}</span>
            </button>

          </div>

        </div>

      </div>

      {/* Tax Invoice Modal Dialog */}
      {currentInvoice && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in text-slate-800">
            <div className="p-4 border-b border-slate-100 bg-slate-950 text-white flex justify-between items-center print:hidden">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-400" />
                GST Tax Invoice Generated
              </h3>
              <button onClick={() => setCurrentInvoice(null)} className="p-1 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Tax Invoice Content */}
            <div id="print-invoice-area" className="p-8 space-y-6 bg-white text-slate-900 text-xs font-mono">
              
              {/* Invoice Title */}
              <div className="text-center space-y-1 pb-4 border-b border-slate-300">
                <h2 className="text-lg font-black tracking-wide uppercase">{t.invoiceTitle}</h2>
                <h1 className="text-xl font-extrabold text-indigo-900">HAPPY AUTO PARTS & SERVICE BAY</h1>
                <p className="text-[10px] text-slate-500">12, Automobile Hub, Sector-4, New Delhi • GSTIN: 07AASH9928Z1ZO</p>
                <p className="text-[10px] text-slate-500">Phone: +91 9876543210 • Email: info@happyautoerp.com</p>
              </div>

              {/* Invoice Meta details */}
              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-200">
                <div className="space-y-1">
                  <p className="text-slate-400 text-[10px] uppercase font-bold">Billed To (Customer):</p>
                  <p className="font-extrabold text-sm">{currentInvoice.customerName}</p>
                  <p className="text-slate-600">Phone: +91 {currentInvoice.customerPhone}</p>
                  <p className="text-slate-500">Date: {new Date(currentInvoice.createdAt).toLocaleString('en-IN')}</p>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-slate-400 text-[10px] uppercase font-bold">Voucher Details:</p>
                  <p className="font-extrabold text-sm text-indigo-700">{currentInvoice.invoiceNumber}</p>
                  <p className="text-slate-600">Payment: {currentInvoice.paymentMethod} (Status: Paid)</p>
                  <p className="text-slate-500 font-bold">GST Summary: Included in pricing</p>
                </div>
              </div>

              {/* Tax Breakup Table */}
              <table className="w-full text-left text-[11px] border-collapse">
                <thead>
                  <tr className="border-b border-slate-300 uppercase text-slate-500 text-[9px]">
                    <th className="py-2">Description / Part No</th>
                    <th className="py-2 text-center">Qty</th>
                    <th className="py-2 text-right">Unit MRP</th>
                    <th className="py-2 text-center">GST %</th>
                    <th className="py-2 text-right">Total (Incl GST)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentInvoice.items.map((item, idx) => (
                    <tr key={idx} className="py-2">
                      <td className="py-2.5 font-bold text-slate-800">
                        {item.name}
                        <span className="block text-[9px] text-slate-400 font-normal">MPN: {item.partNumber}</span>
                      </td>
                      <td className="py-2.5 text-center">{item.quantity}</td>
                      <td className="py-2.5 text-right">₹ {item.sellingPrice}</td>
                      <td className="py-2.5 text-center">{item.gstPercent}%</td>
                      <td className="py-2.5 text-right font-bold">₹ {item.subtotal}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Invoicing Grand Calculation */}
              <div className="pt-4 border-t border-slate-200 flex justify-end">
                <div className="w-60 space-y-1.5 text-right text-[11px]">
                  <div className="flex justify-between text-slate-500">
                    <span>Taxable Net Amount:</span>
                    <span>₹ {currentInvoice.totalBeforeGst}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>CGST + SGST (Calculated):</span>
                    <span>₹ {currentInvoice.totalGst}</span>
                  </div>
                  {currentInvoice.discount > 0 && (
                    <div className="flex justify-between text-rose-600 font-semibold">
                      <span>ERP Promotional Discount:</span>
                      <span>- ₹ {currentInvoice.discount}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-slate-300 pt-1.5 text-sm font-black text-slate-800">
                    <span>Grand Invoice Total:</span>
                    <span className="text-indigo-800 text-base">₹ {currentInvoice.grandTotal}</span>
                  </div>
                </div>
              </div>

              {/* Footer Stamp terms */}
              <div className="pt-8 border-t border-slate-300 text-center text-[10px] text-slate-400 space-y-1">
                <p>This is a computer generated GST Tax Invoice. No signature is required.</p>
                <p className="font-bold text-slate-700 uppercase tracking-wider">Thank you for your business! Have a safe drive.</p>
              </div>

            </div>

            {/* print action footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2 print:hidden">
              <button 
                id="pos-print-trigger"
                onClick={() => window.print()} 
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                {t.printInvoice}
              </button>
              <button 
                onClick={() => setCurrentInvoice(null)} 
                className="border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-bold px-4 py-2 rounded-xl cursor-pointer"
              >
                Dismiss
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Quick customer register popup inside billing */}
      {isQuickCustOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl animate-fade-in text-slate-800">
            <div className="p-4 border-b border-slate-100 bg-slate-950 text-white flex justify-between items-center">
              <h3 className="font-bold text-sm">Register Quick Customer</h3>
              <button onClick={() => setIsQuickCustOpen(false)} className="p-1 rounded-full text-slate-300 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleQuickCustomerSave} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Customer Full Name</label>
                <input
                  id="quick-cust-name"
                  type="text"
                  required
                  value={quickCustName}
                  onChange={(e) => setQuickCustName(e.target.value)}
                  placeholder="e.g. Amit Sharma"
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Contact Phone</label>
                <input
                  id="quick-cust-phone"
                  type="text"
                  required
                  value={quickCustPhone}
                  onChange={(e) => setQuickCustPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsQuickCustOpen(false)}
                  className="border border-slate-200 hover:bg-slate-50 text-xs font-bold px-3 py-2 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="quick-cust-save"
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-lg cursor-pointer transition-colors"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
