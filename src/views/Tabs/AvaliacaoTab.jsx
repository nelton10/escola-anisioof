import React, { useState } from 'react';
import { Star, GraduationCap, ClipboardEdit, Send } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db, appId } from '../../services/firebase';
import { useAppContext } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { useModals } from '../../contexts/ModalContext';

export const AvaliacaoTab = () => {
    const { usernameInput } = useAuth();
    const { turmasExistentes } = useAppContext();
    const { showNotification } = useModals();

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
            setSelectedTurma('');
            setObs('');
        } catch (error) {
            console.error(error);
            showNotification("Erro ao enviar avaliação.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6 flex-1 w-full animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
            <div className="bg-white/90 backdrop-blur-md p-8 rounded-[2.5rem] border border-white shadow-xl shadow-slate-200/40 space-y-8">
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
