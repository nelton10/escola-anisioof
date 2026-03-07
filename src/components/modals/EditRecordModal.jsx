import React from 'react';
import { Edit } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db, appId } from '../../services/firebase';
import { useModals } from '../../contexts/ModalContext';

export const EditRecordModal = () => {
    const { editRecordModal, setEditRecordModal, showNotification } = useModals();
    const [text, setText] = React.useState(editRecordModal?.detalhe || '');

    React.useEffect(() => {
        if (editRecordModal) setText(editRecordModal.detalhe || '');
    }, [editRecordModal]);

    if (!editRecordModal) return null;

    return (
        <div className="fixed inset-0 z-[140] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full text-center shadow-2xl border border-slate-200 animate-in zoom-in-95">
                <div className="bg-indigo-50 text-indigo-600 w-16 h-16 rounded-[1.25rem] flex items-center justify-center mx-auto mb-4 border border-indigo-100">
                    <Edit size={32} />
                </div>
                <h3 className="font-extrabold text-xl mb-2 text-slate-800 tracking-tight">Editar Registo</h3>
                <p className="text-sm text-slate-500 mb-6 font-medium">Edite o detalhe para <span className="font-bold text-slate-700">{editRecordModal.alunoNome}</span>.</p>
                <textarea
                    value={text}
                    onChange={e => setText(e.target.value)}
                    className="w-full p-4 bg-slate-50/80 rounded-2xl border border-slate-200 outline-none mb-6 text-sm font-medium focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all resize-none h-28"
                />
                <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => setEditRecordModal(null)} className="py-3.5 bg-slate-100 hover:bg-slate-200 rounded-2xl font-bold text-slate-600 transition-colors">Cancelar</button>
                    <button onClick={async () => {
                        if (!text.trim()) return showNotification("O texto não pode estar vazio!");
                        try {
                            await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'history', editRecordModal.id), { detalhe: text });
                            setEditRecordModal(null);
                            showNotification("Registo atualizado com sucesso!");
                        } catch (e) { showNotification("Erro ao atualizar o registo."); }
                    }} className="py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-lg shadow-indigo-600/20 active:scale-[0.98] transition-all">Salvar Alteração</button>
                </div>
            </div>
        </div>
    );
};
