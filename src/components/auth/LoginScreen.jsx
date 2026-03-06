import React, { useState } from 'react';
import { Lock, User, LogIn } from 'lucide-react';

export default function LoginScreen({ setIsAuthenticated, setUserRole, config, setUsernameInput }) {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');

  const handleLogin = () => {
    if (!config.passwords) return alert("Erro: Configurações não carregadas.");
    
    if (user.toLowerCase() === 'admin' && pass === config.passwords.admin) {
      setUserRole('admin');
      setUsernameInput('Administrador');
      setIsAuthenticated(true);
    } else if (pass === config.passwords.professor) {
      setUserRole('professor');
      setUsernameInput(user || 'Professor');
      setIsAuthenticated(true);
    } else {
      alert("Credenciais incorretas!");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-md p-8 rounded-[2.5rem] shadow-2xl border border-slate-200">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-indigo-600 p-4 rounded-2xl mb-4 text-white shadow-lg shadow-indigo-200">
            <LogIn size={32} />
          </div>
          <h2 className="text-2xl font-black text-slate-800">Gestão Anísio</h2>
          <p className="text-slate-400 font-bold text-sm">Acesso ao Sistema</p>
        </div>
        
        <div className="space-y-4">
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border outline-none focus:ring-4 focus:ring-indigo-500/10 font-bold" 
                   placeholder="Seu Nome" value={user} onChange={e => setUser(e.target.value)} />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border outline-none focus:ring-4 focus:ring-indigo-500/10 font-bold" 
                   type="password" placeholder="Senha" value={pass} onChange={e => setPass(e.target.value)} />
          </div>
          <button onClick={handleLogin} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-500/30 hover:scale-[1.02] transition-transform">
            ENTRAR NO SISTEMA
          </button>
        </div>
      </div>
    </div>
  );
}