import React, { useState } from 'react';
import { 
  Plus, 
  Wrench, 
  User, 
  Car, 
  Phone, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  X, 
  Search, 
  Trash2, 
  Edit2, 
  MessageSquare,
  ClipboardList
} from 'lucide-react';
import { JobCard, Customer } from '../types';

interface ServiceCenterProps {
  jobCards: JobCard[];
  customers: Customer[];
  onAddJobCard: (jobCard: Omit<JobCard, 'id' | 'jobCardNumber' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onEditJobCard: (id: string, jobCard: Partial<JobCard>) => Promise<void>;
  onDeleteJobCard: (id: string) => Promise<void>;
  lang: 'en' | 'hi';
}

export default function ServiceCenter({ jobCards, customers, onAddJobCard, onEditJobCard, onDeleteJobCard, lang }: ServiceCenterProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingJobCard, setEditingJobCard] = useState<JobCard | null>(null);

  // Form Fields
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [assignedMechanic, setAssignedMechanic] = useState('');
  const [status, setStatus] = useState<'Received' | 'In Progress' | 'Inspection' | 'Parts Pending' | 'Ready' | 'Delivered'>('Received');
  const [estimatedCost, setEstimatedCost] = useState(0);
  const [notes, setNotes] = useState('');
  
  // Dynamic complaints list
  const [complaints, setComplaints] = useState<string[]>([]);
  const [newComplaint, setNewComplaint] = useState('');

  const mechanics = ["Ramesh Kumar", "Suresh Singh", "Vijay Yadav", "Amit Pal", "Jagdish Prasad"];

  const filteredJobCards = jobCards.filter(jc => 
    jc.jobCardNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    jc.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    jc.vehiclePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    jc.vehicleModel.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openAddForm = () => {
    setEditingJobCard(null);
    setSelectedCustomerId('');
    setVehicleModel('');
    setVehiclePlate('');
    setAssignedMechanic('');
    setStatus('Received');
    setEstimatedCost(0);
    setNotes('');
    setComplaints([]);
    setIsFormOpen(true);
  };

  const openEditForm = (jc: JobCard) => {
    setEditingJobCard(jc);
    setSelectedCustomerId(jc.customerId);
    setVehicleModel(jc.vehicleModel);
    setVehiclePlate(jc.vehiclePlate);
    setAssignedMechanic(jc.assignedMechanic);
    setStatus(jc.status);
    setEstimatedCost(jc.estimatedCost);
    setNotes(jc.notes || '');
    setComplaints(jc.complaints || []);
    setIsFormOpen(true);
  };

  const handleAddComplaint = () => {
    if (!newComplaint.trim()) return;
    setComplaints(prev => [...prev, newComplaint.trim()]);
    setNewComplaint('');
  };

  const handleRemoveComplaint = (idx: number) => {
    setComplaints(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (complaints.length === 0) {
      alert("Please log at least one customer complaint / service requirement.");
      return;
    }

    const customer = customers.find(c => c.id === selectedCustomerId);
    const customerName = customer ? customer.name : "Walk-in Retail";
    const customerPhone = customer ? customer.phone : "N/A";

    const payload = {
      customerId: selectedCustomerId || 'walk-in',
      customerName,
      customerPhone,
      vehicleModel,
      vehiclePlate: vehiclePlate.toUpperCase(),
      complaints,
      assignedMechanic,
      status,
      estimatedCost: Number(estimatedCost),
      notes
    };

    if (editingJobCard) {
      await onEditJobCard(editingJobCard.id, payload);
    } else {
      await onAddJobCard(payload);
    }
    setIsFormOpen(false);
  };

  const handleStatusQuickChange = async (id: string, newStatus: typeof status) => {
    await onEditJobCard(id, { status: newStatus });
  };

  const triggerWhatsAppUpdate = (jc: JobCard) => {
    let msg = "";
    if (jc.status === 'Ready') {
      msg = `Dear ${jc.customerName}, your vehicle ${jc.vehicleModel} (${jc.vehiclePlate}) is ready for pickup! Estimated billing is Rs. ${jc.estimatedCost}. Thank you - Happy Auto.`;
    } else if (jc.status === 'In Progress') {
      msg = `Hello ${jc.customerName}, work has started on your ${jc.vehicleModel} (${jc.vehiclePlate}) by mechanic ${jc.assignedMechanic}. We will update you once it's completed.`;
    } else {
      msg = `Hello ${jc.customerName}, Job Card ${jc.jobCardNumber} has been logged for your ${jc.vehicleModel}. Current status: ${jc.status}.`;
    }
    const url = `https://api.whatsapp.com/send?phone=91${jc.customerPhone}&text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  const t = {
    en: {
      title: "Service Bay & Job Cards",
      addBtn: "Create Job Card",
      searchPlaceholder: "Search by Job Card No., plate, or customer...",
      complaints: "Complaints / Repairs Logged",
      assignedMeCh: "Assigned Technician",
      estCost: "Estimate Cost (₹)",
      save: "Save Job Card",
      cancel: "Cancel",
      generalInfo: "Vehicle & Owner Association",
      status: "Service Status",
      whatsApp: "Send Update",
      noJobs: "No service jobs cataloged.",
      mechanicsList: "Active Technicians Queue"
    },
    hi: {
      title: "सर्विस वे और जॉब कार्ड",
      addBtn: "जॉब कार्ड बनाएं",
      searchPlaceholder: "जॉब कार्ड नं, गाड़ी नं या ग्राहक से खोजें...",
      complaints: "शिकायतें / मरम्मत विवरण",
      assignedMeCh: "नियुक्त तकनीशियन",
      estCost: "अनुमानित लागत (₹)",
      save: "जॉब कार्ड सहेजें",
      cancel: "रद्द करें",
      generalInfo: "वाहन और मालिक का विवरण",
      status: "सेवा की स्थिति",
      whatsApp: "अपडेट भेजें",
      noJobs: "कोई सेवा जॉब्स दर्ज नहीं हैं।",
      mechanicsList: "सक्रिय तकनीशियन कतार"
    }
  }[lang];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">{t.title}</h2>
          <p className="text-sm text-slate-500">Track vehicle repairs, assign mechanics, log customer complaints, and send status updates.</p>
        </div>
        <button
          id="service-add-btn"
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
            id="service-search-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full bg-slate-50 text-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm border border-slate-200 focus:outline-hidden focus:border-slate-800 focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* Grid of Job Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredJobCards.length === 0 ? (
          <div className="col-span-full text-center text-slate-400 py-12">
            {t.noJobs}
          </div>
        ) : (
          filteredJobCards.map(jc => (
            <div key={jc.id} className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md transition-all flex flex-col justify-between">
              
              <div className="space-y-4">
                
                {/* Header bar */}
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-mono text-indigo-700 font-extrabold text-sm">{jc.jobCardNumber}</span>
                    <h4 className="font-extrabold text-slate-800 text-base mt-1 flex items-center gap-1.5">
                      <Car className="w-4 h-4 text-slate-500 shrink-0" />
                      {jc.vehicleModel}
                    </h4>
                  </div>
                  
                  {/* Status Dropdown selector */}
                  <div className="flex items-center gap-1">
                    <button
                      id={`service-edit-${jc.id}`}
                      onClick={() => openEditForm(jc)}
                      className="p-1 hover:bg-slate-100 text-slate-500 hover:text-slate-900 rounded-lg cursor-pointer transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      id={`service-delete-${jc.id}`}
                      onClick={() => {
                        if (window.confirm("Delete this Job Card record?")) onDeleteJobCard(jc.id);
                      }}
                      className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Sub-parameters owner/plate */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                    <span className="text-[9px] uppercase font-bold text-slate-400 block mb-0.5">Owner</span>
                    <span className="font-bold text-slate-800 block truncate">{jc.customerName}</span>
                    <span className="text-[10px] text-slate-500 block">+91 {jc.customerPhone}</span>
                  </div>

                  <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                    <span className="text-[9px] uppercase font-bold text-slate-400 block mb-0.5">Reg. Plate</span>
                    <span className="font-mono font-bold text-slate-800 block uppercase tracking-wide">{jc.vehiclePlate}</span>
                  </div>
                </div>

                {/* Complaints logged list */}
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">{t.complaints}</span>
                  <div className="space-y-1">
                    {jc.complaints.map((comp, idx) => (
                      <div key={idx} className="flex gap-1.5 items-start text-xs text-slate-600 bg-amber-50/50 px-2 py-1.5 rounded-lg border border-amber-100/50">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <span>{comp}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Technician assignment and costs */}
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block mb-0.5">{t.assignedMeCh}</span>
                    <span className="font-bold text-slate-800">{jc.assignedMechanic || "Not Assigned"}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block mb-0.5">{t.estCost}</span>
                    <span className="font-extrabold text-indigo-700">₹ {jc.estimatedCost}</span>
                  </div>
                </div>

              </div>

              {/* Status workflow triggers & messaging */}
              <div className="pt-4 mt-4 border-t border-slate-100 space-y-2">
                
                {/* Quick Status Setter Slider */}
                <div className="flex gap-1 items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-500">Status:</span>
                  <select
                    id={`service-status-quick-${jc.id}`}
                    value={jc.status}
                    onChange={(e) => handleStatusQuickChange(jc.id, e.target.value as any)}
                    className="bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-2 py-1 font-bold cursor-pointer focus:outline-hidden"
                  >
                    <option value="Received">Received</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Inspection">Inspection</option>
                    <option value="Parts Pending">Parts Pending</option>
                    <option value="Ready">Ready</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </div>

                <button
                  id={`service-wp-update-${jc.id}`}
                  onClick={() => triggerWhatsAppUpdate(jc)}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2 rounded-xl cursor-pointer transition-colors flex items-center justify-center gap-1.5"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>{t.whatsApp}</span>
                </button>
              </div>

            </div>
          ))
        )}
      </div>

      {/* Add / Edit Job Card Dialog Form */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in text-slate-800">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-950 text-white rounded-t-2xl">
              <h3 className="font-bold text-lg">{editingJobCard ? "Modify Job Card details" : "Create Active Job Card"}</h3>
              <button 
                id="service-close-form"
                onClick={() => setIsFormOpen(false)} 
                className="p-1 hover:bg-slate-800 rounded-full cursor-pointer"
              >
                <X className="w-6 h-6 text-slate-300" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-5">
              
              <div className="space-y-4">
                <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-indigo-500" />
                  {t.generalInfo}
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Select Customer Owner</label>
                    <select
                      id="service-cust-select"
                      required
                      value={selectedCustomerId}
                      onChange={(e) => setSelectedCustomerId(e.target.value)}
                      className="w-full bg-slate-50 text-slate-800 border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-hidden"
                    >
                      <option value="">-- Choose Owner --</option>
                      {customers.map(c => (
                        <option key={c.id} value={c.id}>{c.name} (+91 {c.phone})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Vehicle Plate (Registration Number)</label>
                    <input
                      id="service-plate-input"
                      type="text"
                      required
                      value={vehiclePlate}
                      onChange={(e) => setVehiclePlate(e.target.value)}
                      placeholder="e.g. DL 3C AM 1234"
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm uppercase text-slate-800 font-mono focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Vehicle Model Name</label>
                    <input
                      id="service-model-input"
                      type="text"
                      required
                      value={vehicleModel}
                      onChange={(e) => setVehicleModel(e.target.value)}
                      placeholder="e.g. Maruti Swift Dzire ZXI"
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Technician Assignment</label>
                    <select
                      id="service-tech-select"
                      value={assignedMechanic}
                      onChange={(e) => setAssignedMechanic(e.target.value)}
                      className="w-full bg-slate-50 text-slate-800 border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-hidden"
                    >
                      <option value="">-- Choose Mechanic --</option>
                      {mechanics.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Complaints Log */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                  <ClipboardList className="w-3.5 h-3.5 text-indigo-500" />
                  {t.complaints}
                </h4>

                <div className="flex gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
                  <input
                    id="service-new-complaint"
                    type="text"
                    value={newComplaint}
                    onChange={(e) => setNewComplaint(e.target.value)}
                    placeholder="e.g. Engine heat indicator light is blinking"
                    className="flex-1 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800"
                  />
                  <button
                    id="service-add-complaint-btn"
                    type="button"
                    onClick={handleAddComplaint}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-3 py-1.5 rounded-lg text-xs cursor-pointer shrink-0"
                  >
                    Add Log
                  </button>
                </div>

                <div className="space-y-1.5">
                  {complaints.map((comp, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-slate-100 p-2.5 rounded-xl text-xs">
                      <span className="text-slate-700 font-medium">{comp}</span>
                      <button 
                        type="button" 
                        onClick={() => handleRemoveComplaint(idx)} 
                        className="text-rose-600 hover:underline font-bold cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Costing and service stage status */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-500" />
                  Service Parameters
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Estimate Sourcing Cost (₹)</label>
                    <input
                      id="service-est-cost"
                      type="number"
                      required
                      value={estimatedCost}
                      onChange={(e) => setEstimatedCost(Number(e.target.value))}
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Repair Stage Status</label>
                    <select
                      id="service-status-select"
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="w-full bg-slate-50 text-slate-800 border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-hidden"
                    >
                      <option value="Received">Received</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Inspection">Inspection</option>
                      <option value="Parts Pending">Parts Pending</option>
                      <option value="Ready">Ready</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Additional Service Notes</label>
                  <textarea
                    id="service-notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Engine oil replaced Castrol 5W30, Cabin filter replaced."
                    rows={2}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800"
                  />
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  id="service-form-cancel"
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 text-sm font-semibold border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-700 cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button
                  id="service-form-save"
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
