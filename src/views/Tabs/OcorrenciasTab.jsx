import React, { useState, useMemo, useRef } from 'react';
import { ShieldAlert, Trophy, Check, Camera, X, AlertTriangle, ArrowRight } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db, appId } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useAppContext } from '../../contexts/AppContext';
import { useModals } from '../../contexts/ModalContext';

export const OcorrenciasTab = () => {
    const { userRole, usernameInput } = useAuth();
    const { alunos, turmasExistentes } = useAppContext();
    const { showNotification } = useModals();

    const [tab, setTab] = useState('disciplina'); // 'disciplina' ou 'merito'
    const [selectedTurma, setSelectedTurma] = useState('');
    const [selectedAlunosIds, setSelectedAlunosIds] = useState([]);
    const [extraInfo, setExtraInfo] = useState('Continuará em sala');
    const [selectedMotivos, setSelectedMotivos] = useState([]);
    const [obs, setObs] = useState('');
    const [base64Photo, setBase64Photo] = useState(null);
    const fileRef = useRef(null);

    const motivosDisciplina = [
        { label: "Passear no corredor" },
        { label: "Saída sem autorização" },
        { label: "Não faz a atividade" },
        { label: "Sem material" },
        { label: "Uso de Telemóvel" },
        { label: "Entrou em sala atrasado" },
        { label: "Conflito verbal" },
        { label: "Atrapalhando a aula" }
    ];

    const motivosMerito = [
        { label: "Excelente Participação" },
        { label: "Ajudou o Colega" },
        { label: "Superação de Dificuldade" },
        { label: "Liderança Positiva" }
    ];

    const handlePhoto = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 800;
                let width = img.width;
                let height = img.height;
                if (width > MAX_WIDTH) {
                    height *= (MAX_WIDTH / width);
                    width = MAX_WIDTH;
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                setBase64Photo(canvas.toDataURL('image/jpeg', 0.6));
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    };

    const toggleAluno = (id) => {
        setSelectedAlunosIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const toggleMotivo = (label) => {
        setSelectedMotivos(prev =>
            prev.includes(label) ? prev.filter(x => x !== label) : [...prev, label]
        );
    };

    const handleSave = async () => {
        if (selectedAlunosIds.length === 0) return showNotification("Selecione pelo menos um aluno!");

        try {
            const now = new Date();
            const ts = now.toLocaleString('pt-PT');
            const rawTs = now.getTime();

            for (const alunoId of selectedAlunosIds) {
                const alunoObj = alunos.find(a => a.id === alunoId);
                const descFinal = selectedMotivos.length > 0
                    ? `${selectedMotivos.join(', ')} [${extraInfo}]`
                    : `Registo s/ detalhe [${extraInfo}]`;

                const finalObs = obs.trim() ? `${descFinal} - OBS: ${obs}` : descFinal;

                await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'history'), {
                    alunoId: alunoObj.id,
                    alunoNome: alunoObj.nome,
                    turma: alunoObj.turma,
                    categoria: tab === 'disciplina' ? 'ocorrencia' : 'merito',
                    detalhe: finalObs,
                    timestamp: ts,
                    rawTimestamp: rawTs,
                    professor: usernameInput,
                    autorRole: userRole,
                    fotoUrl: base64Photo || null
                });

                if (tab === 'disciplina' && extraInfo === 'Retirado de sala') {
                    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'coordinationQueue'), {
                        alunoId: alunoObj.id,
                        alunoNome: alunoObj.nome,
                        turma: alunoObj.turma,
                        motivo: finalObs,
                        timestamp: ts,
                        professor: usernameInput,
                        fotoUrl: base64Photo || null
                    });
                }
            }

            setSelectedAlunosIds([]);
            setSelectedMotivos([]);
            setObs('');
            setBase64Photo(null);
            showNotification("Registos gravados com sucesso!");
        } catch (err) {
            showNotification("Erro ao gravar registos.");
        }
    };

    return (
        <div className="bg-white/90 backdrop-blur-sm p-6 rounded-[2rem] border border-white shadow-xl shadow-slate-200/40 space-y-6 animate-in slide-in-from-bottom-4 duration-300 flex-1 w-full">
            {/* Toggle Tipo */}
            <div className="flex bg-slate-100/80 p-1.5 rounded-2xl gap-1">
                <button
                    onClick={() => { setTab('disciplina'); setSelectedMotivos([]); }}
                    className={`flex-1 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${tab === 'disciplina' ? 'bg-white text-red-600 shadow-sm border border-slate-200/50 scale-[1.02]' : 'text-slate-500 hover:bg-slate-200/50'}`}
                >
                    <ShieldAlert size={16} strokeWidth={2.5} /> Disciplina
                </button>
                <button
                    onClick={() => { setTab('merito'); setSelectedMotivos([]); }}
                    className={`flex-1 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${tab === 'merito' ? 'bg-white text-emerald-600 shadow-sm border border-slate-200/50 scale-[1.02]' : 'text-slate-500 hover:bg-slate-200/50'}`}
                >
                    <Trophy size={16} strokeWidth={2.5} /> Mérito
                </button>
            </div>

            {/* Filtro Turma */}
            <select
                className="w-full p-4 bg-slate-50/80 rounded-2xl border border-slate-200 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all font-semibold text-slate-700 appearance-none"
                onChange={e => { setSelectedTurma(e.target.value); setSelectedAlunosIds([]); }}
                value={selectedTurma}
            >
                <option value="">Filtrar Turma...</option>
                {turmasExistentes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>

            {/* Listagem de Alunos (Múltipla Seleção) */}
            <div className="grid grid-cols-2 gap-2.5 max-h-52 overflow-y-auto pr-1">
                {alunos.filter(a => a.turma === selectedTurma).map(a => (
                    <button
                        key={a.id}
                        onClick={() => toggleAluno(a.id)}
                        className={`p-3.5 rounded-2xl text-xs font-bold border text-left transition-all active:scale-95 flex justify-between items-center ${selectedAlunosIds.includes(a.id) ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'}`}
                    >
                        <span className="truncate pr-2">{a.nome}</span>
                        {selectedAlunosIds.includes(a.id) && <Check size={16} className="shrink-0 text-white" />}
                    </button>
                ))}
            </div>

            {/* Extra Info (Disciplina apenas) */}
            {tab === 'disciplina' && selectedAlunosIds.length > 0 && (
                <div className="flex gap-2 p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200">
                    <button
                        onClick={() => setExtraInfo('Retirado de sala')}
                        className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${extraInfo === 'Retirado de sala' ? 'bg-red-500 text-white shadow-md' : 'text-slate-500 hover:bg-slate-200/50'}`}
                    >
                        Foi Retirado
                    </button>
                    <button
                        onClick={() => setExtraInfo('Continuará em sala')}
                        className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${extraInfo === 'Continuará em sala' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-200/50'}`}
                    >
                        Mantido em Sala
                    </button>
                </div>
            )}

            {/* Motivos Pré-configurados */}
            <div className="grid grid-cols-2 gap-2.5">
                {(tab === 'disciplina' ? motivosDisciplina : motivosMerito).map(m => {
                    const isSel = selectedMotivos.includes(m.label);
                    const colorClass = tab === 'disciplina' ? 'bg-red-50 border-red-300 text-red-700' : 'bg-emerald-50 border-emerald-300 text-emerald-700';
                    return (
                        <button
                            key={m.label}
                            onClick={() => toggleMotivo(m.label)}
                            className={`p-3.5 rounded-2xl text-[11px] font-bold border text-left transition-all active:scale-95 leading-tight ${isSel ? colorClass : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'}`}
                        >
                            {m.label}
                        </button>
                    );
                })}
            </div>

            {/* Observações e Foto */}
            <textarea
                placeholder="Observações adicionais (opcional)..."
                className="w-full p-4 bg-slate-50/80 rounded-2xl border border-slate-200 h-24 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-sm text-slate-700"
                value={obs}
                onChange={e => setObs(e.target.value)}
            />

            <div className="pt-4 border-t border-slate-100">
                {base64Photo ? (
                    <div className="relative inline-block w-full rounded-2xl border-2 border-indigo-100 bg-indigo-50 overflow-hidden group">
                        <img src={base64Photo} className="w-full object-contain max-h-56 rounded-xl" alt="Preview" />
                        <button
                            onClick={() => setBase64Photo(null)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 shadow-lg hover:scale-110 transition-all"
                        >
                            <X size={16} />
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => fileRef.current?.click()}
                        className="flex items-center gap-2.5 text-xs font-bold text-slate-600 bg-slate-100/80 hover:bg-slate-200 border border-slate-200 px-4 py-4 rounded-2xl transition-all w-full justify-center group"
                    >
                        <Camera size={18} className="text-slate-400 group-hover:text-slate-600" />
                        Anexar Evidência Fotográfica (Opcional)
                    </button>
                )}
                <input type="file" accept="image/*" capture="environment" ref={fileRef} onChange={handlePhoto} className="hidden" />
            </div>

            {/* Botão Gravar */}
            <button
                onClick={handleSave}
                disabled={selectedAlunosIds.length === 0}
                className={`w-full py-4 rounded-2xl font-extrabold text-white shadow-lg active:scale-[0.98] transition-all text-sm ${tab === 'disciplina' ? 'bg-gradient-to-r from-red-600 to-red-500 shadow-red-500/30' : 'bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-emerald-500/30'} disabled:opacity-50`}
            >
                GRAVAR REGISTO
            </button>
        </div>
    );
};
