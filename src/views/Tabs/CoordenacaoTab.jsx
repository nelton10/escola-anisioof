import React from 'react';
import { DoorOpen, CheckCircle2, UserX, Image as ImageIcon } from 'lucide-react';
import { collection, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db, appId } from '../../services/firebase';
import { useAppContext } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { useModals } from '../../contexts/ModalContext';

export const CoordenacaoTab = () => {
    const { usernameInput } = useAuth();
    const { coordinationQueue, suspensions } = useAppContext();
    const { showNotification, setSuspensionModal, setEndSuspensionModal, setViewPhotoModal } = useModals();

    const handleCoordComplete = async (aluno) => {
        try {
            const now = new Date(); const ts = now.toLocaleString('pt-PT'); const raw = now.getTime();
            await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'history'), {
                alunoId: aluno.alunoId, alunoNome: aluno.alunoNome, turma: aluno.turma,
                categoria: 'coordenação', detalhe: `Atendimento Concluído. Motivo original: ${aluno.motivo}`,
                timestamp: ts, rawTimestamp: raw, professor: usernameInput,
                fotoUrl: aluno.fotoUrl || null
            });
            await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'coordinationQueue', aluno.id));
            showNotification("Atendimento finalizado!");
        } catch (e) { showNotification("Erro ao finalizar."); }
    };

    const handleLibraryReferral = async (aluno) => {
        try {
            const now = new Date(); const ts = now.toLocaleString('pt-PT'); const raw = now.getTime();
            // 1. Registrar no histórico
            await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'history'), {
                alunoId: aluno.alunoId, alunoNome: aluno.alunoNome, turma: aluno.turma,
                categoria: 'coordenação', detalhe: `Encaminhado à Biblioteca. Motivo original: ${aluno.motivo}`,
                timestamp: ts, rawTimestamp: raw, professor: usernameInput
            });
            // 2. Adicionar à fila da biblioteca
            await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'libraryQueue'), {
                alunoId: aluno.alunoId, alunoNome: aluno.alunoNome, turma: aluno.turma,
                timestamp: ts, rawTimestamp: raw, professor: usernameInput
            });
            // 3. Remover da fila da coordenação
            await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'coordinationQueue', aluno.id));
            showNotification("Aluno encaminhado para a Biblioteca!");
        } catch (e) { showNotification("Erro ao encaminhar."); }
    };

    return (
        <div className="space-y-6 flex-1 w-full animate-in fade-in duration-300">
            <div className="bg-white/90 backdrop-blur-sm p-6 rounded-[2rem] border border-white shadow-xl shadow-slate-200/40 space-y-4">
                <h3 className="text-sm font-extrabold flex items-center justify-between text-indigo-800 tracking-tight"><div className="flex items-center gap-2"><DoorOpen size={18} strokeWidth={2.5} /> Alunos Aguardando Atendimento</div><div className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-lg text-xs">{coordinationQueue.length}</div></h3>
                {coordinationQueue.length === 0 ? (
                    <div className="text-center p-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200"><p className="text-sm font-bold text-slate-400">Fila vazia. Tudo tranquilo!</p></div>
                ) : (
                    <div className="space-y-3">
                        {coordinationQueue.map(c => (
                            <div key={c.id} className="bg-amber-50/80 p-4 rounded-2xl border border-amber-200/60 shadow-sm relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-400"></div>
                                <div className="flex justify-between items-start pl-2">
                                    <div className="flex-1">
                                        <h4 className="font-extrabold text-sm text-amber-950 mb-1">{c.alunoNome}</h4>
                                        <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-2"><span className="bg-amber-100 px-1.5 py-0.5 rounded-md">{c.turma}</span> • {c.timestamp}</p>
                                        <p className="text-xs font-semibold text-amber-900 bg-amber-100/50 p-2 rounded-xl mb-3"><span className="opacity-70 mr-1">Motivo:</span> {c.motivo}</p>
                                    </div>
                                    {c.fotoUrl && (
                                        <button
                                            onClick={() => setViewPhotoModal(c.fotoUrl)}
                                            className="p-3 bg-amber-100/80 text-amber-700 rounded-xl hover:bg-amber-200 transition-all border border-amber-200"
                                        >
                                            <ImageIcon size={20} />
                                        </button>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-2 pl-2">
                                    <button onClick={() => handleCoordComplete(c)} className="flex-1 min-w-[120px] bg-gradient-to-r from-emerald-500 to-emerald-400 text-white px-3 py-2.5 rounded-xl text-xs font-bold hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-1"><CheckCircle2 size={16} /> Resolver</button>
                                    <button onClick={() => handleLibraryReferral(c)} className="flex-1 min-w-[120px] bg-gradient-to-r from-indigo-600 to-indigo-500 text-white px-3 py-2.5 rounded-xl text-xs font-bold hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-1"><ImageIcon size={16} /> Encaminhar p/ Biblioteca</button>
                                    <button onClick={() => setSuspensionModal({ ...c, fotoUrl: c.fotoUrl })} className="flex-1 min-w-[120px] bg-gradient-to-r from-slate-800 to-slate-700 text-white px-3 py-2.5 rounded-xl text-xs font-bold hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-1"><UserX size={16} /> Suspender</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {suspensions.length > 0 && (
                <div className="bg-red-50/90 backdrop-blur-sm p-6 rounded-[2rem] border border-red-100 shadow-xl shadow-red-200/40 space-y-4">
                    <h3 className="text-sm font-extrabold flex items-center gap-2 text-red-800 tracking-tight"><UserX size={18} strokeWidth={2.5} /> Alunos em Suspensão</h3>
                    <div className="space-y-3">
                        {suspensions.map(s => (
                            <div key={s.id} className="bg-white p-4 rounded-2xl border border-red-200/60 shadow-sm flex flex-col gap-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-extrabold text-sm text-slate-800">{s.alunoNome}</h4>
                                        <p className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-wider"><span className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md mr-1">{s.turma}</span> Retorno: <span className="text-red-500">{s.returnDate.split('-').reverse().join('/')}</span></p>
                                    </div>
                                </div>
                                <button onClick={() => setEndSuspensionModal(s)} className="w-full bg-red-100 hover:bg-red-200 text-red-700 py-3 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-2 border border-red-200/50"><CheckCircle2 size={16} /> Registrar Retorno do Aluno</button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
