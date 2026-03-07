import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useModals } from '../contexts/ModalContext';
import { EscolaLogo } from '../components/ui/EscolaLogo';
import { ArrowRight, Check } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';

export const LoginView = () => {
    const {
        usernameInput, setUsernameInput,
        setIsAuthenticated, setUserRole, setLoggedStudent
    } = useAuth();
    const { showNotification } = useModals();
    const { config } = useAppContext();

    const [passwordInput, setPasswordInput] = React.useState('');
    const [rememberMe, setRememberMe] = React.useState(true);
    const [loginMode, setLoginMode] = React.useState('staff');

    // Pais login fields (Apenas estrutural mantido caso requeira no futuro)
    const [parentTurmaInput, setParentTurmaInput] = React.useState('');
    const [parentNomeInput, setParentNomeInput] = React.useState('');

    const handleLogin = () => {
        if (loginMode === 'staff') {
            if (!usernameInput) { showNotification("Introduza o seu nome."); return; }
            const pass = passwordInput.trim().toLowerCase();
            const p = config?.passwords || { admin: 'gestao', professor: 'prof', apoio: 'apoio' };

            let newRole = '';
            if (pass === p.admin?.toLowerCase() || pass === 'gestão') newRole = 'admin';
            else if (pass === p.professor?.toLowerCase()) newRole = 'professor';
            else if (pass === p.apoio?.toLowerCase()) newRole = 'aluno';
            else { showNotification("PIN incorrecto."); return; }

            setUserRole(newRole);
            setIsAuthenticated(true);
            try {
                if (rememberMe) localStorage.setItem('anisio_auth', JSON.stringify({ role: newRole, name: usernameInput }));
            } catch (e) { }
        }
    };

    return (
        <div className="min-h-screen min-h-[100dvh] bg-gradient-to-br from-indigo-50 via-slate-50 to-emerald-50 flex items-center justify-center p-6 selection:bg-indigo-100 selection:text-indigo-900">
            <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-10 max-w-sm w-full shadow-2xl shadow-indigo-200/50 text-center border border-white">
                <EscolaLogo className="w-24 mx-auto mb-5 drop-shadow-md" />
                <h1 className="text-2xl font-bold mb-1 tracking-tight text-slate-800">Anísio Teixeira</h1>
                <p className="text-[10px] text-indigo-500 mb-8 uppercase font-extrabold tracking-widest">Gestão Inteligente</p>
                <div className="space-y-4">
                    <input
                        type="text"
                        placeholder="Seu Nome (Prof/Aluno/Gestão)"
                        value={usernameInput}
                        className="w-full p-4 bg-slate-50/80 rounded-2xl border border-slate-200 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all font-medium text-slate-700"
                        onChange={e => setUsernameInput(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="PIN de Acesso"
                        value={passwordInput}
                        className="w-full p-4 bg-slate-50/80 rounded-2xl border border-slate-200 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all font-medium text-slate-700"
                        onChange={e => setPasswordInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                    />
                    <label className="flex items-center gap-2.5 justify-center cursor-pointer group mt-2">
                        <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${rememberMe ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-300 group-hover:border-indigo-400'}`}>
                            {rememberMe && <Check size={14} className="text-white" />}
                        </div>
                        <span className="text-xs font-semibold text-slate-500 transition-colors group-hover:text-slate-700">Manter sessão iniciada</span>
                        <input type="checkbox" className="hidden" checked={rememberMe} onChange={() => setRememberMe(!rememberMe)} />
                    </label>
                    <button
                        onClick={handleLogin}
                        className="w-full mt-4 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                        Entrar no Sistema <ArrowRight size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}
