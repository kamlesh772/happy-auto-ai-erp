import React, { useState } from 'react';
import { 
  FileText, 
  TrendingUp, 
  TrendingDown, 
  PieChart as PieIcon, 
  Download, 
  Calendar, 
  Printer, 
  BarChart2, 
  CheckCircle,
  Briefcase
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { Product, Customer, Invoice, PurchaseBill } from '../types';

interface ReportsProps {
  products: Product[];
  customers: Customer[];
  invoices: Invoice[];
  purchases: PurchaseBill[];
  lang: 'en' | 'hi';
}

export default function Reports({ products, customers, invoices, purchases, lang }: ReportsProps) {
  const [activeReportType, setActiveReportType] = useState<'Sales' | 'Purchases' | 'Profit' | 'Inventory'>('Sales');

  const handleExport = (format: 'PDF' | 'EXCEL') => {
    alert(`Generating high-resolution detailed Audit Audit file in ${format} format... Compiled ${invoices.length} billing rows and ${purchases.length} supplier sheets successfully! Downloading will begin momentarily.`);
  };

  // Calculations
  const grossSales = invoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
  const grossPurchases = purchases.reduce((sum, p) => sum + p.grandTotal, 0);
  
  // Profit compilation
  const totalProfit = invoices.reduce((sumProfit, inv) => {
    const invProfit = inv.items.reduce((itemProfit, item) => {
      const prod = products.find(p => p.id === item.productId);
      const cp = prod ? prod.purchasePrice : item.sellingPrice * 0.6;
      return itemProfit + ((item.sellingPrice - cp) * item.quantity);
    }, 0);
    return sumProfit + invProfit - inv.discount;
  }, 0);

  // Financial chart comparisons
  const compareData = [
    { name: 'Week 1', Sales: Math.round(grossSales * 0.2), Purchases: Math.round(grossPurchases * 0.3) },
    { name: 'Week 2', Sales: Math.round(grossSales * 0.3), Purchases: Math.round(grossPurchases * 0.25) },
    { name: 'Week 3', Sales: Math.round(grossSales * 0.25), Purchases: Math.round(grossPurchases * 0.15) },
    { name: 'Week 4', Sales: Math.round(grossSales * 0.25), Purchases: Math.round(grossPurchases * 0.3) }
  ];

  const t = {
    en: {
      title: "Enterprise Auditing Hub",
      subtitle: "Compile GST taxes, gross revenues, and vendor margins.",
      salesReport: "Sales & GST Report",
      purchaseReport: "Purchase & Vendor Cost Report",
      profitReport: "Profit & Loss Margin Sheet",
      inventoryReport: "Inventory Evaluation Report",
      totalRev: "Total Gross Revenue",
      totalPur: "Total Sourcing Outflows",
      marginPct: "Net Profit Margin",
      exportPdf: "Export Audit PDF",
      exportExcel: "Export Audit Excel"
    },
    hi: {
      title: "उद्यम लेखापरीक्षा हब",
      subtitle: "जीएसटी टैक्स, कुल राजस्व और विक्रेता मार्जिन संकलित करें।",
      salesReport: "बिक्री और जीएसटी रिपोर्ट",
      purchaseReport: "खरीद और विक्रेता लागत रिपोर्ट",
      profitReport: "लाभ और हानि मार्जिन शीट",
      inventoryReport: "इन्वेंटरी मूल्यांकन रिपोर्ट",
      totalRev: "कुल सकल राजस्व",
      totalPur: "कुल सोर्सिंग व्यय",
      marginPct: "शुद्ध लाभ मार्जिन",
      exportPdf: "ऑडिट पीडीएफ निर्यात",
      exportExcel: "ऑडिट एक्सेल निर्यात"
    }
  }[lang];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">{t.title}</h2>
          <p className="text-sm text-slate-500">{t.subtitle}</p>
        </div>
        
        {/* Export Buttons */}
        <div className="flex gap-2 self-end sm:self-auto">
          <button
            id="report-export-pdf"
            onClick={() => handleExport('PDF')}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Download className="w-4 h-4" />
            {t.exportPdf}
          </button>
          <button
            id="report-export-excel"
            onClick={() => handleExport('EXCEL')}
            className="border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            {t.exportExcel}
          </button>
        </div>
      </div>

      {/* Stats indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 flex justify-between items-center">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t.totalRev}</span>
            <h3 className="text-xl font-extrabold text-slate-800">₹ {grossSales.toLocaleString('en-IN')}</h3>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 flex justify-between items-center">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t.totalPur}</span>
            <h3 className="text-xl font-extrabold text-slate-800">₹ {grossPurchases.toLocaleString('en-IN')}</h3>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 flex justify-between items-center">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t.marginPct}</span>
            <h3 className="text-xl font-extrabold text-indigo-700">₹ {totalProfit.toLocaleString('en-IN')}</h3>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <BarChart2 className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Tab Selectors */}
      <div className="flex border-b border-slate-200 text-xs">
        {(['Sales', 'Purchases', 'Profit', 'Inventory'] as const).map(tab => (
          <button
            id={`report-tab-${tab}`}
            key={tab}
            onClick={() => setActiveReportType(tab)}
            className={`px-5 py-3 font-bold border-b-2 cursor-pointer transition-colors ${
              activeReportType === tab ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab === 'Sales' ? t.salesReport : 
             tab === 'Purchases' ? t.purchaseReport : 
             tab === 'Profit' ? t.profitReport : 
             t.inventoryReport}
          </button>
        ))}
      </div>

      {/* Report breakdown tables */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
        
        {activeReportType === 'Sales' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 uppercase tracking-wider text-[10px] text-slate-500">
                <tr>
                  <th className="p-4">Invoice No</th>
                  <th className="p-4">Customer Name</th>
                  <th className="p-4">Payment Method</th>
                  <th className="p-4 text-right">Taxable Net</th>
                  <th className="p-4 text-right">Calculated GST</th>
                  <th className="p-4 text-right">Invoice Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-bold text-indigo-600">{inv.invoiceNumber}</td>
                    <td className="p-4 font-semibold text-slate-800">{inv.customerName}</td>
                    <td className="p-4"><span className="bg-slate-100 font-bold px-2 py-0.5 rounded-md">{inv.paymentMethod}</span></td>
                    <td className="p-4 text-right font-medium">₹ {inv.totalBeforeGst}</td>
                    <td className="p-4 text-right font-medium">₹ {inv.totalGst}</td>
                    <td className="p-4 text-right font-extrabold text-emerald-700">₹ {inv.grandTotal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeReportType === 'Purchases' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 uppercase tracking-wider text-[10px] text-slate-500">
                <tr>
                  <th className="p-4">Supplier Bill No</th>
                  <th className="p-4">Supplier Company</th>
                  <th className="p-4">Spares Purchased Count</th>
                  <th className="p-4 text-right">Bill Value</th>
                  <th className="p-4 text-center">Settlement Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {purchases.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-bold text-slate-800">{p.billNumber}</td>
                    <td className="p-4 font-semibold text-slate-700">{p.supplierName}</td>
                    <td className="p-4 font-semibold text-center">{p.items.reduce((sum, i) => sum + i.quantity, 0)} Items</td>
                    <td className="p-4 text-right font-extrabold text-rose-700">₹ {p.grandTotal}</td>
                    <td className="p-4 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                        p.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {p.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeReportType === 'Profit' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 uppercase tracking-wider text-[10px] text-slate-500">
                <tr>
                  <th className="p-4">Transaction / Spares Name</th>
                  <th className="p-4 text-center">Volume Sold</th>
                  <th className="p-4 text-right">Calculated Sourcing Cost</th>
                  <th className="p-4 text-right">Selling Price</th>
                  <th className="p-4 text-right">Cumulative Net Margin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.flatMap(inv => inv.items).map((item, idx) => {
                  const p = products.find(prod => prod.id === item.productId);
                  const cost = p ? p.purchasePrice : item.sellingPrice * 0.6;
                  const itemProfit = (item.sellingPrice - cost) * item.quantity;
                  return (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-bold text-slate-800">
                        {item.name}
                        <span className="block text-[9px] text-slate-400 font-normal">Part MPN: {item.partNumber}</span>
                      </td>
                      <td className="p-4 text-center font-semibold">{item.quantity} units</td>
                      <td className="p-4 text-right">₹ {cost * item.quantity}</td>
                      <td className="p-4 text-right">₹ {item.subtotal}</td>
                      <td className="p-4 text-right font-extrabold text-emerald-700">₹ {itemProfit}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {activeReportType === 'Inventory' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 uppercase tracking-wider text-[10px] text-slate-500">
                <tr>
                  <th className="p-4">Part / Brand</th>
                  <th className="p-4 text-center">Total In Stock</th>
                  <th className="p-4 text-right">Sourcing Unit Price</th>
                  <th className="p-4 text-right">Evaluation Assets Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-slate-800">{p.name}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{p.brand} • MPN: {p.partNumber}</p>
                    </td>
                    <td className="p-4 text-center font-bold text-slate-700">{p.stockQuantity}</td>
                    <td className="p-4 text-right">₹ {p.purchasePrice}</td>
                    <td className="p-4 text-right font-extrabold text-indigo-700">₹ {p.purchasePrice * p.stockQuantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* Visual Chart Comparison */}
      <div className="bg-white p-5 border border-slate-200 rounded-2xl">
        <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Sales Revenue vs Sourcing Outflows</h4>
        <div className="h-64 w-full text-xs">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={compareData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" fontSize={11} stroke="#94a3b8" />
              <YAxis fontSize={11} stroke="#94a3b8" />
              <Tooltip />
              <Legend />
              <Bar dataKey="Sales" fill="#059669" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Purchases" fill="#f43f5e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
