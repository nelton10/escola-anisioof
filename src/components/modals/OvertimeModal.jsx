import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { collection, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db, appId } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useModals } from '../../contexts/ModalContext';

export const OvertimeModal = () => {
    const { userRole, usernameInput } = useAuth();
    const { overtimeModal, setOvertimeModal, showNotification } = useModals();

    if (!overtimeModal) return null;

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
            setOvertimeModal(null);
            showNotification("Retorno registado.");
        } catch (e) { console.error(e); }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full text-center shadow-2xl border-2 border-red-400 animate-in zoom-in-95 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-red-500"></div>
                <AlertTriangle size={48} className="text-red-500 mx-auto mb-4 drop-shadow-sm" />
                <h2 className="text-xl font-extrabold mb-2 tracking-tight text-slate-800">Tempo Excedido!</h2>
                <div className="inline-block bg-red-50 px-4 py-2 rounded-xl border border-red-100 mb-8">
                    <p className="font-bold text-red-600 text-lg">{overtimeModal.elapsedMinutes} min fora da sala</p>
                </div>
                <div className="space-y-3">
                    <button onClick={() => finalizeExit(overtimeModal.exit, true, overtimeModal.elapsedMinutes)} className="w-full py-4 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-2xl font-bold shadow-lg shadow-red-500/30 hover:shadow-red-500/40 hover:-translate-y-0.5 active:scale-[0.98] transition-all">Registar Ocorrência</button>
                    {userRole !== 'aluno' && (
                        <button onClick={() => finalizeExit(overtimeModal.exit, false, overtimeModal.elapsedMinutes)} className="w-full py-4 bg-slate-100 hover:bg-slate-200 rounded-2xl font-bold text-slate-600 transition-colors">Apenas Retornar</button>
                    )}
                </div>
            </div>
        </div>
    );
};
