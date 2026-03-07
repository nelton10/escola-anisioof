import React from 'react';
import { Gavel } from 'lucide-react';
import { collection, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db, appId } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useModals } from '../../contexts/ModalContext';

export const SuspensionModal = () => {
    const { usernameInput } = useAuth();
    const { suspensionModal, setSuspensionModal, showNotification } = useModals();
    const [returnDate, setReturnDate] = React.useState('');
    const [coordObs, setCoordObs] = React.useState(''); // Passado via prop ou estado local

    if (!suspensionModal) return null;

    return (
        <div className="fixed inset-0 z-[120] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full text-center shadow-2xl border-2 border-slate-800 animate-in zoom-in-95">
                <div className="bg-slate-100 text-slate-800 w-16 h-16 rounded-[1.25rem] flex items-center justify-center mx-auto mb-4 border border-slate-200">
                    <Gavel size={32} />
                </div>
                <h3 className="font-extrabold text-xl mb-2 text-slate-800 tracking-tight">Aplicar Suspensão</h3>
                <p className="text-sm text-slate-500 mb-6 font-medium">Defina o dia do retorno do aluno <span className="font-bold text-slate-700">{suspensionModal.alunoNome}</span>.</p>
                <input
                    type="date"
                    value={returnDate}
                    onChange={e => setReturnDate(e.target.value)}
                    className="w-full p-4 bg-slate-50/80 rounded-2xl border border-slate-200 outline-none mb-6 text-center font-bold text-lg focus:bg-white focus:ring-4 focus:ring-slate-500/10 focus:border-slate-400 transition-all"
                />
                <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => { setSuspensionModal(null); setReturnDate(''); }} className="py-3.5 bg-slate-100 hover:bg-slate-200 rounded-2xl font-bold text-slate-600 transition-colors">Cancelar</button>
                    <button onClick={async () => {
                        if (!returnDate) return showNotification("Insira a data de retorno!");
                        try {
                            const now = new Date(); const ts = now.toLocaleString('pt-PT'); const raw = now.getTime();
                            const formatRetorno = returnDate.split('-').reverse().join('/');
                            await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'history'), {
                                alunoId: suspensionModal.alunoId, alunoNome: suspensionModal.alunoNome, turma: suspensionModal.turma,
                                categoria: 'coordenação', detalhe: `SUSPENSÃO. Retorna dia: ${formatRetorno}. OBS: ${coordObs || 'Nenhuma'}`,
                                timestamp: ts, rawTimestamp: raw, professor: usernameInput,
                                fotoUrl: suspensionModal.fotoUrl || null
                            });
                            await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'suspensions'), {
                                alunoId: suspensionModal.alunoId, alunoNome: suspensionModal.alunoNome, turma: suspensionModal.turma,
                                returnDate: returnDate, timestamp: ts
                            });
                            await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'coordinationQueue', suspensionModal.id));
                            setSuspensionModal(null); setReturnDate(''); showNotification("Suspensão aplicada com sucesso!");
                        } catch (e) { showNotification("Erro ao suspender."); }
                    }} className="py-3.5 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold shadow-lg shadow-slate-800/20 active:scale-[0.98] transition-all">Confirmar</button>
                </div>
            </div>
        </div>
    );
};
