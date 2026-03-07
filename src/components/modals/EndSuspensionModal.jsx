import React, { useState } from 'react';
import { Gavel } from 'lucide-react';
import { collection, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db, appId } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useModals } from '../../contexts/ModalContext';

export const EndSuspensionModal = () => {
    const { usernameInput } = useAuth();
    const { endSuspensionModal, setEndSuspensionModal, showNotification } = useModals();
    const [obs, setObs] = useState('');

    if (!endSuspensionModal) return null;

    return (
        <div className="fixed inset-0 z-[130] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full text-center shadow-2xl border-2 border-red-500 animate-in zoom-in-95">
                <div className="bg-red-50 text-red-600 w-16 h-16 rounded-[1.25rem] flex items-center justify-center mx-auto mb-4 border border-red-100">
                    <Gavel size={32} />
                </div>
                <h3 className="font-extrabold text-xl mb-2 text-slate-800 tracking-tight">Encerrar Suspensão</h3>
                <p className="text-sm text-slate-500 mb-6 font-medium">O responsável do(a) <span className="font-bold text-slate-700">{endSuspensionModal.alunoNome}</span> compareceu à escola?</p>
                <textarea
                    value={obs}
                    onChange={e => setObs(e.target.value)}
                    placeholder="Registe as observações do atendimento ou acordos firmados (obrigatório)..."
                    className="w-full p-4 bg-slate-50/80 rounded-2xl border border-slate-200 outline-none mb-6 text-sm font-medium focus:bg-white focus:ring-4 focus:ring-red-500/10 focus:border-red-400 transition-all resize-none h-28"
                />
                <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => { setEndSuspensionModal(null); setObs(''); }} className="py-3.5 bg-slate-100 hover:bg-slate-200 rounded-2xl font-bold text-slate-600 transition-colors">Cancelar</button>
                    <button onClick={async () => {
                        if (!obs.trim()) return showNotification("A observação é obrigatória!");
                        try {
                            const ts = new Date().toLocaleString('pt-PT');
                            const raw = Date.now();
                            await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'history'), {
                                alunoId: endSuspensionModal.alunoId, alunoNome: endSuspensionModal.alunoNome, turma: endSuspensionModal.turma,
                                categoria: 'coordenação', detalhe: `Suspensão Encerrada. OBS: ${obs}`,
                                timestamp: ts, rawTimestamp: raw, professor: usernameInput
                            });
                            await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'suspensions', endSuspensionModal.id));
                            setEndSuspensionModal(null); setObs('');
                            showNotification("Suspensão encerrada!");
                        } catch (e) { showNotification("Erro ao encerrar suspensão."); }
                    }} className="py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold shadow-lg shadow-red-600/20 active:scale-[0.98] transition-all">Confirmar</button>
                </div>
            </div>
        </div>
    );
};
