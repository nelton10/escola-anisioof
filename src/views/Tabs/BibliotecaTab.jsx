import { useState } from 'react';
import { Library, CheckCircle2, MessageSquare } from 'lucide-react';
import { collection, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db, appId } from '../../services/firebase';
import { useAppContext } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { useModals } from '../../contexts/ModalContext';

export const BibliotecaTab = () => {
    const { usernameInput } = useAuth();
    const { libraryQueue } = useAppContext();
    const { showNotification } = useModals();
    const [observations, setObservations] = useState({});

    const handleLibraryAction = async (aluno, actionType) => {
        try {
            const obs = observations[aluno.id] || '';
            const now = new Date(); const ts = now.toLocaleString('pt-PT'); const raw = now.getTime();

            if (actionType === 'positivo') {
                await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'history'), {
                    alunoId: aluno.alunoId, alunoNome: aluno.alunoNome, turma: aluno.turma,
                    categoria: 'saida', detalhe: `Retorno da Biblioteca (Positivo). Obs: ${obs}`,
                    timestamp: ts, rawTimestamp: raw, professor: usernameInput
                });
                showNotification("Retorno confirmado!");
            } else if (actionType === 'negativo') {
                await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'history'), {
                    alunoId: aluno.alunoId, alunoNome: aluno.alunoNome, turma: aluno.turma,
                    categoria: 'ocorrencia', detalhe: `Ocorrência Extra: Desempenho Negativo na Biblioteca. Obs: ${obs}`,
                    timestamp: ts, rawTimestamp: raw, professor: usernameInput
                });
                showNotification("Ocorrência de desempenho registada!");
            } else if (actionType === 'faltou') {
                await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'history'), {
                    alunoId: aluno.alunoId, alunoNome: aluno.alunoNome, turma: aluno.turma,
                    categoria: 'ocorrencia', detalhe: `Ocorrência Extra: Não compareceu na Biblioteca. Obs: ${obs}`,
                    timestamp: ts, rawTimestamp: raw, professor: usernameInput
                });
                // Voltar para a coordenação
                await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'coordinationQueue'), {
                    alunoId: aluno.alunoId, alunoNome: aluno.alunoNome, turma: aluno.turma,
                    motivo: `Não compareceu na Biblioteca. Obs: ${obs}`,
                    timestamp: ts, professor: usernameInput
                });
                showNotification("Falta registada e aluno enviado à Coordenação!");
            }

            // Remover da fila da biblioteca sempre
            await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'libraryQueue', aluno.id));
        } catch (e) {
            console.error(e);
            showNotification("Erro ao processar ação.");
        }
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
                                        <p className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider mb-2"><span className="bg-indigo-100 px-1.5 py-0.5 rounded-md mr-1">{c.turma}</span></p>
                                        <p className="text-xs font-semibold text-indigo-900 bg-indigo-100/30 p-2 rounded-xl mb-3"><span className="opacity-70 mr-1">Motivo:</span> {c.motivo || 'Encaminhamento'} {c.observation && <span className="block mt-1 italic text-[10px] text-indigo-800/70 border-t border-indigo-200/30 pt-1">Obs anterior: {c.observation}</span>}</p>

                                        <div className="relative mb-1 group">
                                            <div className="absolute top-3 left-3 text-indigo-500">
                                                <MessageSquare size={14} />
                                            </div>
                                            <textarea
                                                placeholder="Adicionar observação para o histórico..."
                                                className="w-full pl-9 pr-3 py-2 bg-white/50 border border-indigo-200 rounded-xl text-xs font-medium placeholder:text-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/20 focus:border-indigo-400 transition-all resize-none min-h-[60px]"
                                                value={observations[c.id] || ''}
                                                onChange={(e) => setObservations(prev => ({ ...prev, [c.id]: e.target.value }))}
                                            />
                                        </div>
                                        <p className="text-[10px] font-semibold text-indigo-900 mt-2 opacity-50">Enviado por: {c.professor}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                    <button onClick={() => handleLibraryAction(c, 'positivo')} className="bg-emerald-100 hover:bg-emerald-200 text-emerald-700 py-3 rounded-xl font-bold text-[10px] transition-all flex items-center justify-center gap-1 border border-emerald-200/50 hover:shadow-sm">
                                        <CheckCircle2 size={14} /> Retorno OK
                                    </button>
                                    <button onClick={() => handleLibraryAction(c, 'negativo')} className="bg-amber-100 hover:bg-amber-200 text-amber-700 py-3 rounded-xl font-bold text-[10px] transition-all flex items-center justify-center gap-1 border border-amber-200/50 hover:shadow-sm">
                                        <CheckCircle2 size={14} /> Desemp. Negativo
                                    </button>
                                    <button onClick={() => handleLibraryAction(c, 'faltou')} className="bg-rose-100 hover:bg-rose-200 text-rose-700 py-3 rounded-xl font-bold text-[10px] transition-all flex items-center justify-center gap-1 border border-rose-200/50 hover:shadow-sm">
                                        <CheckCircle2 size={14} /> Não Apareceu
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
