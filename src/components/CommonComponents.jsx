import React, { useState, useEffect } from 'react';
import { LogIn, Package, Calendar } from 'lucide-react';

// --- COMPONENTE DE PIE DE PÁGINA ---
export const Footer = () => (
  <footer className="mt-auto py-8 border-t border-slate-200 text-center text-slate-400 px-4 print:hidden">
    <p className="text-[9px] md:text-[10px] font-black tracking-[0.1em] md:tracking-[0.2em] uppercase leading-relaxed">
      TODOS LOS DERECHOS DE AUTOR RESERVADOS ©<br className="block md:hidden" /> - DISTRIBUCIONES CASTILLA S.A.S.
    </p>
  </footer>
);

// --- COMPONENTE DE RELOJ ---
export const RealTimeClock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-white text-[#134b60] p-6 rounded-3xl shadow-sm flex items-center justify-between border-b-4 border-[#2596be]">
      <div>
        <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest mb-1">FECHA Y HORA ACTUAL</p>
        <p className="text-xs font-black flex items-center gap-2 text-[#2596be]">
          <Calendar size={14} className="text-[#2596be]" />
          {time.toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).toUpperCase()}
        </p>
      </div>
      <div className="text-right">
        <p className="text-3xl font-black font-mono tracking-tighter text-[#134b60]">
          {time.toLocaleTimeString('es-CO', { hour12: true })}
        </p>
      </div>
    </div>
  );
};

// --- COMPONENTE DE LOGIN ---
export const Login = ({ onLogin, logoImage }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!onLogin(email, password)) {
      setError('CREDENCIALES INVÁLIDAS. VERIFIQUE CORREO O CONTRASEÑA.');
    }
  };

  return (
    <div className="min-h-screen bg-[#e9f4f8] flex items-center justify-center p-4 uppercase">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl shadow-[#2596be]/10 p-6 md:p-10 border border-[#2596be]/20">
        <div className="flex flex-col items-center mb-8 md:mb-10 text-center">
          <div className="w-16 h-16 md:w-24 md:h-24 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-[#2596be]/20 overflow-hidden p-2 border-2 border-[#e9f4f8]">
             <img src={logoImage} alt="Logo DC" className="w-full h-full object-contain" onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='block'; }} />
             <Package size={36} className="text-[#2596be] hidden" />
          </div>
          <h1 className="text-xl md:text-2xl font-black text-[#134b60] tracking-[0.2em] md:tracking-[0.3em] uppercase">INVENTRACK</h1>
          <p className="text-[10px] md:text-[11px] text-[#2596be] font-black tracking-[0.15em] mt-3 uppercase">DISTRIBUCIONES CASTILLA S.A.S.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border-2 border-rose-200 text-rose-600 font-black text-[10px] text-center rounded-xl animate-in fade-in">
            {error}
          </div>
        )}

        <form className="space-y-5 md:space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-[#134b60] tracking-widest uppercase">CORREO ELECTRÓNICO</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 md:py-4 rounded-xl border-2 border-[#e9f4f8] focus:border-[#2596be] outline-none uppercase font-bold text-sm transition-all bg-slate-50 focus:bg-white text-[#134b60]" required />
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-[#134b60] tracking-widest uppercase">CONTRASEÑA</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 md:py-4 rounded-xl border-2 border-[#e9f4f8] focus:border-[#2596be] outline-none uppercase font-bold text-sm transition-all bg-slate-50 focus:bg-white text-[#134b60]" required />
          </div>
          <button type="submit" className="w-full bg-[#2596be] hover:bg-[#1e7a9b] text-white font-black py-4 rounded-xl transition-all shadow-xl shadow-[#2596be]/30 active:scale-95 text-xs md:text-sm uppercase flex items-center justify-center gap-2">
            <LogIn size={18} /> ACCEDER AL SISTEMA
          </button>
        </form>
      </div>
    </div>
  );
};