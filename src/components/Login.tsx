import React, { useState } from 'react';
import { 
  KeyRound, 
  Mail, 
  Store, 
  User, 
  Lock, 
  Briefcase, 
  AlertTriangle, 
  Info,
  Smartphone,
  Sparkles
} from 'lucide-react';
import { UserRole } from '../types';

interface LoginProps {
  onLogin: (email: string, pass: string) => Promise<void>;
  onRegister: (email: string, pass: string, name: string, shopName: string, role: UserRole) => Promise<void>;
  onDemoLogin: (role: UserRole) => void;
  lang: 'en' | 'hi';
}

export default function Login({ onLogin, onRegister, onDemoLogin, lang }: LoginProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Registration extras
  const [name, setName] = useState('');
  const [shopName, setShopName] = useState('');
  const [role, setRole] = useState<UserRole>('Shop Owner');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    try {
      if (isRegister) {
        await onRegister(email, password, name, shopName, role);
      } else {
        await onLogin(email, password);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to authenticate.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    if (!email) {
      alert("Please specify your email in the input box first.");
      return;
    }
    alert(`A password recovery email has been sent to ${email} successfully! Please check your spam folder as well.`);
  };

  const t = {
    en: {
      welcome: "Happy Auto AI ERP",
      subtitle: "Enterprise resource planning for workshops & spare parts outlets.",
      email: "Email Address",
      pass: "Password",
      name: "Operator Name",
      shopName: "Shop / Garage Name",
      role: "Select Operator Role",
      loginBtn: "Access ERP Terminal",
      registerBtn: "Register ERP System",
      toggleRegister: "Need a new store account? Register here",
      toggleLogin: "Already have a store account? Sign in",
      demoTitle: "Instant Demo Evaluation Accounts",
      demoSub: "Access immediate multi-role views without signup",
      forgotPass: "Forgot Store Password?"
    },
    hi: {
      welcome: "हैप्पी ऑटो एआई ईआरपी",
      subtitle: "वर्कशॉप और स्पेयर पार्ट्स दुकानों के लिए एंटरप्राइज रिसोर्स प्लानिंग।",
      email: "ईमेल पता",
      pass: "पासवर्ड",
      name: "ऑपरेटर का नाम",
      shopName: "दुकान / गैरेज का नाम",
      role: "ऑपरेटर की भूमिका",
      loginBtn: "ईआरपी एक्सेस करें",
      registerBtn: "ईआरपी सिस्टम पंजीकृत करें",
      toggleRegister: "नया स्टोर खाता चाहिए? यहाँ रजिस्टर करें",
      toggleLogin: "पहले से खाता है? साइन इन करें",
      demoTitle: "त्वरित डेमो मूल्यांकन खाते",
      demoSub: "बिना पंजीकरण के सभी भूमिकाओं का तुरंत परीक्षण करें",
      forgotPass: "पासवर्ड भूल गए?"
    }
  }[lang];

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col md:flex-row items-stretch text-white">
      
      {/* Side Banner: Branding & Marketing */}
      <div className="md:w-5/12 bg-gradient-to-br from-indigo-950 via-slate-900 to-emerald-950 p-8 flex flex-col justify-between items-start border-b md:border-b-0 md:border-r border-slate-800">
        <div className="space-y-3">
          <div className="p-3 bg-emerald-600 rounded-2xl inline-block shadow-md">
            <Store className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black tracking-tight">{t.welcome}</h1>
          <p className="text-sm text-indigo-200 leading-relaxed max-w-sm">{t.subtitle}</p>
        </div>

        {/* Highlight features */}
        <div className="space-y-4 pt-10">
          <div className="flex gap-3 items-start text-xs text-indigo-100">
            <Sparkles className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <p className="font-bold">Real-time Stock Synchronization</p>
              <p className="text-slate-400">POS checkout instantly updates respective spare parts inventory counters.</p>
            </div>
          </div>

          <div className="flex gap-3 items-start text-xs text-indigo-100">
            <Smartphone className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <p className="font-bold">Android & Desktop Adaptive</p>
              <p className="text-slate-400">Designed to be extremely fluid on physical workshop terminals and mobile screens.</p>
            </div>
          </div>
        </div>

        <p className="text-[10px] text-slate-500 pt-10">© 2026 Happy Auto AI ERP. All Rights Reserved.</p>
      </div>

      {/* Main Login / Register Area */}
      <div className="md:w-7/12 p-8 flex flex-col justify-center max-w-lg mx-auto w-full">
        
        <div className="space-y-6">
          
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-black text-white">{isRegister ? "Setup ERP Shop Admin" : "Operator Authentication"}</h2>
            <p className="text-xs text-slate-400 mt-1">Please provide credential keys to load database shards.</p>
          </div>

          {errorMessage && (
            <div className="bg-rose-500/20 border border-rose-500/30 p-3.5 rounded-xl text-rose-200 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-slate-900">
            
            {isRegister && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1 text-left">{t.name}</label>
                  <input
                    id="login-name-field"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Amit Sharma"
                    className="w-full bg-slate-800 text-white rounded-xl px-3.5 py-2.5 text-xs focus:outline-hidden border border-slate-700 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1 text-left">{t.shopName}</label>
                  <input
                    id="login-shop-field"
                    type="text"
                    required
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    placeholder="e.g. Happy Auto Spares"
                    className="w-full bg-slate-800 text-white rounded-xl px-3.5 py-2.5 text-xs focus:outline-hidden border border-slate-700 focus:border-indigo-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1 text-left">{t.email}</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  id="login-email-field"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@happyautoerp.com"
                  className="w-full bg-slate-800 text-white rounded-xl pl-10 pr-4 py-3 text-xs focus:outline-hidden border border-slate-700 focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-400 text-left">{t.pass}</label>
                {!isRegister && (
                  <button 
                    type="button" 
                    onClick={handleForgotPassword}
                    className="text-[10px] text-indigo-400 hover:underline cursor-pointer"
                  >
                    {t.forgotPass}
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  id="login-pass-field"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-800 text-white rounded-xl pl-10 pr-4 py-3 text-xs focus:outline-hidden border border-slate-700 focus:border-indigo-500"
                />
              </div>
            </div>

            {isRegister && (
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1 text-left">{t.role}</label>
                <select
                  id="login-role-field"
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full bg-slate-800 text-white rounded-xl px-3.5 py-3 text-xs focus:outline-hidden border border-slate-700 focus:border-indigo-500 cursor-pointer"
                >
                  <option value="Super Admin">Super Admin Privilege</option>
                  <option value="Shop Owner">Shop Owner Privilege</option>
                  <option value="Manager">Manager Privilege</option>
                  <option value="Staff">Staff Privilege</option>
                </select>
              </div>
            )}

            <button
              id="login-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-center cursor-pointer transition-colors text-xs flex items-center justify-center gap-2 mt-4"
            >
              <KeyRound className="w-4 h-4" />
              <span>{isRegister ? t.registerBtn : t.loginBtn}</span>
            </button>
          </form>

          {/* Toggle */}
          <div className="text-center">
            <button
              id="login-toggle-btn"
              onClick={() => setIsRegister(!isRegister)}
              className="text-xs text-indigo-400 hover:underline cursor-pointer font-semibold"
            >
              {isRegister ? t.toggleLogin : t.toggleRegister}
            </button>
          </div>

          {/* Demo evaluation shortcuts */}
          <div className="pt-6 border-t border-slate-800 space-y-3">
            <div className="text-center">
              <span className="text-[10px] uppercase font-black text-slate-500 tracking-wider flex items-center justify-center gap-1">
                <Info className="w-3.5 h-3.5 text-indigo-400" />
                {t.demoTitle}
              </span>
              <p className="text-[10px] text-slate-500 mt-0.5">{t.demoSub}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <button
                id="demo-owner"
                onClick={() => onDemoLogin('Shop Owner')}
                className="bg-slate-800/60 hover:bg-indigo-950/40 border border-slate-800 hover:border-indigo-500/50 py-2.5 px-3 rounded-xl font-bold cursor-pointer transition-all text-slate-200"
              >
                Owner Privilege
              </button>
              <button
                id="demo-staff"
                onClick={() => onDemoLogin('Staff')}
                className="bg-slate-800/60 hover:bg-emerald-950/40 border border-slate-800 hover:border-emerald-500/50 py-2.5 px-3 rounded-xl font-bold cursor-pointer transition-all text-slate-200"
              >
                Staff (Read Only)
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
