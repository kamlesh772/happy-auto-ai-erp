import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  Barcode, 
  QrCode, 
  AlertTriangle, 
  X, 
  Camera, 
  Check,
  Tag,
  Printer
} from 'lucide-react';
import { Product } from '../types';

interface InventoryProps {
  products: Product[];
  onAddProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  onEditProduct: (id: string, product: Partial<Product>) => Promise<void>;
  onDeleteProduct: (id: string) => Promise<void>;
  lang: 'en' | 'hi';
}

export default function Inventory({ products, onAddProduct, onEditProduct, onDeleteProduct, lang }: InventoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form Fields State
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [partNumber, setPartNumber] = useState('');
  const [barcode, setBarcode] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [purchasePrice, setPurchasePrice] = useState(0);
  const [sellingPrice, setSellingPrice] = useState(0);
  const [gstPercent, setGstPercent] = useState(18);
  const [stockQuantity, setStockQuantity] = useState(0);
  const [lowStockWarning, setLowStockWarning] = useState(5);
  const [imageUrl, setImageUrl] = useState('');
  const [location, setLocation] = useState('');

  // Barcode / Label Print preview modal
  const [labelProduct, setLabelProduct] = useState<Product | null>(null);

  const categories = Array.from(new Set(products.map(p => p.category))).filter(Boolean);
  const brands = Array.from(new Set(products.map(p => p.brand))).filter(Boolean);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.partNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.barcode.includes(searchTerm) ||
                          p.vehicleModel.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? p.category === selectedCategory : true;
    const matchesBrand = selectedBrand ? p.brand === selectedBrand : true;
    return matchesSearch && matchesCategory && matchesBrand;
  });

  const openAddForm = () => {
    setEditingProduct(null);
    setName('');
    setCategory('Electricals');
    setBrand('');
    setVehicleModel('');
    setPartNumber('');
    setBarcode('');
    setQrCode('');
    setPurchasePrice(0);
    setSellingPrice(0);
    setGstPercent(18);
    setStockQuantity(10);
    setLowStockWarning(5);
    setImageUrl('');
    setLocation('');
    setIsFormOpen(true);
  };

  const openEditForm = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setCategory(p.category);
    setBrand(p.brand);
    setVehicleModel(p.vehicleModel);
    setPartNumber(p.partNumber);
    setBarcode(p.barcode);
    setQrCode(p.qrCode);
    setPurchasePrice(p.purchasePrice);
    setSellingPrice(p.sellingPrice);
    setGstPercent(p.gstPercent);
    setStockQuantity(p.stockQuantity);
    setLowStockWarning(p.lowStockWarning);
    setImageUrl(p.imageUrl || '');
    setLocation(p.location || '');
    setIsFormOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const productPayload = {
      name,
      category,
      brand,
      vehicleModel,
      partNumber,
      barcode: barcode || Math.floor(Math.random() * 9000000000000 + 1000000000000).toString(),
      qrCode: qrCode || partNumber || name,
      purchasePrice: Number(purchasePrice),
      sellingPrice: Number(sellingPrice),
      gstPercent: Number(gstPercent),
      stockQuantity: Number(stockQuantity),
      lowStockWarning: Number(lowStockWarning),
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=300&q=80',
      location
    };

    if (editingProduct) {
      await onEditProduct(editingProduct.id, productPayload);
    } else {
      await onAddProduct(productPayload);
    }
    setIsFormOpen(false);
  };

  const t = {
    en: {
      title: "Inventory Catalog",
      addBtn: "Add Spare Part",
      searchPlaceholder: "Search by part, vehicle, part number...",
      catFilter: "All Categories",
      brandFilter: "All Brands",
      lowStock: "Low Stock Alert",
      edit: "Edit",
      delete: "Delete",
      save: "Save Part",
      cancel: "Cancel",
      partDetails: "Part Details",
      pricing: "Pricing & GST",
      billingPrice: "Selling Price",
      costPrice: "Purchase Price",
      gstPercent: "GST %",
      rackLoc: "Rack Location",
      stock: "Stock Quantity",
      warningLevel: "Warning Limit",
      labelTitle: "Generate Spares Label Barcode"
    },
    hi: {
      title: "इन्वेंटरी सूची",
      addBtn: "स्पेयर पार्ट जोड़ें",
      searchPlaceholder: "पार्ट, वाहन, पार्ट नंबर से खोजें...",
      catFilter: "सभी श्रेणियां",
      brandFilter: "सभी ब्रांड",
      lowStock: "कम स्टॉक चेतावनी",
      edit: "संपादित करें",
      delete: "हटाएं",
      save: "पार्ट सहेजें",
      cancel: "रद्द करें",
      partDetails: "पार्ट विवरण",
      pricing: "मूल्य निर्धारण और जीएसटी",
      billingPrice: "विक्रय मूल्य",
      costPrice: "क्रय मूल्य",
      gstPercent: "जीएसटी %",
      rackLoc: "रैक स्थान",
      stock: "स्टॉक मात्रा",
      warningLevel: "चेतावनी सीमा",
      labelTitle: "स्पेयर लेबल बारकोड बनाएं"
    }
  }[lang];

  return (
    <div className="space-y-6">
      
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">{t.title}</h2>
          <p className="text-sm text-slate-500">Track, update and categorize automobile spare parts.</p>
        </div>
        <button
          id="inv-add-part-btn"
          onClick={openAddForm}
          className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-4 py-2.5 rounded-xl text-sm flex items-center gap-2 cursor-pointer shadow-xs transition-colors self-end sm:self-auto"
        >
          <Plus className="w-5 h-5" />
          <span>{t.addBtn}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
          <input
            id="inv-search-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full bg-slate-50 text-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm border border-slate-200 focus:outline-hidden focus:border-slate-800 focus:bg-white transition-colors"
          />
        </div>

        <div className="flex gap-2 shrink-0">
          <select
            id="inv-cat-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-50 text-slate-800 border border-slate-200 rounded-xl px-3 py-2 text-sm cursor-pointer focus:outline-hidden focus:border-slate-800"
          >
            <option value="">{t.catFilter}</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select
            id="inv-brand-select"
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="bg-slate-50 text-slate-800 border border-slate-200 rounded-xl px-3 py-2 text-sm cursor-pointer focus:outline-hidden focus:border-slate-800"
          >
            <option value="">{t.brandFilter}</option>
            {brands.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
      </div>

      {/* Catalog Table & Visual Cards */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 uppercase tracking-wider text-[10px] text-slate-500">
              <tr>
                <th className="p-4">Part Image / Details</th>
                <th className="p-4">SKU / Vehicle Model</th>
                <th className="p-4">Cost Price</th>
                <th className="p-4">Selling Price (GST Incl.)</th>
                <th className="p-4 text-center">In Stock</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-slate-400">
                    No automobile parts found matching the criteria.
                  </td>
                </tr>
              ) : (
                filteredProducts.map(p => {
                  const isLow = p.stockQuantity <= p.lowStockWarning;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img 
                            referrerPolicy="no-referrer"
                            src={p.imageUrl || "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=300&q=80"} 
                            alt={p.name} 
                            className="w-12 h-12 object-cover rounded-xl border border-slate-100 shadow-2xs"
                          />
                          <div>
                            <p className="font-bold text-slate-800 text-sm">{p.name}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{p.brand} • {p.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-slate-800">{p.partNumber}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{p.vehicleModel}</p>
                      </td>
                      <td className="p-4 font-semibold text-slate-600">₹ {p.purchasePrice}</td>
                      <td className="p-4 font-bold text-emerald-700">
                        ₹ {p.sellingPrice} <span className="text-[9px] text-slate-400 font-normal">({p.gstPercent}% GST)</span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className={`px-3 py-1 rounded-full font-bold text-xs ${
                            isLow ? 'bg-rose-100 text-rose-800 animate-pulse' : 'bg-slate-100 text-slate-800'
                          }`}>
                            {p.stockQuantity}
                          </span>
                          {p.location && (
                            <span className="text-[9px] text-slate-400 mt-1 font-mono uppercase">Rack: {p.location}</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end items-center gap-1.5">
                          <button
                            id={`inv-label-${p.id}`}
                            onClick={() => setLabelProduct(p)}
                            title="Generate Label"
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
                          >
                            <Barcode className="w-4 h-4" />
                          </button>
                          <button
                            id={`inv-edit-${p.id}`}
                            onClick={() => openEditForm(p)}
                            title={t.edit}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg cursor-pointer transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            id={`inv-delete-${p.id}`}
                            onClick={() => {
                              if (window.confirm("Are you sure you want to delete this product?")) {
                                onDeleteProduct(p.id);
                              }
                            }}
                            title={t.delete}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Product Modal Dialog Form */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-950 text-white rounded-t-2xl">
              <h3 className="font-bold text-lg">{editingProduct ? "Edit Product Spares" : "Add Automobile Part"}</h3>
              <button 
                id="inv-close-form"
                onClick={() => setIsFormOpen(false)} 
                className="p-1 hover:bg-slate-800 rounded-full cursor-pointer"
              >
                <X className="w-6 h-6 text-slate-300" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-6">
              
              {/* Core detail row */}
              <div className="space-y-4">
                <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-indigo-500" />
                  {t.partDetails}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Part Name</label>
                    <input
                      id="part-name-input"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Bosch Front Disc Brake Pad"
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-hidden focus:border-slate-800 text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Category</label>
                    <select
                      id="part-cat-select"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-hidden focus:border-slate-800 text-slate-800"
                    >
                      <option value="Electricals">Electricals</option>
                      <option value="Brakes">Brakes</option>
                      <option value="Lubricants">Lubricants</option>
                      <option value="Batteries">Batteries</option>
                      <option value="Body Parts">Body Parts</option>
                      <option value="Engine Parts">Engine Parts</option>
                      <option value="Suspension">Suspension</option>
                      <option value="Accessories">Accessories</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Brand</label>
                    <input
                      id="part-brand-input"
                      type="text"
                      required
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      placeholder="e.g. Brembo / Castrol"
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-hidden focus:border-slate-800 text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Compatible Vehicles</label>
                    <input
                      id="part-vehicle-input"
                      type="text"
                      required
                      value={vehicleModel}
                      onChange={(e) => setVehicleModel(e.target.value)}
                      placeholder="e.g. Swift 2018-22 / Baleno"
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-hidden focus:border-slate-800 text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Manufacturer Part Number (MPN)</label>
                    <input
                      id="part-mpn-input"
                      type="text"
                      required
                      value={partNumber}
                      onChange={(e) => setPartNumber(e.target.value)}
                      placeholder="e.g. BOS-BP-9921"
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-hidden focus:border-slate-800 text-slate-800 font-mono uppercase"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Barcode (EAN-13)</label>
                    <input
                      id="part-barcode-input"
                      type="text"
                      value={barcode}
                      onChange={(e) => setBarcode(e.target.value)}
                      placeholder="Auto-generated if empty"
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-hidden focus:border-slate-800 text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Product Image URL (Unsplash/Imgur)</label>
                    <input
                      id="part-img-input"
                      type="text"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-hidden focus:border-slate-800 text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* Pricing, stock, GST and Warning levels */}
              <div className="space-y-4">
                <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-emerald-600" />
                  {t.pricing}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">{t.costPrice} (₹)</label>
                    <input
                      id="part-cost-input"
                      type="number"
                      required
                      value={purchasePrice}
                      onChange={(e) => setPurchasePrice(Number(e.target.value))}
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-hidden focus:border-slate-800 text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">{t.billingPrice} (₹)</label>
                    <input
                      id="part-sell-input"
                      type="number"
                      required
                      value={sellingPrice}
                      onChange={(e) => setSellingPrice(Number(e.target.value))}
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-hidden focus:border-slate-800 text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">{t.gstPercent}</label>
                    <select
                      id="part-gst-select"
                      value={gstPercent}
                      onChange={(e) => setGstPercent(Number(e.target.value))}
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-hidden focus:border-slate-800 text-slate-800"
                    >
                      <option value={0}>0% (Exempt)</option>
                      <option value={5}>5% (Basic)</option>
                      <option value={12}>12% (Standard)</option>
                      <option value={18}>18% (Automotive Parts Standard)</option>
                      <option value={28}>28% (Batteries / Spark Plugs)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">{t.rackLoc}</label>
                    <input
                      id="part-loc-input"
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Rack A-12"
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-hidden focus:border-slate-800 text-slate-800 font-mono uppercase"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">{t.stock}</label>
                    <input
                      id="part-stock-input"
                      type="number"
                      required
                      value={stockQuantity}
                      onChange={(e) => setStockQuantity(Number(e.target.value))}
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-hidden focus:border-slate-800 text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">{t.warningLevel}</label>
                    <input
                      id="part-warning-input"
                      type="number"
                      required
                      value={lowStockWarning}
                      onChange={(e) => setLowStockWarning(Number(e.target.value))}
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-hidden focus:border-slate-800 text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  id="part-form-cancel"
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 text-sm font-semibold border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-700 cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button
                  id="part-form-save"
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

      {/* Barcode / Print Label Modal Dialog */}
      {labelProduct && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-fade-in text-slate-800">
            <div className="p-4 border-b border-slate-100 bg-slate-900 text-white flex justify-between items-center">
              <h3 className="font-bold text-sm flex items-center gap-1.5">
                <Barcode className="w-5 h-5 text-emerald-400" />
                {t.labelTitle}
              </h3>
              <button onClick={() => setLabelProduct(null)} className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 text-center space-y-6">
              
              {/* Actual Spares Label Mock */}
              <div id="print-label-area" className="border-2 border-dashed border-slate-300 p-4 rounded-xl mx-auto max-w-[280px] bg-slate-50 space-y-3 font-mono">
                <div className="text-left text-[10px]">
                  <p className="font-bold text-slate-900 text-xs truncate">{labelProduct.name}</p>
                  <p className="text-slate-500">MPN: {labelProduct.partNumber}</p>
                  <p className="text-slate-500">Comp: {labelProduct.vehicleModel}</p>
                  {labelProduct.location && <p className="text-indigo-600 font-extrabold text-[9px]">RACK: {labelProduct.location}</p>}
                </div>

                {/* Simulated Barcode */}
                <div className="bg-white p-2 rounded-lg flex flex-col items-center justify-center border border-slate-200">
                  <div className="flex gap-0.5 justify-center h-8 w-full">
                    {[...Array(24)].map((_, idx) => (
                      <div 
                        key={idx} 
                        className="bg-slate-900" 
                        style={{ width: idx % 3 === 0 ? '4px' : idx % 5 === 0 ? '1px' : '2px' }} 
                      />
                    ))}
                  </div>
                  <span className="text-[9px] text-slate-500 mt-1">{labelProduct.barcode}</span>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-slate-200 text-left">
                  <div>
                    <p className="text-[8px] text-slate-400">MRP (GST Incl.)</p>
                    <p className="font-extrabold text-slate-900 text-xs">₹ {labelProduct.sellingPrice}</p>
                  </div>
                  <div className="p-1 bg-white border border-slate-200 rounded-sm">
                    <QrCode className="w-6 h-6 text-slate-800" />
                  </div>
                </div>
              </div>

              {/* Instructions and Print Buttons */}
              <div className="space-y-2">
                <p className="text-xs text-slate-500 leading-relaxed">
                  Apply this label directly to parts storage containers or product shelves for easy mobile scan cataloging.
                </p>
                <div className="flex gap-2 justify-center pt-2">
                  <button 
                    id="btn-print-action"
                    onClick={() => window.print()} 
                    className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <Printer className="w-4 h-4" />
                    Print Label
                  </button>
                  <button 
                    onClick={() => setLabelProduct(null)} 
                    className="border border-slate-200 hover:bg-slate-50 text-xs font-bold px-4 py-2 rounded-xl text-slate-600 cursor-pointer transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
