import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import { collection, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db, appId } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useModals } from '../../contexts/ModalContext';

export const AuthReturnModal = () => {
    const { userRole, usernameInput } = useAuth();
    const { authReturnModal, setAuthReturnModal, showNotification } = useModals();
    const [password, setPassword] = useState('');

    if (!authReturnModal) return null;

    const finalizeExit = async (exit, registerOccurrence, elapsedMinutesParam = 0) => {
        try {
            const dur = elapsedMinutesParam > 0 ? elapsedMinutesParam : Math.floor((new Date().getTime() - exit.startTime) / 60000);
            const now = new Date(); const ts = now.toLocaleString('pt-PT'); const raw = now.getTime();
            await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'history'), {
                alunoId: exit.alunoId, alunoNome: exit.alunoNome, turma: exit.turma,
                categoria: 'saida', detalhe: `${exit.destino} (${dur} min)${exit.isEmergency ? ' [EMERGÊNCIA]' : ''}`,
                timestamp: ts, rawTimestamp: raw, professor: exit.professor || usernameInput,
                autorRole: exit.autorRole || userRole
            });
            if (registerOccurrence) {
                await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'history'), {
                    ...exit, categoria: 'ocorrencia', detalhe: `Demora na saída (${dur} min) - Destino: ${exit.destino}`, rawTimestamp: raw + 1,
                    autorRole: exit.autorRole || userRole
                });
            }
            await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'activeExits', exit.id));
            showNotification("Retorno registado.");
        } catch (e) { console.error(e); }
    };

    const confirmAuthReturn = () => {
        if (password.toLowerCase() === 'ok' || password.toLowerCase() === '(ok)') {
            if (authReturnModal.isDemorou) finalizeExit(authReturnModal.exit, true);
            else finalizeExit(authReturnModal.exit, false);
            setAuthReturnModal(null);
        } else {
            showNotification("Senha incorreta!");
        }
    };

    return (
        <div className="fixed inset-0 z-[120] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white/95 backdrop-blur-xl rounded-[2.5rem] p-8 max-w-sm w-full text-center shadow-2xl border border-indigo-100 animate-in zoom-in-95 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-indigo-500"></div>
                <div className="bg-indigo-50 text-indigo-600 w-16 h-16 rounded-[1.25rem] flex items-center justify-center mx-auto mb-4 border border-indigo-100">
                    <Lock size={32} />
                </div>
                <h3 className="font-extrabold text-xl mb-2 text-slate-800 tracking-tight">Acesso Restrito</h3>
                <p className="text-sm text-slate-500 mb-6 font-medium leading-relaxed">Esta saída foi autorizada por <span className="font-bold text-slate-700">{authReturnModal.exit.autorRole === 'aluno' ? 'Aluno(a)' : 'Prof.'} {authReturnModal.exit.professor}</span>. Insira a senha de confirmação.</p>
                <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder='Digite "ok" para liberar'
                    className="w-full p-4 bg-slate-50/80 rounded-2xl border border-slate-200 outline-none mb-6 text-center font-extrabold tracking-widest text-lg focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all"
                />
                <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => setAuthReturnModal(null)} className="py-3.5 bg-slate-100 hover:bg-slate-200 rounded-2xl font-bold text-slate-600 transition-colors">Cancelar</button>
                    <button onClick={confirmAuthReturn} className="py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-2xl font-bold shadow-lg shadow-indigo-500/30 active:scale-[0.98] transition-all">Confirmar</button>
                </div>
            </div>
        </div>
    );
};
