import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Send, X, Bot, RefreshCw, AlertTriangle, TrendingUp, Lightbulb } from 'lucide-react';
import { Product, JobCard } from '../types';

interface AiAssistantProps {
  products: Product[];
  jobCards: JobCard[];
  salesData: { todaySales: number; monthlySales: number };
  activeRole: string;
  lang: 'en' | 'hi';
}

export default function AiAssistant({ products, jobCards, salesData, activeRole, lang }: AiAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    { role: 'assistant', content: lang === 'en' ? 'Hello! I am your Happy Auto AI Assistant. Ask me anything about stock, sales, mechanic assignments, or business optimizations.' : 'नमस्ते! मैं आपका हैप्पी ऑटो एआई सहायक हूं। मुझसे स्टॉक, बिक्री, मैकेनिक असाइनमेंट या व्यवसाय अनुकूलन के बारे में कुछ भी पूछें।' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<{ summary: string; recommendations: string[] } | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [stockPredictions, setStockPredictions] = useState<{ part: string; confidence: string; reason: string }[]>([]);
  const [loadingStockPredict, setLoadingStockPredict] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const fetchInsights = async () => {
    setLoadingInsights(true);
    try {
      const lowStockCount = products.filter(p => p.stockQuantity <= p.lowStockWarning).length;
      const res = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          salesData,
          lowStockCount,
          jobCount: jobCards.length,
          activeRole
        })
      });
      const data = await res.json();
      setInsights(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingInsights(false);
    }
  };

  const fetchStockPredictions = async () => {
    setLoadingStockPredict(true);
    try {
      const res = await fetch('/api/ai/inventory-predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categories: Array.from(new Set(products.map(p => p.category))),
          productsList: products.slice(0, 10).map(p => ({
            name: p.name,
            stock: p.stockQuantity,
            lowStock: p.lowStockWarning,
            brand: p.brand,
            vehicle: p.vehicleModel
          }))
        })
      });
      const data = await res.json();
      setStockPredictions(data.recommendations || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingStockPredict(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchInsights();
      fetchStockPredictions();
    }
  }, [isOpen, products.length, jobCards.length]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    if (!textToSend) setInput('');
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setLoading(true);

    try {
      const lowStockCount = products.filter(p => p.stockQuantity <= p.lowStockWarning).length;
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content: text }],
          context: {
            lowStockCount,
            jobCount: jobCards.length,
            role: activeRole
          }
        })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'assistant', content: lang === 'en' ? 'Sorry, I failed to process that request.' : 'क्षमा करें, मैं उस अनुरोध को संसाधित करने में विफल रहा।' }]);
    } finally {
      setLoading(false);
    }
  };

  const t = {
    en: {
      title: "Happy Auto AI Advisor",
      subtitle: "Smart insights, search & auto-predictions",
      askAnything: "Ask about your garage or spares shop...",
      insightsTab: "AI Business Insights",
      predictTab: "Restock Predictor",
      quickPrompts: "Quick Actions",
      loading: "AI is thinking...",
      lowStockAdvice: "How to fix low stock?",
      mechanicAdvice: "Analyze mechanic workload",
      salesAdvice: "Suggest marketing ideas"
    },
    hi: {
      title: "हैप्पी ऑटो एआई सलाहकार",
      subtitle: "स्मार्ट अंतर्दृष्टि, खोज और ऑटो-भविष्यवाणी",
      askAnything: "अपने गैरेज या पार्ट्स शॉप के बारे में पूछें...",
      insightsTab: "एआई व्यापार अंतर्दृष्टि",
      predictTab: "स्टॉक भविष्यवाणी",
      quickPrompts: "त्वरित क्रियाएं",
      loading: "एआई सोच रहा है...",
      lowStockAdvice: "कम स्टॉक कैसे ठीक करें?",
      mechanicAdvice: "मैकेनिक कार्यभार विश्लेषण",
      salesAdvice: "मार्केटिंग विचार सुझाएं"
    }
  }[lang];

  return (
    <>
      {/* Floating Action Button */}
      <button
        id="ai-floating-btn"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-6 md:bottom-6 z-40 bg-gradient-to-r from-emerald-600 to-teal-500 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2 animate-bounce cursor-pointer"
      >
        <Sparkles className="w-5 h-5 animate-pulse" />
        <span className="text-sm font-semibold hidden md:inline">AI Advisor</span>
      </button>

      {/* Slide-over Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-in relative">
            
            {/* Header */}
            <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-600 rounded-lg">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    {t.title}
                    <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
                  </h3>
                  <p className="text-xs text-slate-300">{t.subtitle}</p>
                </div>
              </div>
              <button 
                id="ai-close-btn"
                onClick={() => setIsOpen(false)} 
                className="p-1 hover:bg-slate-800 rounded-full cursor-pointer"
              >
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            {/* Main Content Areas */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              
              {/* AI Assistant Chat Bubble Box */}
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Bot className="w-3.5 h-3.5 text-slate-600" />
                  Chat Assistant
                </div>
                <div className="h-60 overflow-y-auto space-y-3 mb-3 pr-1 text-sm">
                  {messages.map((m, idx) => (
                    <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] rounded-xl px-3 py-2 ${m.role === 'user' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-800'}`}>
                        {m.content}
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="flex justify-start">
                      <div className="bg-slate-200 text-slate-500 rounded-xl px-3 py-2 flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                        <span>{t.loading}</span>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Bar */}
                <div className="flex gap-2">
                  <input
                    id="ai-input"
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder={t.askAnything}
                    className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-hidden focus:border-emerald-600"
                  />
                  <button
                    id="ai-send-btn"
                    onClick={() => handleSend()}
                    className="bg-slate-900 text-white p-2 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>

                {/* Quick Prompts */}
                <div className="mt-3">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">{t.quickPrompts}</span>
                  <div className="flex flex-wrap gap-1.5">
                    <button id="qp-1" onClick={() => handleSend(t.lowStockAdvice)} className="text-xs bg-white hover:bg-emerald-50 text-slate-700 border border-slate-200 px-2.5 py-1 rounded-full cursor-pointer">{t.lowStockAdvice}</button>
                    <button id="qp-2" onClick={() => handleSend(t.mechanicAdvice)} className="text-xs bg-white hover:bg-emerald-50 text-slate-700 border border-slate-200 px-2.5 py-1 rounded-full cursor-pointer">{t.mechanicAdvice}</button>
                    <button id="qp-3" onClick={() => handleSend(t.salesAdvice)} className="text-xs bg-white hover:bg-emerald-50 text-slate-700 border border-slate-200 px-2.5 py-1 rounded-full cursor-pointer">{t.salesAdvice}</button>
                  </div>
                </div>
              </div>

              {/* Dynamic Business Insights Section */}
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                <div className="flex justify-between items-center mb-3">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    {t.insightsTab}
                  </div>
                  <button onClick={fetchInsights} title="Refresh Insights" className="text-slate-400 hover:text-emerald-600 transition-colors">
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingInsights ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                {loadingInsights ? (
                  <div className="space-y-2 py-4">
                    <div className="h-4 bg-slate-200 rounded-sm animate-pulse w-3/4"></div>
                    <div className="h-4 bg-slate-200 rounded-sm animate-pulse w-5/6"></div>
                    <div className="h-4 bg-slate-200 rounded-sm animate-pulse w-1/2"></div>
                  </div>
                ) : insights ? (
                  <div className="space-y-3">
                    <p className="text-xs text-slate-600 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-100">{insights.summary}</p>
                    <div className="space-y-1.5">
                      {insights.recommendations?.map((rec, i) => (
                        <div key={i} className="flex gap-2 items-start text-xs text-slate-700">
                          <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                          <span>{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 text-center py-2">No insights compiled. Click refresh above.</div>
                )}
              </div>

              {/* Restock Predictor */}
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                <div className="flex justify-between items-center mb-3">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-emerald-600" />
                    {t.predictTab}
                  </div>
                  <button onClick={fetchStockPredictions} title="Refresh Predictions" className="text-slate-400 hover:text-emerald-600 transition-colors">
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingStockPredict ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                {loadingStockPredict ? (
                  <div className="space-y-2 py-4">
                    <div className="h-10 bg-slate-200 rounded-sm animate-pulse"></div>
                    <div className="h-10 bg-slate-200 rounded-sm animate-pulse"></div>
                  </div>
                ) : stockPredictions.length > 0 ? (
                  <div className="space-y-2.5">
                    {stockPredictions.map((pred, i) => (
                      <div key={i} className="bg-white p-2.5 rounded-lg border border-slate-100 flex flex-col gap-1">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-slate-800">{pred.part}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${pred.confidence === 'High' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                            {pred.confidence} Confidence
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">{pred.reason}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 text-center py-2">Predictor is ready. Click refresh above to generate.</div>
                )}
              </div>

            </div>

            {/* Footer Tag */}
            <div className="p-3 bg-slate-100 border-t border-slate-200 text-center text-[10px] text-slate-400">
              Happy Auto AI ERP • Smart Spares Workshop Assistant
            </div>

          </div>
        </div>
      )}
    </>
  );
}
