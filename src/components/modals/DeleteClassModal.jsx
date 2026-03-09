import React from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { db, appId } from '../../services/firebase';
import { useModals } from '../../contexts/ModalContext';
import { useAppContext } from '../../contexts/AppContext';

export const DeleteClassModal = () => {
    const { deleteTurma, setDeleteTurma, showNotification } = useModals();
    const { alunos } = useAppContext();

    if (!deleteTurma) return null;

    const handleDelete = async () => {
        try {
            const updatedAlunos = alunos.filter(a => a.turma !== deleteTurma);
            await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'config', 'main'), {
                alunosList: updatedAlunos
            }, { merge: true });

            showNotification(`Turma ${deleteTurma} removida com sucesso!`);
            setDeleteTurma(null);
        } catch (e) {
            console.error(e);
            showNotification("Erro ao remover turma.");
        }
    };

    return (
        <div className="fixed inset-0 z-[130] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full text-center shadow-2xl border-2 border-rose-500 animate-in zoom-in-95 duration-200">
                <div className="bg-rose-50 text-rose-500 w-20 h-20 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 shadow-inner">
                    <Trash2 size={40} />
                </div>

                <h3 className="font-black text-2xl mb-2 text-slate-800 tracking-tight">Apagar Turma Inteira?</h3>
                <p className="text-sm text-slate-500 mb-8 font-medium leading-relaxed">
                    Você está prestes a remover <span className="font-black text-rose-600 underline underline-offset-4 decoration-rose-200">TODOS</span> os alunos da turma <span className="font-black text-slate-800 bg-slate-100 px-2 py-0.5 rounded-lg">{deleteTurma}</span>. Esta ação é irreversível.
                </p>

                <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100 mb-8 text-left">
                    <AlertTriangle className="text-amber-500 shrink-0" size={20} />
                    <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider leading-tight">Atenção: Os registros históricos dos alunos não serão apagados, apenas a lista de presença atual.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={() => setDeleteTurma(null)}
                        className="py-4 bg-slate-100 hover:bg-slate-200 rounded-2xl font-black text-slate-600 transition-all active:scale-[0.98]"
                    >
                        CANCELAR
                    </button>
                    <button
                        onClick={handleDelete}
                        className="py-4 bg-gradient-to-r from-rose-600 to-rose-500 text-white rounded-2xl font-black shadow-lg shadow-rose-500/30 hover:shadow-rose-500/40 active:scale-[0.98] transition-all"
                    >
                        SIM, APAGAR
                    </button>
                </div>
            </div>
        </div>
    );
};
