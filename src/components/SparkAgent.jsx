import '../SparkAgent.css';
import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, Minus } from 'lucide-react';

export const SparkAgent = ({ isOpen, setIsOpen, mapLat, mapLng }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  // Auto-scroll to latest intelligence
  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
  // ⚡ Spark "Wake Up" Greeting
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{ 
        role: 'spark', 
        text: "Greetings! I am Spark, your Safe Land Intelligence guide. How can I assist you with the map today?" 
      }]);
    }
  }, [isOpen]);
  // 🚀 THE BRAIN CONNECTION ENGINE
  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('https://spark-brain-155922397359.us-central1.run.app/api/spark/chat', {
        method: 'POST',
        mode: 'cors',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json' 
        },
        body: JSON.stringify({
          message: input,
          role_id: "2",
          map_center_lat: mapLat || 17.3850,
          map_center_lng: mapLng || 78.4867
        })
      });

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'spark', text: data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'spark', text: "⚠️ Signal lost. Brain offline." }]);
    } finally {
      setLoading(false);
    }
  };

  // 🖱️ THE FLOATING TOGGLE: Only shows when Spark is closed
  if (!isOpen) return (
    <button onClick={() => setIsOpen(true)} className="fixed bottom-6 right-6 p-4 bg-cyan-600 text-white rounded-full shadow-2xl animate-bounce z-[5000] border-2 border-white/20">
      <MessageSquare size={24} />
    </button>
  );

  return (
    <div className="fixed bottom-6 right-6 w-80 md:w-96 h-[500px] bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-3xl shadow-2xl flex flex-col overflow-hidden z-[5000] animate-in slide-in-from-bottom-5">
      {/* 🏷️ HEADER: Identity Enforcement */}
      <div className="bg-gradient-to-r from-cyan-700 to-blue-800 p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          <span className="font-black text-xs tracking-widest text-white uppercase">Spark Intelligence</span>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-white/50 hover:text-white"><Minus size={20}/></button>
      </div>

     {/* 🧠 CHAT AREA: Narrative Flow */}
<div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth custom-scrollbar spark-glass">
  {messages.map((m, i) => (
    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-spark-in`}>
      <div className={`max-w-[80%] p-3 rounded-2xl text-[11px] shadow-lg leading-relaxed ${
        m.role === 'user' 
          ? 'bg-cyan-600 text-white rounded-tr-none' 
          : 'bg-slate-800/90 text-slate-100 border border-cyan-500/20 rounded-tl-none'
      }`}>
        {m.text}
      </div>
    </div>
  ))}
  {loading && (
    <div className="flex items-center gap-2 text-[10px] text-cyan-400 font-mono animate-pulse italic">
      <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
      Spark is analyzing...
    </div>
  )}
  <div ref={scrollRef} />
</div>

      {/* ✍️ INPUT: The Gateway */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/50">
        <div className="flex gap-2 bg-slate-800 border border-slate-700 rounded-xl p-2 focus-within:border-cyan-500 transition-colors">
          <input 
            value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask about local land..." className="flex-1 bg-transparent text-xs text-white outline-none px-2"
          />
          <button onClick={sendMessage} className="p-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 transition-all active:scale-95"><Send size={16}/></button>
        </div>
      </div>
    </div>
  );
};