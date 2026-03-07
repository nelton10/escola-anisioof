import React from 'react';
import { Library, CheckCircle2 } from 'lucide-react';
import { collection, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db, appId } from '../../services/firebase';
import { useAppContext } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { useModals } from '../../contexts/ModalContext';

export const BibliotecaTab = () => {
    const { usernameInput } = useAuth();
    const { libraryQueue } = useAppContext();
    const { showNotification } = useModals();

    const handleLibraryComplete = async (aluno) => {
        try {
            const now = new Date(); const ts = now.toLocaleString('pt-PT'); const raw = now.getTime();
            await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'history'), {
                alunoId: aluno.alunoId, alunoNome: aluno.alunoNome, turma: aluno.turma,
                categoria: 'saida', detalhe: 'Retorno da Biblioteca',
                timestamp: ts, rawTimestamp: raw, professor: usernameInput
            });
            await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'libraryQueue', aluno.id));
            showNotification("Retorno confirmado!");
        } catch (e) { showNotification("Erro ao confirmar retorno."); }
    };

    return (
        <div className="space-y-6 flex-1 w-full animate-in fade-in duration-300">
            <div className="bg-white/90 backdrop-blur-sm p-6 rounded-[2rem] border border-white shadow-xl shadow-slate-200/40 space-y-4">
                <h3 className="text-sm font-extrabold flex items-center justify-between text-indigo-800 tracking-tight"><div className="flex items-center gap-2"><Library size={18} strokeWidth={2.5} /> Alunos na Biblioteca</div><div className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-lg text-xs">{libraryQueue.length}</div></h3>
                {libraryQueue.length === 0 ? (
                    <div className="text-center p-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200"><p className="text-sm font-bold text-slate-400">Nenhum aluno na biblioteca no momento.</p></div>
                ) : (
                    <div className="space-y-3">
                        {libraryQueue.map(c => (
                            <div key={c.id} className="bg-indigo-50/80 p-4 rounded-2xl border border-indigo-200/60 shadow-sm flex flex-col gap-3 group">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-extrabold text-sm text-indigo-950 mb-1">{c.alunoNome}</h4>
                                        <p className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider mb-0.5"><span className="bg-indigo-100 px-1.5 py-0.5 rounded-md mr-1">{c.turma}</span></p>
                                        <p className="text-xs font-semibold text-indigo-900 mt-1 opacity-70">Enviado por: {c.professor}</p>
                                    </div>
                                </div>
                                <button onClick={() => handleLibraryComplete(c)} className="w-full bg-indigo-100 hover:bg-indigo-200 text-indigo-700 py-3 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-2 border border-indigo-200/50 hover:shadow-md hover:-translate-y-0.5"><CheckCircle2 size={16} /> Confirmar Retorno à Sala</button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
