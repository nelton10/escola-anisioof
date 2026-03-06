import React, { useState } from 'react';
import { auth } from '../../firebase/config';
import { signInAnonymously } from 'firebase/auth';
import { Lock, User, LogIn, ShieldCheck } from 'lucide-react';

export default function LoginScreen({ setUserRole, config, setUsernameInput }) {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async () => {
    if (!config.passwords) return alert("Erro: Configurações do Firebase não carregadas. Aguarde o reset da cota.");
    
    setIsLoggingIn(true);
    try {
      let role = '';
      let finalName = user || 'Professor';

      // Validação da Lógica de Acesso
      if (user.toLowerCase() === 'admin' && pass === config.passwords.admin) {
        role = 'admin';
        finalName = 'Administrador';
      } else if (pass === config.passwords.professor) {
        role = 'professor';
      } else {
        throw new Error("Senha incorreta");
      }

      // 1. GRAVAÇÃO NO LOCALSTORAGE (O segredo para o F5 não deslogar)
      localStorage.setItem('userRole', role);
      localStorage.setItem('username', finalName);
      
      // 2. AUTENTICAÇÃO NO FIREBASE (Cria a sessão oficial no Google)
      // Isso dispara o onAuthStateChanged lá no App.jsx
      await signInAnonymously(auth);
      
      setUserRole(role);
      setUsernameInput(finalName);

    } catch (e) {
      alert("Erro de Acesso: Verifique suas credenciais.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-md p-10 rounded-[3rem] shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-500">
        <div className="flex flex-col items-center mb-10">
          <div className="bg-indigo-600 p-5 rounded-3xl mb-4 text-white shadow-xl shadow-indigo-100">
            <ShieldCheck size={40} />
          </div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tighter">Anísio Digital</h2>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">EEMTI Anísio Teixeira</p>
        </div>
        
        <div className="space-y-5">
          <div className="relative group">
            <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
            <input 
              className="w-full pl-14 pr-6 py-5 rounded-2xl bg-slate-50 border-2 border-transparent outline-none focus:border-indigo-600 focus:bg-white font-bold transition-all" 
              placeholder="Seu Nome/Identificação" 
              value={user} 
              onChange={e => setUser(e.target.value)} 
            />
          </div>
          
          <div className="relative group">
            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
            <input 
              className="w-full pl-14 pr-6 py-5 rounded-2xl bg-slate-50 border-2 border-transparent outline-none focus:border-indigo-600 focus:bg-white font-bold transition-all" 
              type="password" 
              placeholder="Senha de Acesso" 
              value={pass} 
              onChange={e => setPass(e.target.value)} 
            />
          </div>

          <button 
            onClick={handleLogin} 
            disabled={isLoggingIn}
            className="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all flex justify-center items-center gap-2"
          >
            {isLoggingIn ? "VALIDANDO..." : <><LogIn size={20} /> ENTRAR AGORA</>}
          </button>
        </div>
        
        <p className="text-center mt-8 text-[10px] text-slate-300 font-bold uppercase tracking-tighter">
          Sistema de Gestão Escolar v3.0 • F5 Protect Ativo
        </p>
      </div>
    </div>
  );
}
