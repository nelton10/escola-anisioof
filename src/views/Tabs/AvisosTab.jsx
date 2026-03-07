import React, { useState } from 'react';
import { Megaphone, MessageSquarePlus, Activity, Download, Trash2, ArrowRight } from 'lucide-react';
import { collection, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db, appId } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useAppContext } from '../../contexts/AppContext';
import { useModals } from '../../contexts/ModalContext';
import { jsPDF } from 'jspdf';

export const AvisosTab = () => {
    const { usernameInput, userRole } = useAuth();
    const { avisos } = useAppContext();
    const { showNotification } = useModals();

    const [avisoTexto, setAvisoTexto] = useState('');

    const postAviso = async () => {
        if (!avisoTexto.trim() || userRole !== 'admin') return;
        try {
            const now = new Date(); const ts = now.toLocaleString('pt-PT'); const raw = now.getTime();
            await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'avisos'), {
                texto: avisoTexto, autor: usernameInput, timestamp: ts, rawTimestamp: raw
            });
            setAvisoTexto('');
            showNotification("Aviso publicado!");
        } catch (e) { showNotification("Erro ao publicar."); }
    };

    const deleteAviso = async (id) => {
        if (userRole !== 'admin') return;
        try {
            await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'avisos', id));
            showNotification("Aviso removido!");
        } catch (e) { showNotification("Erro ao remover."); }
    };

    return (
        <div className="space-y-6 flex-1 w-full animate-in fade-in duration-300">
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-8 rounded-[2rem] shadow-xl text-white relative overflow-hidden">
                <div className="absolute -right-8 -top-8 text-indigo-500/30 rotate-12"><Megaphone size={140} /></div>
                <h2 className="text-2xl font-black mb-2 relative z-10 tracking-tight flex items-center gap-3"><Megaphone size={28} /> Mural da Escola</h2>
                <p className="text-indigo-100/80 text-sm font-medium relative z-10 max-w-[80%]">Avisos e comunicados importantes para a equipe.</p>
            </div>

            {userRole === 'admin' && (
                <div className="bg-white/90 backdrop-blur-sm p-6 rounded-[2rem] border border-white shadow-xl shadow-slate-200/40 space-y-4">
                    <h3 className="text-sm font-extrabold flex items-center gap-2 text-indigo-600 tracking-tight"><MessageSquarePlus size={18} strokeWidth={2.5} /> Novo Comunicado</h3>
                    <textarea placeholder="Escreva o aviso aqui..." value={avisoTexto} onChange={e => setAvisoTexto(e.target.value)} className="w-full p-4 bg-slate-50/80 rounded-2xl border border-slate-200 outline-none h-24 resize-none focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all font-medium text-sm text-slate-700" />
                    <button onClick={postAviso} className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 text-white py-3.5 rounded-2xl font-bold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:scale-[0.98] transition-all flex items-center justify-center gap-2">Publicar Aviso <ArrowRight size={16} /></button>
                </div>
            )}

            <div className="space-y-4">
                {avisos.length === 0 ? (
                    <div className="text-center p-8 bg-slate-50/50 rounded-[2rem] border border-slate-200 border-dashed">
                        <p className="text-slate-400 font-bold text-sm">Nenhum aviso no momento.</p>
                    </div>
                ) : (
                    avisos.map(a => (
                        <div key={a.id} className="bg-white/95 backdrop-blur-md p-6 rounded-[2rem] border border-slate-200/60 shadow-sm hover:shadow-md transition-all relative group">
                            {userRole === 'admin' && (
                                <button onClick={() => deleteAviso(a.id)} className="absolute top-4 right-4 p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"><Trash2 size={16} strokeWidth={2.5} /></button>
                            )}
                            <div className="flex gap-4">
                                <div className="w-12 h-12 rounded-[1rem] bg-indigo-50 flex items-center justify-center shrink-0 border border-indigo-100/50"><Megaphone size={20} className="text-indigo-600" /></div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-700 whitespace-pre-line leading-relaxed">{a.texto}</p>
                                    <div className="mt-3 flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                        <span className="bg-slate-100 px-2 py-1 rounded-lg border border-slate-200/50 text-slate-500">Por: Gestão</span>
                                        <span className="opacity-70">• {a.timestamp}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
