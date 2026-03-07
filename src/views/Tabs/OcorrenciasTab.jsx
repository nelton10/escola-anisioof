import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, ArrowRight } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db, appId } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useAppContext } from '../../contexts/AppContext';
import { useModals } from '../../contexts/ModalContext';

export const OcorrenciasTab = () => {
    const { userRole, usernameInput } = useAuth();
    const { turmasExistentes, alunos } = useAppContext();
    const { showNotification } = useModals();

    const [selectedTurmaOcorrencia, setSelectedTurmaOcorrencia] = useState('');
    const [selectedAlunoOcorrenciaId, setSelectedAlunoOcorrenciaId] = useState('');
    const [ocorrenciaDetalhe, setOcorrenciaDetalhe] = useState('');
    const [encaminharCoord, setEncaminharCoord] = useState(false);

    const handleOcorrencia = async () => {
        if (!selectedAlunoOcorrenciaId || !ocorrenciaDetalhe.trim() || !selectedTurmaOcorrencia) return showNotification("Preencha todos os campos!");
        const a = alunos.find(x => x.id === selectedAlunoOcorrenciaId); if (!a) return;
        try {
            const now = new Date(); const ts = now.toLocaleString('pt-PT'); const raw = now.getTime();
            let d = ocorrenciaDetalhe;
            if (encaminharCoord) d = `[ENCAMINHADO À COORDENAÇÃO] ${d}`;

            await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'history'), {
                alunoId: a.id, alunoNome: a.nome, turma: a.turma, categoria: 'ocorrencia', detalhe: d,
                timestamp: ts, rawTimestamp: raw, professor: usernameInput,
                autorRole: userRole
            });
            if (encaminharCoord) {
                await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'coordinationQueue'), {
                    alunoId: a.id, alunoNome: a.nome, turma: a.turma, motivo: d, timestamp: ts,
                    professor: usernameInput
                });
                showNotification("Ocorrência + Coordenação!");
            } else {
                showNotification("Ocorrência Registada!");
            }
            setSelectedAlunoOcorrenciaId(''); setOcorrenciaDetalhe(''); setEncaminharCoord(false);
        } catch (e) { console.error(e); }
    };

    return (
        <div className="bg-white/90 backdrop-blur-sm p-6 rounded-[2rem] border border-white shadow-xl shadow-slate-200/40 space-y-5 flex-1 w-full animate-in fade-in duration-300">
            <h3 className="text-sm font-extrabold flex items-center gap-2 text-rose-600 tracking-tight"><ShieldAlert size={18} strokeWidth={2.5} /> Registo de Ocorrência</h3>
            <div className="space-y-3">
                <select className="w-full p-4 bg-slate-50/80 rounded-2xl border border-slate-200 outline-none focus:bg-white focus:ring-4 focus:ring-rose-500/10 focus:border-rose-400 transition-all font-semibold text-slate-700 appearance-none" onChange={e => { setSelectedTurmaOcorrencia(e.target.value); setSelectedAlunoOcorrenciaId(''); }} value={selectedTurmaOcorrencia}>
                    <option value="">Escolher Turma...</option>
                    {turmasExistentes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <select className="w-full p-4 bg-slate-50/80 rounded-2xl border border-slate-200 outline-none focus:bg-white focus:ring-4 focus:ring-rose-500/10 focus:border-rose-400 transition-all font-semibold text-slate-700 appearance-none disabled:opacity-60 disabled:bg-slate-100" onChange={e => setSelectedAlunoOcorrenciaId(e.target.value)} value={selectedAlunoOcorrenciaId} disabled={!selectedTurmaOcorrencia}>
                    <option value="">Selecionar Aluno...</option>
                    {alunos.filter(a => a.turma === selectedTurmaOcorrencia).map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}
                </select>
                <textarea placeholder="Detalhes da ocorrência (ex: Uso indevido de telemóvel, indisciplina...)" value={ocorrenciaDetalhe} onChange={e => setOcorrenciaDetalhe(e.target.value)} className="w-full p-4 bg-slate-50/80 rounded-2xl border border-slate-200 outline-none h-32 resize-none focus:bg-white focus:ring-4 focus:ring-rose-500/10 focus:border-rose-400 transition-all text-sm font-medium text-slate-700" />
            </div>

            <div className="flex flex-col gap-3 pt-2">
                <label className={`flex items-start gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer ${encaminharCoord ? 'bg-rose-50 border-rose-500 shadow-sm' : 'bg-slate-50 border-transparent hover:bg-slate-100'}`}>
                    <div className="flex items-center h-5 mt-0.5">
                        <input type="checkbox" checked={encaminharCoord} onChange={e => setEncaminharCoord(e.target.checked)} className="w-5 h-5 text-rose-600 rounded focus:ring-rose-500 border-gray-300 transition-all" />
                    </div>
                    <div className="flex flex-col">
                        <span className={`text-sm tracking-tight font-extrabold flex items-center gap-1.5 ${encaminharCoord ? 'text-rose-800' : 'text-slate-700'}`}>Encaminhar logo à Coordenação <AlertTriangle size={14} strokeWidth={3} /></span>
                        <span className="text-[11px] font-medium text-slate-500 leading-tight mt-1">O aluno será enviado para a fila imediata de atendimento da coordenação.</span>
                    </div>
                </label>
                <button onClick={handleOcorrencia} className="w-full bg-gradient-to-r from-rose-600 to-rose-500 text-white py-4 rounded-2xl font-bold shadow-lg shadow-rose-500/30 hover:shadow-rose-500/40 hover:-translate-y-0.5 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                    Submeter Registo <ArrowRight size={18} />
                </button>
            </div>
        </div>
    );
};
