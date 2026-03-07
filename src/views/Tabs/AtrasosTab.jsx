import React, { useState } from 'react';
import { TimerOff, ArrowRight } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db, appId } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useAppContext } from '../../contexts/AppContext';
import { useModals } from '../../contexts/ModalContext';

export const AtrasosTab = () => {
    const { usernameInput } = useAuth();
    const { turmasExistentes, alunos } = useAppContext();
    const { showNotification } = useModals();

    const [selectedTurmaAtraso, setSelectedTurmaAtraso] = useState('');
    const [selectedAlunoAtrasoId, setSelectedAlunoAtrasoId] = useState('');

    const handleAtraso = async () => {
        if (!selectedAlunoAtrasoId || !selectedTurmaAtraso) return showNotification("Selecione Turma e Aluno!");
        const a = alunos.find(x => x.id === selectedAlunoAtrasoId); if (!a) return;
        try {
            const now = new Date(); const ts = now.toLocaleString('pt-PT'); const raw = now.getTime();
            await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'history'), {
                alunoId: a.id, alunoNome: a.nome, turma: a.turma, categoria: 'atraso', detalhe: 'Entrada com Atraso',
                timestamp: ts, rawTimestamp: raw, professor: usernameInput, autorRole: 'admin'
            });
            showNotification("Atraso Registado!");
            setSelectedAlunoAtrasoId('');
        } catch (e) { console.error(e); }
    };

    return (
        <div className="bg-white/90 backdrop-blur-sm p-6 rounded-[2rem] border border-white shadow-xl shadow-slate-200/40 space-y-5 flex-1 w-full animate-in fade-in duration-300">
            <h3 className="text-sm font-extrabold flex items-center gap-2 text-yellow-600 tracking-tight"><TimerOff size={18} strokeWidth={2.5} /> Registo de Atraso</h3>
            <p className="text-sm text-slate-500 font-medium mb-4">Utilize para registar alunos que chegaram após o sinal bater.</p>
            <div className="space-y-3">
                <select className="w-full p-4 bg-slate-50/80 rounded-2xl border border-slate-200 outline-none focus:bg-white focus:ring-4 focus:ring-yellow-500/10 focus:border-yellow-400 transition-all font-semibold text-slate-700 appearance-none" onChange={e => { setSelectedTurmaAtraso(e.target.value); setSelectedAlunoAtrasoId(''); }} value={selectedTurmaAtraso}>
                    <option value="">Escolher Turma...</option>
                    {turmasExistentes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <select className="w-full p-4 bg-slate-50/80 rounded-2xl border border-slate-200 outline-none focus:bg-white focus:ring-4 focus:ring-yellow-500/10 focus:border-yellow-400 transition-all font-semibold text-slate-700 appearance-none disabled:opacity-60 disabled:bg-slate-100" onChange={e => setSelectedAlunoAtrasoId(e.target.value)} value={selectedAlunoAtrasoId} disabled={!selectedTurmaAtraso}>
                    <option value="">Selecionar Aluno...</option>
                    {alunos.filter(a => a.turma === selectedTurmaAtraso).map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}
                </select>
            </div>
            <button onClick={handleAtraso} className="w-full bg-gradient-to-r from-yellow-500 to-yellow-400 text-white py-4 mt-2 rounded-2xl font-bold shadow-lg shadow-yellow-500/30 hover:shadow-yellow-500/40 hover:-translate-y-0.5 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                Registar Atraso <ArrowRight size={18} />
            </button>
        </div>
    );
};
