import React, { useState } from 'react';
import { UserCheck, Lock, ArrowRight, User, Clock, Check, AlertOctagon } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db, appId } from '../../services/firebase';
import { LiveTimer } from '../../components/ui/LiveTimer';
import { useAppContext } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { useModals } from '../../contexts/ModalContext';

export const SaidasTab = () => {
    const { userRole, usernameInput } = useAuth();
    const { config, activeBlock, turmasExistentes, alunos, activeExits, getTodayExitsCount, getSuspendedInTurma } = useAppContext();
    const { showNotification, setAuthReturnModal, setOvertimeModal } = useModals();

    const [selectedTurma, setSelectedTurma] = useState('');
    const [selectedAlunoSaidaId, setSelectedAlunoSaidaId] = useState('');
    const [destinoSaida, setDestinoSaida] = useState('Banheiro');
    const [isEmergencyMode, setIsEmergencyMode] = useState(false);

    const locaisSaida = ["Banheiro", "Bebedouro", "Secretaria", "Coordenação", "Biblioteca", "Enfermaria"];
    const suspendedInTurma = getSuspendedInTurma(selectedTurma);

    const attemptReturn = (exit, isDemorou) => {
        const elapsedSecs = Math.floor((Date.now() - exit.startTime) / 1000);
        const limitSecs = Number(config.exitLimitMinutes) * 60;

        if (userRole === 'aluno' && elapsedSecs > limitSecs && !isDemorou) {
            showNotification("Acesso Negado: O tempo esgotou. Você deve usar 'Demorou'.");
            return;
        }

        if (exit.professor === usernameInput || userRole === 'admin') {
            if (isDemorou) {
                setAuthReturnModal({ exit, isDemorou: true }); // Simula a finalização direta após auth do admin/prof, simplificado no finalizer.
                return;
            }

            const elapsedMins = Math.floor(elapsedSecs / 60);
            if (elapsedSecs > limitSecs) {
                setOvertimeModal({ exit, elapsedMinutes: elapsedMins });
            } else {
                setAuthReturnModal({ exit, isDemorou: false, skipAuth: true });
            }
        } else {
            setAuthReturnModal({ exit, isDemorou });
        }
    };

    const handleCreateExit = async () => {
        const a = alunos.find(x => x.id === selectedAlunoSaidaId);
        if (!a) return showNotification("Selecione um aluno.");

        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'activeExits'), {
            alunoId: a.id, alunoNome: a.nome, turma: a.turma, destino: destinoSaida, startTime: Date.now(), professor: usernameInput,
            autorRole: userRole,
            isEmergency: activeBlock ? isEmergencyMode : false
        });
        setSelectedAlunoSaidaId('');
        setIsEmergencyMode(false);
        showNotification(activeBlock && isEmergencyMode ? "Emergência Registada!" : "Saída Autorizada!");
    }

    return (
        <div className="space-y-5 flex-1 w-full animate-in fade-in duration-300">
            <div className={`bg-white/90 backdrop-blur-sm p-6 rounded-[2rem] border border-white shadow-xl shadow-slate-200/40 space-y-5 transition-colors ${activeBlock ? 'bg-red-50/90 border-red-100 shadow-red-100/50' : ''}`}>
                <h3 className="text-sm font-extrabold flex items-center gap-2 text-indigo-600 tracking-tight"><UserCheck size={18} strokeWidth={2.5} /> Autorizar Saída</h3>

                {activeBlock && (
                    <div className="p-4 bg-red-100/80 border border-red-200 rounded-2xl animate-in zoom-in-95 flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-red-800 font-extrabold tracking-tight">
                            <Lock size={18} strokeWidth={2.5} /> Bloqueio Ativo: {activeBlock.label}
                        </div>
                        <p className="text-xs text-red-700 font-medium leading-relaxed">As saídas normais estão bloqueadas neste horário. Apenas emergências são permitidas.</p>
                        <label className="flex items-center gap-3 cursor-pointer mt-2 bg-white/60 p-3 rounded-xl border border-red-100 hover:bg-white/80 transition-colors">
                            <input type="checkbox" checked={isEmergencyMode} onChange={e => setIsEmergencyMode(e.target.checked)} className="w-5 h-5 text-red-600 rounded-md focus:ring-red-500 accent-red-600" />
                            <span className="text-sm font-bold text-red-800">Forçar Saída de Emergência</span>
                        </label>
                    </div>
                )}

                <select className="w-full p-4 bg-slate-50/80 rounded-2xl border border-slate-200 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all font-semibold text-slate-700 appearance-none" onChange={e => { setSelectedTurma(e.target.value); setSelectedAlunoSaidaId(''); }} value={selectedTurma}>
                    <option value="">Escolher Turma...</option>
                    {turmasExistentes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>

                {selectedTurma && suspendedInTurma.length > 0 && (
                    <div className="p-4 bg-red-50/80 border border-red-200 rounded-2xl animate-in zoom-in-95">
                        <p className="text-xs font-extrabold text-red-700 flex items-center gap-2 mb-2"><AlertOctagon size={16} strokeWidth={2.5} /> Alunos Suspensos nesta Turma (Não autorizar):</p>
                        <ul className="ml-1 space-y-1.5">
                            {suspendedInTurma.map(s => <li key={s.id} className="text-[11px] text-red-600 font-bold bg-white/50 px-2 py-1 rounded-md inline-block mr-1">• {s.alunoNome} <span className="opacity-75 font-semibold ml-1 text-red-500/80">(Pendente Coordenação)</span></li>)}
                        </ul>
                    </div>
                )}

                <div className="space-y-2">
                    <select className="w-full p-4 bg-slate-50/80 rounded-2xl border border-slate-200 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all font-semibold text-slate-700 appearance-none disabled:opacity-60 disabled:bg-slate-100" onChange={e => setSelectedAlunoSaidaId(e.target.value)} value={selectedAlunoSaidaId} disabled={!selectedTurma}>
                        <option value="">Selecionar Aluno...</option>
                        {alunos.filter(a => a.turma === selectedTurma).map(a => {
                            const isSuspended = suspendedInTurma.some(s => s.alunoId === a.id);
                            return <option key={a.id} value={a.id} disabled={isSuspended}>{a.nome} {isSuspended ? '(SUSPENSO)' : ''}</option>
                        })}
                    </select>

                    {selectedAlunoSaidaId && (
                        <div className="flex items-center gap-3 p-4 bg-indigo-50/80 border border-indigo-100 rounded-2xl animate-in zoom-in-95">
                            <div className="bg-indigo-100 p-2.5 rounded-xl text-indigo-600 shadow-sm"><Clock size={20} strokeWidth={2.5} /></div>
                            <p className="text-sm font-medium text-indigo-900 leading-tight">Este aluno já saiu <span className="font-extrabold text-lg text-indigo-600">{getTodayExitsCount(selectedAlunoSaidaId)}</span> vezes hoje.</p>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                    {locaisSaida.map(l => (
                        <button key={l} onClick={() => setDestinoSaida(l)}
                            className={`py-3 rounded-xl text-[10px] font-extrabold uppercase tracking-wide border transition-all active:scale-95
                  ${destinoSaida === l ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-200' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100 hover:border-slate-300'}`}>
                            {l}
                        </button>
                    ))}
                </div>

                <button
                    onClick={handleCreateExit}
                    className={`w-full py-4 rounded-2xl font-bold shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2
          ${activeBlock && isEmergencyMode ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-red-500/30 hover:shadow-red-500/40 hover:-translate-y-0.5' : 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-indigo-500/30 hover:shadow-indigo-500/40 hover:-translate-y-0.5'} 
          disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none`}
                    disabled={!selectedAlunoSaidaId || (activeBlock && !isEmergencyMode)}>
                    {activeBlock && isEmergencyMode ? 'CONFIRMAR EMERGÊNCIA' : 'CONFIRMAR SAÍDA'} <ArrowRight size={18} />
                </button>
            </div>

            <div className="space-y-3">
                {activeExits.map(e => (
                    <div key={e.id} className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-slate-200/60 flex justify-between items-center shadow-sm shadow-slate-200/50 hover:shadow-md hover:-translate-y-0.5 transition-all group">
                        <div className="flex items-center gap-3.5">
                            <div className="w-11 h-11 rounded-[14px] bg-indigo-50 text-indigo-500 flex items-center justify-center border border-indigo-100/50 group-hover:scale-105 transition-transform"><User size={20} strokeWidth={2.5} /></div>
                            <div>
                                <h4 className="font-extrabold text-sm leading-tight text-slate-800 tracking-tight">{e.alunoNome}</h4>
                                <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider flex items-center gap-1.5">
                                    <span className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md">{e.turma}</span> • {e.destino} <span className="text-indigo-500">{e.autorRole === 'aluno' ? 'Aluno(a)' : 'Prof.'} {e.professor}</span>
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-2.5">
                            <LiveTimer startTime={e.startTime} limitSeconds={config.exitLimitMinutes * 60} />
                            <div className="flex gap-1.5">
                                <button onClick={() => attemptReturn(e, false)} className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold shadow-sm shadow-slate-800/20 active:scale-95 transition-all flex items-center gap-1"><Check size={12} strokeWidth={3} /> Voltou</button>
                                <button onClick={() => attemptReturn(e, true)} className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 px-3 py-1.5 rounded-lg text-[10px] font-bold border border-red-200 shadow-sm active:scale-95 transition-all">Demorou</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
