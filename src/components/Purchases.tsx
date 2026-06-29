import React, { useState } from 'react';
import { 
  Plus, 
  FileText, 
  Trash2, 
  CheckCircle, 
  Truck, 
  BookOpen, 
  PlusCircle,
  X
} from 'lucide-react';
import { Product, Supplier, PurchaseBill, PurchaseItem } from '../types';

interface PurchasesProps {
  products: Product[];
  suppliers: Supplier[];
  onAddPurchaseBill: (bill: Omit<PurchaseBill, 'id' | 'createdAt'>) => Promise<void>;
  lang: 'en' | 'hi';
}

export default function Purchases({ products, suppliers, onAddPurchaseBill, lang }: PurchasesProps) {
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [billNumber, setBillNumber] = useState('');
  const [items, setItems] = useState<{ productId: string; quantity: number; purchasePrice: number }[]>([]);

  // Helpers to select parts to purchase
  const [currentProductId, setCurrentProductId] = useState('');
  const [currentQty, setCurrentQty] = useState(1);
  const [currentPrice, setCurrentPrice] = useState(0);

  const handleAddPartToBill = () => {
    if (!currentProductId) return;
    const prod = products.find(p => p.id === currentProductId);
    if (!prod) return;

    setItems(prev => {
      const existing = prev.find(item => item.productId === currentProductId);
      if (existing) {
        return prev.map(item => item.productId === currentProductId ? { ...item, quantity: item.quantity + currentQty } : item);
      }
      return [...prev, {
        productId: currentProductId,
        quantity: currentQty,
        purchasePrice: currentPrice || prod.purchasePrice
      }];
    });

    // Reset picker inputs
    setCurrentProductId('');
    setCurrentQty(1);
    setCurrentPrice(0);
  };

  const handleRemovePartFromBill = (productId: string) => {
    setItems(prev => prev.filter(item => item.productId !== productId));
  };

  const grandTotal = items.reduce((sum, item) => sum + (item.purchasePrice * item.quantity), 0);

  const handleProductSelect = (id: string) => {
    setCurrentProductId(id);
    const prod = products.find(p => p.id === id);
    if (prod) {
      setCurrentPrice(prod.purchasePrice);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0 || !selectedSupplierId) {
      alert("Please select a supplier and add at least one spare part.");
      return;
    }

    const supplier = suppliers.find(s => s.id === selectedSupplierId);
    if (!supplier) return;

    const formattedItems: PurchaseItem[] = items.map(item => {
      const prod = products.find(p => p.id === item.productId);
      return {
        productId: item.productId,
        name: prod ? prod.name : "Unknown Spare Part",
        quantity: item.quantity,
        purchasePrice: item.purchasePrice,
        subtotal: item.purchasePrice * item.quantity
      };
    });

    try {
      await onAddPurchaseBill({
        billNumber: billNumber || `BILL-${Math.floor(Math.random() * 900000 + 100000)}`,
        supplierId: selectedSupplierId,
        supplierName: supplier.companyName,
        items: formattedItems,
        grandTotal,
        paymentStatus: 'Pending' // Standard workflow: stock added immediately, payment settled later
      });

      // Clear state
      setSelectedSupplierId('');
      setBillNumber('');
      setItems([]);
      alert("Supplier Bill successfully processed! Stock updated, and outstanding Payable Ledger created.");
    } catch (err) {
      console.error(err);
      alert("Failed to process purchase bill.");
    }
  };

  const t = {
    en: {
      title: "Inward Purchase Entry",
      selectSupplier: "Select Purchase Supplier",
      billNo: "Supplier Bill / Invoice Number",
      catalogSelect: "Pick Spares from Catalog",
      addBtn: "Add to Bill",
      currentBillItems: "Bill Line Items",
      emptyBill: "No items added to this purchase bill.",
      qty: "Qty Bought",
      price: "Unit Cost (₹)",
      total: "Grand Bill Value",
      saveBtn: "Inward Stock & Create Payable Ledger"
    },
    hi: {
      title: "आवक खरीद प्रविष्टि",
      selectSupplier: "आपूर्तिकर्ता का चयन करें",
      billNo: "आपूर्तिकर्ता बिल / चालान नंबर",
      catalogSelect: "कैटलॉग से स्पेयर पार्ट चुनें",
      addBtn: "बिल में जोड़ें",
      currentBillItems: "बिल की सूची सामग्री",
      emptyBill: "इस खरीद बिल में कोई सामान नहीं जोड़ा गया है।",
      qty: "खरीदी गई मात्रा",
      price: "इकाई लागत (₹)",
      total: "कुल बिल राशि",
      saveBtn: "स्टॉक बढ़ाएं और देय बहीखाता बनाएं"
    }
  }[lang];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">{t.title}</h2>
        <p className="text-sm text-slate-500">Record incoming stock from distributors. This automatically increments inventory levels.</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left column: Vendor and Catalog Pickers */}
        <div className="lg:col-span-6 space-y-4">
          
          {/* Supplier details card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 uppercase tracking-wider">
              <Truck className="w-4 h-4 text-indigo-600" />
              Vendor Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">{t.selectSupplier}</label>
                <select
                  id="pur-supplier-select"
                  required
                  value={selectedSupplierId}
                  onChange={(e) => setSelectedSupplierId(e.target.value)}
                  className="w-full bg-slate-50 text-slate-800 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-slate-800 cursor-pointer"
                >
                  <option value="">-- Choose Vendor --</option>
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.companyName} ({s.name})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">{t.billNo}</label>
                <input
                  id="pur-bill-input"
                  type="text"
                  required
                  value={billNumber}
                  onChange={(e) => setBillNumber(e.target.value)}
                  placeholder="e.g. NAT-2026-991A"
                  className="w-full border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-hidden uppercase"
                />
              </div>
            </div>
          </div>

          {/* Catalog Picker Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 uppercase tracking-wider">
              <PlusCircle className="w-4 h-4 text-emerald-600" />
              {t.catalogSelect}
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Pick Spare Part</label>
                <select
                  id="pur-part-picker"
                  value={currentProductId}
                  onChange={(e) => handleProductSelect(e.target.value)}
                  className="w-full bg-slate-50 text-slate-800 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden cursor-pointer"
                >
                  <option value="">-- Pick Part --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.partNumber} / {p.brand})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">{t.qty}</label>
                  <input
                    id="pur-qty-input"
                    type="number"
                    min={1}
                    value={currentQty}
                    onChange={(e) => setCurrentQty(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800 text-center font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">{t.price}</label>
                  <input
                    id="pur-price-input"
                    type="number"
                    min={1}
                    value={currentPrice}
                    onChange={(e) => setCurrentPrice(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800 text-right font-bold"
                  />
                </div>
              </div>

              <button
                id="pur-add-line-btn"
                type="button"
                disabled={!currentProductId}
                onClick={handleAddPartToBill}
                className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-bold py-2 rounded-xl text-xs cursor-pointer flex items-center justify-center gap-1 transition-colors"
              >
                <Plus className="w-4 h-4" />
                {t.addBtn}
              </button>
            </div>
          </div>

        </div>

        {/* Right column: Current Invoice lines */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between shadow-xs">
          
          <div className="space-y-4">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 uppercase tracking-wider pb-3 border-b border-slate-100">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              {t.currentBillItems}
            </h3>

            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1 text-xs">
              {items.length === 0 ? (
                <div className="text-center text-slate-400 py-16">
                  {t.emptyBill}
                </div>
              ) : (
                items.map(item => {
                  const prod = products.find(p => p.id === item.productId);
                  return (
                    <div key={item.productId} className="bg-slate-50 p-2.5 border border-slate-100 rounded-xl flex justify-between items-center text-xs">
                      <div>
                        <p className="font-bold text-slate-800">{prod ? prod.name : "Part"}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">₹ {item.purchasePrice} each • Part No: {prod?.partNumber}</p>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="font-extrabold text-slate-700">x{item.quantity}</span>
                        <span className="font-bold text-slate-800">₹ {item.purchasePrice * item.quantity}</span>
                        <button 
                          id={`pur-remove-${item.productId}`}
                          type="button" 
                          onClick={() => handleRemovePartFromBill(item.productId)} 
                          className="text-slate-400 hover:text-rose-600 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-6 border-t border-slate-100 pt-4 space-y-4 text-xs">
            <div className="flex justify-between items-center text-sm font-black">
              <span className="text-slate-800">{t.total}</span>
              <span className="text-indigo-700 text-base">₹ {grandTotal.toLocaleString('en-IN')}</span>
            </div>

            <button
              id="pur-submit-confirm-btn"
              type="submit"
              disabled={items.length === 0 || !selectedSupplierId}
              className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl text-center flex items-center justify-center gap-2 cursor-pointer shadow-md transition-colors"
            >
              <CheckCircle className="w-5 h-5" />
              <span>{t.saveBtn}</span>
            </button>
          </div>

        </div>

      </form>

    </div>
  );
}
