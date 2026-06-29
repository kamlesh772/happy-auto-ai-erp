import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  User, 
  Phone, 
  Mail, 
  Car, 
  MessageSquare, 
  CreditCard, 
  Trash2, 
  Edit2, 
  X, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import { Customer, Vehicle } from '../types';

interface CustomersProps {
  customers: Customer[];
  onAddCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => Promise<void>;
  onEditCustomer: (id: string, customer: Partial<Customer>) => Promise<void>;
  onDeleteCustomer: (id: string) => Promise<void>;
  lang: 'en' | 'hi';
}

export default function Customers({ customers, onAddCustomer, onEditCustomer, onDeleteCustomer, lang }: CustomersProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [creditBalance, setCreditBalance] = useState(0);
  
  // Vehicles list within form
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [newVehicleModel, setNewVehicleModel] = useState('');
  const [newVehiclePlate, setNewVehiclePlate] = useState('');
  const [newVehicleYear, setNewVehicleYear] = useState('');

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone.includes(searchTerm) ||
    c.vehicles.some(v => v.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) || v.model.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const openAddForm = () => {
    setEditingCustomer(null);
    setName('');
    setPhone('');
    setEmail('');
    setCreditBalance(0);
    setVehicles([]);
    setIsFormOpen(true);
  };

  const openEditForm = (c: Customer) => {
    setEditingCustomer(c);
    setName(c.name);
    setPhone(c.phone);
    setEmail(c.email || '');
    setCreditBalance(c.creditBalance || 0);
    setVehicles(c.vehicles || []);
    setIsFormOpen(true);
  };

  const handleAddVehicle = () => {
    if (!newVehicleModel || !newVehiclePlate) return;
    setVehicles(prev => [...prev, {
      model: newVehicleModel,
      registrationNumber: newVehiclePlate,
      year: newVehicleYear
    }]);
    setNewVehicleModel('');
    setNewVehiclePlate('');
    setNewVehicleYear('');
  };

  const handleRemoveVehicle = (index: number) => {
    setVehicles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const customerPayload = {
      name,
      phone,
      email: email || undefined,
      creditBalance: Number(creditBalance),
      vehicles
    };

    if (editingCustomer) {
      await onEditCustomer(editingCustomer.id, customerPayload);
    } else {
      await onAddCustomer(customerPayload);
    }
    setIsFormOpen(false);
  };

  // WhatsApp reminder generator
  const triggerWhatsApp = (customer: Customer, type: 'general' | 'due') => {
    let text = "";
    if (type === 'due') {
      text = `Hello ${customer.name}, this is a reminder from Happy Auto Garage regarding an outstanding credit balance of Rs. ${customer.creditBalance}. Please let us know if you need assistance with UPI details. Thank you!`;
    } else {
      text = `Hello ${customer.name}, welcome to Happy Auto Spares & Garage. Your vehicle profile has been successfully updated on our ERP. We are happy to serve you!`;
    }
    const url = `https://api.whatsapp.com/send?phone=91${customer.phone}&text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const t = {
    en: {
      title: "Customers Registry",
      addBtn: "New Customer",
      searchPlaceholder: "Search by customer name, phone, or plate...",
      vehicles: "Vehicles Owned",
      creditLabel: "Outstanding Credit Balance",
      noCust: "No customer records found.",
      save: "Save Customer",
      cancel: "Cancel",
      generalInfo: "General Contact Info",
      manageVehicles: "Manage Customer Vehicles"
    },
    hi: {
      title: "ग्राहक पंजी",
      addBtn: "नया ग्राहक",
      searchPlaceholder: "ग्राहक का नाम, फोन, या गाड़ी नंबर से खोजें...",
      vehicles: "स्वामित्व वाले वाहन",
      creditLabel: "बकाया क्रेडिट बैलेंस",
      noCust: "कोई ग्राहक रिकॉर्ड नहीं मिला।",
      save: "ग्राहक सहेजें",
      cancel: "रद्द करें",
      generalInfo: "सामान्य संपर्क जानकारी",
      manageVehicles: "ग्राहक वाहनों का प्रबंधन"
    }
  }[lang];

  return (
    <div className="space-y-6">
      
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">{t.title}</h2>
          <p className="text-sm text-slate-500">Manage owner profiles, outstanding credit balances, and vehicle registers.</p>
        </div>
        <button
          id="cust-add-btn"
          onClick={openAddForm}
          className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-4 py-2.5 rounded-xl text-sm flex items-center gap-2 cursor-pointer shadow-xs transition-colors self-end sm:self-auto"
        >
          <Plus className="w-5 h-5" />
          <span>{t.addBtn}</span>
        </button>
      </div>

      {/* Search Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200">
        <div className="relative">
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
          <input
            id="cust-search-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full bg-slate-50 text-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm border border-slate-200 focus:outline-hidden focus:border-slate-800 focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* Grid of Customer Profiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.length === 0 ? (
          <div className="col-span-full text-center text-slate-400 py-12">
            {t.noCust}
          </div>
        ) : (
          filteredCustomers.map(c => (
            <div key={c.id} className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md transition-all flex flex-col justify-between">
              
              {/* Profile Header */}
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 bg-indigo-50 text-indigo-700 rounded-xl flex items-center justify-center font-bold">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{c.name}</h4>
                      <p className="text-[10px] text-slate-400">ID: {c.id.slice(0, 8)}</p>
                    </div>
                  </div>
                  
                  {/* Action Dropdown/Buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      id={`cust-edit-${c.id}`}
                      onClick={() => openEditForm(c)}
                      className="p-1 hover:bg-slate-100 text-slate-500 hover:text-slate-900 rounded-lg cursor-pointer transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      id={`cust-delete-${c.id}`}
                      onClick={() => {
                        if (window.confirm("Delete this customer?")) onDeleteCustomer(c.id);
                      }}
                      className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Contact Indicators */}
                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>+91 {c.phone}</span>
                  </div>
                  {c.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{c.email}</span>
                    </div>
                  )}
                </div>

                {/* Credit balance warning indicator */}
                {c.creditBalance > 0 && (
                  <div className="bg-amber-50 border border-amber-100 p-2.5 rounded-xl flex justify-between items-center text-xs text-amber-900">
                    <div className="flex items-center gap-1.5 font-semibold">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      <span>{t.creditLabel}</span>
                    </div>
                    <span className="font-extrabold text-amber-700">₹ {c.creditBalance}</span>
                  </div>
                )}

                {/* Vehicle Sub-list */}
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1.5">
                    {t.vehicles} ({c.vehicles?.length || 0})
                  </span>
                  <div className="space-y-1.5">
                    {c.vehicles && c.vehicles.length > 0 ? (
                      c.vehicles.map((v, i) => (
                        <div key={i} className="bg-slate-50 border border-slate-100 px-2.5 py-1.5 rounded-xl flex items-center justify-between text-[11px]">
                          <div className="flex items-center gap-2 text-slate-700 font-medium">
                            <Car className="w-3.5 h-3.5 text-indigo-500" />
                            <span>{v.model}</span>
                          </div>
                          <span className="font-mono bg-white border border-slate-200 px-1.5 py-0.5 rounded-sm font-bold text-[10px] text-slate-600">
                            {v.registrationNumber}
                          </span>
                        </div>
                      ))
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">No vehicles listed.</span>
                    )}
                  </div>
                </div>

              </div>

              {/* Messaging & Call shortcuts */}
              <div className="pt-4 mt-4 border-t border-slate-100 flex gap-2">
                <a 
                  id={`cust-call-${c.id}`}
                  href={`tel:${c.phone}`} 
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold py-2 rounded-xl text-center cursor-pointer transition-colors flex items-center justify-center gap-1"
                >
                  <Phone className="w-3.5 h-3.5" />
                  Call
                </a>
                <button
                  id={`cust-wp-general-${c.id}`}
                  onClick={() => triggerWhatsApp(c, 'general')}
                  className="flex-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold py-2 rounded-xl cursor-pointer transition-colors flex items-center justify-center gap-1"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  WhatsApp
                </button>
                {c.creditBalance > 0 && (
                  <button
                    id={`cust-wp-remind-${c.id}`}
                    onClick={() => triggerWhatsApp(c, 'due')}
                    className="bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-bold px-2 py-2 rounded-xl cursor-pointer transition-colors flex items-center justify-center"
                    title="Send Credit Reminder"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-rose-600" />
                  </button>
                )}
              </div>

            </div>
          ))
        )}
      </div>

      {/* Add / Edit customer dialog modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in text-slate-800">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-950 text-white rounded-t-2xl">
              <h3 className="font-bold text-lg">{editingCustomer ? "Edit Customer Profile" : "Register New Customer"}</h3>
              <button 
                id="cust-close-form"
                onClick={() => setIsFormOpen(false)} 
                className="p-1 hover:bg-slate-800 rounded-full cursor-pointer"
              >
                <X className="w-6 h-6 text-slate-300" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-6">
              
              {/* Contact parameters */}
              <div className="space-y-4">
                <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-indigo-500" />
                  {t.generalInfo}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Customer Full Name</label>
                    <input
                      id="cust-name-field"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Amit Sharma"
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-hidden focus:border-slate-800 text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">WhatsApp / Contact Phone</label>
                    <input
                      id="cust-phone-field"
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 9876543210"
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-hidden focus:border-slate-800 text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Email Address</label>
                    <input
                      id="cust-email-field"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. amit@gmail.com"
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-hidden focus:border-slate-800 text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">{t.creditLabel} (₹)</label>
                    <input
                      id="cust-credit-field"
                      type="number"
                      value={creditBalance}
                      onChange={(e) => setCreditBalance(Number(e.target.value))}
                      placeholder="e.g. 0"
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-hidden focus:border-slate-800 text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* Dynamic Vehicle adding */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                  <Car className="w-3.5 h-3.5 text-indigo-500" />
                  {t.manageVehicles}
                </h4>

                {/* Adding Row */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2.5">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <input
                      id="veh-model-field"
                      type="text"
                      value={newVehicleModel}
                      onChange={(e) => setNewVehicleModel(e.target.value)}
                      placeholder="Model (e.g. Maruti Swift)"
                      className="border border-slate-300 bg-white rounded-lg px-2.5 py-1.5 text-xs text-slate-800"
                    />
                    <input
                      id="veh-plate-field"
                      type="text"
                      value={newVehiclePlate}
                      onChange={(e) => setNewVehiclePlate(e.target.value)}
                      placeholder="Plate (e.g. DL 3C AM 1234)"
                      className="border border-slate-300 bg-white rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-mono uppercase"
                    />
                    <input
                      id="veh-year-field"
                      type="text"
                      value={newVehicleYear}
                      onChange={(e) => setNewVehicleYear(e.target.value)}
                      placeholder="Mfg Year (e.g. 2019)"
                      className="border border-slate-300 bg-white rounded-lg px-2.5 py-1.5 text-xs text-slate-800"
                    />
                  </div>
                  <button
                    id="veh-add-btn"
                    type="button"
                    onClick={handleAddVehicle}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-1.5 rounded-lg text-xs cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Vehicle
                  </button>
                </div>

                {/* Added list */}
                <div className="space-y-1.5">
                  {vehicles.map((v, i) => (
                    <div key={i} className="flex justify-between items-center bg-slate-100 p-2.5 rounded-xl text-xs">
                      <div>
                        <span className="font-bold text-slate-800">{v.model}</span>
                        <span className="text-slate-400 font-mono ml-2">[{v.registrationNumber}]</span>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => handleRemoveVehicle(i)} 
                        className="text-rose-600 hover:underline font-bold cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  id="cust-form-cancel"
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 text-sm font-semibold border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-700 cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button
                  id="cust-form-save"
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

    </div>
  );
}
