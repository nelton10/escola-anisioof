import React, { useMemo } from 'react';
import { X, User, Calendar, ShieldAlert, Award, Timer, ChevronRight, FileText, TrendingUp, TrendingDown } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';

export const StudentProfileModal = ({ alunoNome, onClose }) => {
    const { records, getSuspendedInTurma } = useAppContext();

    const studentRecords = useMemo(() => {
        return (records || [])
            .filter(r => r.alunoNome === alunoNome)
            .sort((a, b) => (b.rawTimestamp || 0) - (a.rawTimestamp || 0));
    }, [records, alunoNome]);

    const stats = useMemo(() => {
        const total = studentRecords.length;
        const ocorrencias = studentRecords.filter(r => r.categoria === 'ocorrencia').length;
        const meritos = studentRecords.filter(r => r.categoria === 'merito').length;
        const atrasos = studentRecords.filter(r => r.categoria === 'atraso').length;
        const saidas = studentRecords.filter(r => r.categoria === 'saida').length;

        return { total, ocorrencias, meritos, atrasos, saidas };
    }, [studentRecords]);

    if (!alunoNome) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-slate-50 w-full max-w-2xl max-h-[90vh] rounded-[3rem] shadow-2xl border border-white overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="bg-white p-6 md:p-8 border-b border-slate-100 relative">
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                    >
                        <X size={24} />
                    </button>

                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                            <User size={32} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight leading-none mb-1">
                                {alunoNome}
                            </h2>
                            <p className="text-[10px] uppercase font-black text-slate-400 tracking-[0.2em]">
                                Perfil 360º do Aluno
                            </p>
                        </div>
                    </div>

                    {/* Mini Stats Quick View */}
                    <div className="grid grid-cols-4 gap-3 mt-8">
                        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
                            <span className="block text-lg font-black text-rose-500">{stats.ocorrencias}</span>
                            <span className="text-[8px] uppercase font-black text-slate-400">Oc.</span>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
                            <span className="block text-lg font-black text-emerald-500">{stats.meritos}</span>
                            <span className="text-[8px] uppercase font-black text-slate-400">Méritos</span>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
                            <span className="block text-lg font-black text-amber-500">{stats.atrasos}</span>
                            <span className="text-[8px] uppercase font-black text-slate-400">Atrasos</span>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
                            <span className="block text-lg font-black text-indigo-500">{stats.saidas}</span>
                            <span className="text-[8px] uppercase font-black text-slate-400">Saídas</span>
                        </div>
                    </div>
                </div>

                {/* Content - Scrollable */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 custom-scrollbar">
                    {studentRecords.length === 0 ? (
                        <div className="py-20 text-center space-y-4">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-300">
                                <FileText size={32} />
                            </div>
                            <p className="text-sm font-bold text-slate-400 italic">Nenhum registro encontrado para este aluno.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <h3 className="text-[10px] uppercase font-black text-slate-400 tracking-widest flex items-center gap-2 mb-2">
                                <Calendar size={12} /> Linha do Tempo de Atividades
                            </h3>
                            {studentRecords.map((record, index) => (
                                <div key={index} className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${record.categoria === 'ocorrencia' ? 'bg-rose-500' :
                                            record.categoria === 'merito' ? 'bg-emerald-500' :
                                                record.categoria === 'atraso' ? 'bg-amber-500' : 'bg-indigo-500'
                                        }`}></div>

                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            {record.categoria === 'ocorrencia' && <ShieldAlert size={14} className="text-rose-500" />}
                                            {record.categoria === 'merito' && <Award size={14} className="text-emerald-500" />}
                                            {record.categoria === 'atraso' && <Timer size={14} className="text-amber-500" />}
                                            <span className={`text-[10px] font-black uppercase tracking-tight ${record.categoria === 'ocorrencia' ? 'text-rose-600' :
                                                    record.categoria === 'merito' ? 'text-emerald-600' :
                                                        record.categoria === 'atraso' ? 'text-amber-600' : 'text-indigo-600'
                                                }`}>
                                                {record.categoria}
                                            </span>
                                        </div>
                                        <span className="text-[9px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">
                                            {record.timestamp}
                                        </span>
                                    </div>

                                    <p className="text-xs font-bold text-slate-700 leading-relaxed mb-3">
                                        {record.detalhe}
                                    </p>

                                    <div className="flex items-center gap-4 text-[9px] font-black uppercase text-slate-400 tracking-tighter">
                                        <span className="flex items-center gap-1"><GraduationCap size={10} /> {record.turma}</span>
                                        <span className="flex items-center gap-1"><User size={10} /> Prof. {record.professor}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer / CTA */}
                <div className="p-6 bg-white border-t border-slate-100 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-8 py-3 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-colors"
                    >
                        Fechar Visualização
                    </button>
                </div>
            </div>
        </div>
    );
};
