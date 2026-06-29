import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Truck, 
  Phone, 
  Mail, 
  Briefcase, 
  CreditCard, 
  Trash2, 
  Edit2, 
  X, 
  CheckCircle,
  FileText
} from 'lucide-react';
import { Supplier } from '../types';

interface SuppliersProps {
  suppliers: Supplier[];
  onAddSupplier: (supplier: Omit<Supplier, 'id' | 'createdAt'>) => Promise<void>;
  onEditSupplier: (id: string, supplier: Partial<Supplier>) => Promise<void>;
  onDeleteSupplier: (id: string) => Promise<void>;
  lang: 'en' | 'hi';
}

export default function Suppliers({ suppliers, onAddSupplier, onEditSupplier, onDeleteSupplier, lang }: SuppliersProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  // Settlement Form Fields
  const [settleSupplier, setSettleSupplier] = useState<Supplier | null>(null);
  const [settleAmount, setSettleAmount] = useState(0);

  // Form Fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [gstin, setGstin] = useState('');
  const [pendingPayment, setPendingPayment] = useState(0);

  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.gstin && s.gstin.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const openAddForm = () => {
    setEditingSupplier(null);
    setName('');
    setPhone('');
    setEmail('');
    setCompanyName('');
    setGstin('');
    setPendingPayment(0);
    setIsFormOpen(true);
  };

  const openEditForm = (s: Supplier) => {
    setEditingSupplier(s);
    setName(s.name);
    setPhone(s.phone);
    setEmail(s.email || '');
    setCompanyName(s.companyName);
    setGstin(s.gstin || '');
    setPendingPayment(s.pendingPayment || 0);
    setIsFormOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const supplierPayload = {
      name,
      phone,
      email: email || undefined,
      companyName,
      gstin: gstin || undefined,
      pendingPayment: Number(pendingPayment)
    };

    if (editingSupplier) {
      await onEditSupplier(editingSupplier.id, supplierPayload);
    } else {
      await onAddSupplier(supplierPayload);
    }
    setIsFormOpen(false);
  };

  const handleSettlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settleSupplier) return;
    const currentPending = settleSupplier.pendingPayment || 0;
    const remaining = Math.max(0, currentPending - settleAmount);
    
    await onEditSupplier(settleSupplier.id, { pendingPayment: remaining });
    setSettleSupplier(null);
    setSettleAmount(0);
  };

  const t = {
    en: {
      title: "Suppliers Hub",
      addBtn: "Register Vendor",
      searchPlaceholder: "Search by supplier, company, GSTIN...",
      pendingLabel: "Outstanding Payable Ledger",
      settleBtn: "Settle Funds",
      gstinLabel: "GSTIN",
      noSup: "No supplier profiles listed.",
      save: "Save Supplier",
      cancel: "Cancel",
      generalInfo: "Supplier Contact Detail",
      settleTitle: "Supplier Settlement Ledger"
    },
    hi: {
      title: "आपूर्तिकर्ता हब",
      addBtn: "नया विक्रेता जोड़ें",
      searchPlaceholder: "आपूर्तिकर्ता, कंपनी, जीएसटी से खोजें...",
      pendingLabel: "कुल बकाया देय बहीखाता",
      settleBtn: "भुगतान निपटाएं",
      gstinLabel: "जीएसटी नंबर (GSTIN)",
      noSup: "कोई आपूर्तिकर्ता प्रोफाइल सूचीबद्ध नहीं है।",
      save: "आपूर्तिकर्ता सहेजें",
      cancel: "रद्द करें",
      generalInfo: "आपूर्तिकर्ता संपर्क विवरण",
      settleTitle: "विक्रेता भुगतान बहीखाता"
    }
  }[lang];

  return (
    <div className="space-y-6">
      
      {/* Upper header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">{t.title}</h2>
          <p className="text-sm text-slate-500">Track purchase vendors, credit balances, and incoming invoices.</p>
        </div>
        <button
          id="sup-add-btn"
          onClick={openAddForm}
          className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-4 py-2.5 rounded-xl text-sm flex items-center gap-2 cursor-pointer shadow-xs transition-colors self-end sm:self-auto"
        >
          <Plus className="w-5 h-5" />
          <span>{t.addBtn}</span>
        </button>
      </div>

      {/* Filter and search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200">
        <div className="relative">
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
          <input
            id="sup-search-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full bg-slate-50 text-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm border border-slate-200 focus:outline-hidden focus:border-slate-800 focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* Grid of Profiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSuppliers.length === 0 ? (
          <div className="col-span-full text-center text-slate-400 py-12">
            {t.noSup}
          </div>
        ) : (
          filteredSuppliers.map(s => (
            <div key={s.id} className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md transition-all flex flex-col justify-between">
              
              <div className="space-y-3">
                
                {/* Upper Details */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 bg-emerald-50 text-emerald-700 rounded-xl flex items-center justify-center font-bold">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm truncate max-w-[160px]">{s.companyName}</h4>
                      <p className="text-[10px] text-slate-400">Contact: {s.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      id={`sup-edit-${s.id}`}
                      onClick={() => openEditForm(s)}
                      className="p-1 hover:bg-slate-100 text-slate-500 hover:text-slate-900 rounded-lg cursor-pointer transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      id={`sup-delete-${s.id}`}
                      onClick={() => {
                        if (window.confirm("Delete this supplier profile?")) onDeleteSupplier(s.id);
                      }}
                      className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Sub Contact parameters */}
                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>+91 {s.phone}</span>
                  </div>
                  {s.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{s.email}</span>
                    </div>
                  )}
                  {s.gstin && (
                    <div className="flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-mono text-[10px] bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded-sm">{t.gstinLabel}: {s.gstin}</span>
                    </div>
                  )}
                </div>

                {/* Outstanding Payment status card */}
                <div className={`p-3 rounded-xl border flex justify-between items-center text-xs ${
                  s.pendingPayment > 0 ? 'bg-rose-50 border-rose-100 text-rose-950' : 'bg-emerald-50 border-emerald-100 text-emerald-950'
                }`}>
                  <div className="flex items-center gap-1.5 font-semibold">
                    <CreditCard className={`w-4 h-4 ${s.pendingPayment > 0 ? 'text-rose-600' : 'text-emerald-600'}`} />
                    <span>{t.pendingLabel}</span>
                  </div>
                  <span className={`font-extrabold ${s.pendingPayment > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
                    ₹ {s.pendingPayment}
                  </span>
                </div>

              </div>

              {/* Settle Funds Trigger */}
              {s.pendingPayment > 0 && (
                <div className="pt-4 mt-4 border-t border-slate-100">
                  <button
                    id={`sup-settle-${s.id}`}
                    onClick={() => {
                      setSettleSupplier(s);
                      setSettleAmount(s.pendingPayment);
                    }}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    {t.settleBtn}
                  </button>
                </div>
              )}

            </div>
          ))
        )}
      </div>

      {/* Add / Edit Supplier Profile form */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in text-slate-800">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-950 text-white rounded-t-2xl">
              <h3 className="font-bold text-lg">{editingSupplier ? "Edit Supplier profile" : "Add Spares & Oils Supplier"}</h3>
              <button 
                id="sup-close-form"
                onClick={() => setIsFormOpen(false)} 
                className="p-1 hover:bg-slate-800 rounded-full cursor-pointer"
              >
                <X className="w-6 h-6 text-slate-300" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-6">
              
              <div className="space-y-4">
                <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
                  {t.generalInfo}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Company / Firm Name</label>
                    <input
                      id="sup-firm-field"
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. National Auto Distributors"
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-hidden focus:border-slate-800 text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Primary Representative Contact Name</label>
                    <input
                      id="sup-rep-field"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-hidden focus:border-slate-800 text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Contact Phone</label>
                    <input
                      id="sup-phone-field"
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 9811223344"
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-hidden focus:border-slate-800 text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Email ID</label>
                    <input
                      id="sup-email-field"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. sales@nationalauto.com"
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-hidden focus:border-slate-800 text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">GSTIN Number</label>
                    <input
                      id="sup-gstin-field"
                      type="text"
                      value={gstin}
                      onChange={(e) => setGstin(e.target.value)}
                      placeholder="e.g. 07AAAAA1111A1Z1"
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-hidden focus:border-slate-800 text-slate-800 font-mono uppercase"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Pending Balance Ledger (₹)</label>
                    <input
                      id="sup-bal-field"
                      type="number"
                      value={pendingPayment}
                      onChange={(e) => setPendingPayment(Number(e.target.value))}
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-hidden focus:border-slate-800 text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  id="sup-form-cancel"
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 text-sm font-semibold border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-700 cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button
                  id="sup-form-save"
                  type="submit"
                  className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-5 py-2 rounded-xl text-sm cursor-pointer shadow-xs"
                >
                  {t.save}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Settle Funds Mini-Modal */}
      {settleSupplier && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-fade-in text-slate-800">
            <div className="p-4 bg-slate-900 text-white font-bold text-sm flex justify-between items-center">
              <span>{t.settleTitle}</span>
              <button onClick={() => setSettleSupplier(null)} className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSettlePayment} className="p-5 space-y-4">
              <p className="text-xs text-slate-500">
                Register a payment outflow to settle with <strong className="text-slate-800">{settleSupplier.companyName}</strong>. This updates their pending balance immediately.
              </p>
              
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Amount Paid (₹)</label>
                <input
                  id="sup-settle-field"
                  type="number"
                  max={settleSupplier.pendingPayment}
                  required
                  value={settleAmount}
                  onChange={(e) => setSettleAmount(Number(e.target.value))}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-hidden focus:border-slate-800 text-slate-800 font-bold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSettleSupplier(null)}
                  className="border border-slate-200 hover:bg-slate-50 text-xs font-bold px-3 py-2 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="sup-settle-confirm"
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-lg cursor-pointer transition-colors"
                >
                  Confirm Settlement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
