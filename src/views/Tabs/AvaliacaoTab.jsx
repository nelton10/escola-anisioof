import React, { useState } from 'react';
import { Star, GraduationCap, ClipboardEdit, Send, History, LayoutGrid, Calendar, User, MessageSquare } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db, appId } from '../../services/firebase';
import { useAppContext } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { useModals } from '../../contexts/ModalContext';

export const AvaliacaoTab = () => {
    const { usernameInput } = useAuth();
    const { turmasExistentes, evaluations } = useAppContext();
    const { showNotification } = useModals();

    const [activeSubTab, setActiveSubTab] = useState('nova'); // 'nova' ou 'ver'
    const [selectedTurma, setSelectedTurma] = useState('');
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [obs, setObs] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!selectedTurma || rating === 0) {
            return showNotification("Selecione a turma e dê uma nota!");
        }

        setIsSubmitting(true);
        try {
            const now = new Date();
            await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'evaluations'), {
                turma: selectedTurma,
                nota: rating,
                observacoes: obs,
                professor: usernameInput,
                timestamp: now.toLocaleString('pt-PT'),
                rawTimestamp: now.getTime()
            });

            // Também registrar no histórico geral para transparência
            await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'history'), {
                turma: selectedTurma,
                alunoNome: '-- Turma Inteira --',
                categoria: 'avaliação',
                detalhe: `Avaliação de Aula: ${rating} estrelas. ${obs}`,
                professor: usernameInput,
                timestamp: now.toLocaleString('pt-PT'),
                rawTimestamp: now.getTime()
            });

            showNotification("Avaliação enviada com sucesso!");
            setRating(0);
            setObs('');
            // Opcional: mudar para a aba de ver
            setActiveSubTab('ver');
        } catch (error) {
            console.error(error);
            showNotification("Erro ao enviar avaliação.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredEvals = (evaluations || [])
        .filter(e => !selectedTurma || e.turma === selectedTurma)
        .sort((a, b) => (b.rawTimestamp || 0) - (a.rawTimestamp || 0));

    return (
        <div className="space-y-6 flex-1 w-full animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
            {/* Header com Navegação Interna */}
            <div className="flex bg-white/80 backdrop-blur-md p-1.5 rounded-3xl border border-white shadow-xl shadow-slate-200/30 w-full max-w-sm mx-auto overflow-hidden">
                <button
                    onClick={() => setActiveSubTab('nova')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-[10px] uppercase font-black tracking-widest transition-all ${activeSubTab === 'nova' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    <ClipboardEdit size={14} /> Fazer Avaliação
                </button>
                <button
                    onClick={() => setActiveSubTab('ver')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-[10px] uppercase font-black tracking-widest transition-all ${activeSubTab === 'ver' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    <History size={14} /> Ver Histórico
                </button>
            </div>

            {activeSubTab === 'nova' ? (
                <div className="bg-white/90 backdrop-blur-md p-8 rounded-[2.5rem] border border-white shadow-xl shadow-slate-200/40 space-y-8 animate-in slide-in-from-left-4 duration-300">
                    {/* Título */}
                    <div className="space-y-2">
                        <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                            <GraduationCap className="text-indigo-600" size={24} strokeWidth={2.5} />
                            Avaliação de Aula
                        </h2>
                        <p className="text-xs font-bold text-slate-400 leading-relaxed italic">
                            Registre o desempenho e comportamento da turma durante a sua aula.
                        </p>
                    </div>

                    {/* Seleção de Turma */}
                    <div className="space-y-3">
                        <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest ml-1">Turma Avaliada</label>
                        <select
                            className="w-full p-4 bg-slate-50/80 rounded-2xl border border-slate-200 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all font-bold text-slate-700 appearance-none"
                            value={selectedTurma}
                            onChange={(e) => setSelectedTurma(e.target.value)}
                        >
                            <option value="">Selecione a Turma...</option>
                            {turmasExistentes.map(t => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                    </div>

                    {/* Sistema de Estrelas */}
                    <div className="space-y-3 flex flex-col items-center py-4 bg-slate-50/50 rounded-[2rem] border border-dashed border-slate-200">
                        <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest mb-2">Qual nota você dá para esta aula?</label>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    onClick={() => setRating(star)}
                                    className="transform transition-all active:scale-90 hover:scale-110"
                                >
                                    <Star
                                        size={42}
                                        className={`${(hoverRating || rating) >= star ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200'} transition-colors duration-200`}
                                        strokeWidth={1.5}
                                    />
                                </button>
                            ))}
                        </div>
                        <span className="text-[10px] font-black mt-2 text-indigo-600 uppercase tracking-tighter">
                            {rating === 5 && "Excelente Aula!"}
                            {rating === 4 && "Boa Aula"}
                            {rating === 3 && "Aula Regular"}
                            {rating === 2 && "Aula Difícil"}
                            {rating === 1 && "Aula Muito Ruim"}
                            {rating === 0 && "Selecione uma estrela"}
                        </span>
                    </div>

                    {/* Observações */}
                    <div className="space-y-3">
                        <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest ml-1 flex items-center gap-2">
                            <ClipboardEdit size={14} /> Observações Importantes
                        </label>
                        <textarea
                            placeholder="Conte como foi a aula, alunos que se destacaram ou problemas específicos..."
                            className="w-full p-5 bg-slate-50/80 rounded-[2rem] border border-slate-200 h-32 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all font-medium text-sm text-slate-700 resize-none shadow-inner"
                            value={obs}
                            onChange={(e) => setObs(e.target.value)}
                        />
                    </div>

                    {/* Botão Enviar */}
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !selectedTurma || rating === 0}
                        className={`w-full py-5 rounded-[1.8rem] font-black text-white shadow-xl shadow-indigo-200/40 active:scale-[0.98] transition-all flex items-center justify-center gap-3 tracking-wide ${isSubmitting ? 'bg-slate-400' : 'bg-gradient-to-r from-indigo-600 to-indigo-500 hover:shadow-indigo-500/30 hover:-translate-y-0.5'} disabled:opacity-50 disabled:transform-none`}
                    >
                        {isSubmitting ? "ENVIANDO..." : (
                            <>
                                GRAVAR AVALIAÇÃO <Send size={18} />
                            </>
                        )}
                    </button>
                </div>
            ) : (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                    <div className="bg-white/90 backdrop-blur-md p-6 rounded-[2rem] border border-white shadow-lg shadow-slate-200/30 flex flex-col md:flex-row items-center gap-4">
                        <div className="bg-indigo-100 p-3 rounded-2xl text-indigo-600">
                            <LayoutGrid size={24} />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-sm font-black text-slate-800 tracking-tight">Filtrar por Turma</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Selecione para ver o histórico específico</p>
                        </div>
                        <select
                            className="w-full md:w-64 p-3.5 bg-slate-50/80 rounded-xl border border-slate-200 outline-none focus:bg-white font-bold text-slate-700 appearance-none"
                            value={selectedTurma}
                            onChange={(e) => setSelectedTurma(e.target.value)}
                        >
                            <option value="">Todas as Turmas</option>
                            {turmasExistentes.map(t => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-4">
                        {filteredEvals.length === 0 ? (
                            <div className="bg-white/60 backdrop-blur-sm p-12 rounded-[3rem] border border-dashed border-slate-200 text-center">
                                <p className="text-xs font-bold text-slate-400 italic">Nenhuma avaliação encontrada para os critérios selecionados.</p>
                            </div>
                        ) : filteredEvals.map((ev, idx) => (
                            <div key={idx} className="bg-white/95 backdrop-blur-md p-5 rounded-[2.2rem] border border-white shadow-lg shadow-slate-200/40 relative overflow-hidden group hover:shadow-indigo-200/50 transition-all duration-300">
                                <div className="absolute top-0 right-0 w-1 h-full bg-indigo-500/30 group-hover:w-2 transition-all"></div>

                                <div className="flex flex-col gap-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 font-black text-[10px] text-slate-600 uppercase tracking-widest">
                                                {ev.turma}
                                            </div>
                                            <div className="flex gap-0.5">
                                                {[1, 2, 3, 4, 5].map((s) => (
                                                    <Star key={s} size={14} className={`${s <= ev.nota ? 'text-yellow-400 fill-yellow-400' : 'text-slate-100'}`} />
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[9px] uppercase tracking-widest">
                                            <Calendar size={12} /> {ev.timestamp}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-indigo-600">
                                            <User size={12} strokeWidth={3} />
                                            <span className="text-[10px] font-black uppercase tracking-tight">Prof. {ev.professor}</span>
                                        </div>
                                        {ev.observacoes && (
                                            <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-100 flex gap-3 italic">
                                                <MessageSquare size={14} className="text-slate-300 shrink-0" />
                                                <p className="text-xs font-medium text-slate-600 leading-relaxed italic">
                                                    "{ev.observacoes}"
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Dica Informativa */}
            <div className="bg-amber-50/50 border border-amber-100 p-4 rounded-2xl flex items-start gap-3">
                <div className="bg-amber-100 p-1.5 rounded-lg text-amber-600">
                    <Star size={14} />
                </div>
                <p className="text-[10px] font-bold text-amber-800 leading-relaxed italic">
                    As avaliações de aula ajudam a gestão a entender o clima escolar e identificar turmas que precisam de apoio pedagógico ou disciplinar extra.
                </p>
            </div>
        </div>
    );
};
