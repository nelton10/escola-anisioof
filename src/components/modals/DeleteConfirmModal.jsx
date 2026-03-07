import React from 'react';
import { Trash2 } from 'lucide-react';
import { doc, deleteDoc } from 'firebase/firestore';
import { db, appId } from '../../services/firebase';
import { useModals } from '../../contexts/ModalContext';

export const DeleteConfirmModal = () => {
    const { deleteConfirm, setDeleteConfirm, showNotification } = useModals();

    if (!deleteConfirm) return null;

    return (
        <div className="fixed inset-0 z-[120] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white/95 backdrop-blur-xl rounded-[2rem] p-8 max-w-sm w-full text-center shadow-2xl border border-white animate-in zoom-in-95">
                <div className="bg-red-50 text-red-500 w-16 h-16 rounded-[1.25rem] flex items-center justify-center mx-auto mb-4 border border-red-100">
                    <Trash2 size={32} />
                </div>
                <h3 className="font-bold text-lg mb-2 text-slate-800 tracking-tight">Eliminar registo?</h3>
                <p className="text-sm text-slate-500 mb-6 font-medium">
                    A entrada de <span className="font-bold text-slate-700">{deleteConfirm.alunoNome}</span> será removida.
                </p>
                <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => setDeleteConfirm(null)} className="py-3.5 bg-slate-100 hover:bg-slate-200 rounded-2xl font-bold text-slate-600 transition-colors">
                        Cancelar
                    </button>
                    <button onClick={async () => {
                        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'history', deleteConfirm.id));
                        setDeleteConfirm(null);
                        showNotification("Removido com sucesso.");
                    }} className="py-3.5 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-2xl font-bold shadow-lg shadow-red-500/20 active:scale-[0.98] transition-all">
                        Sim, apagar
                    </button>
                </div>
            </div>
        </div>
    );
};
