import React, { useState, useMemo } from 'react';
import { Activity, TrendingUp, TrendingDown, Users, Award, AlertCircle, ChevronRight, BarChart3, Search, Star, Printer, FileDown } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';

export const AnaliseTab = ({ onStudentClick }) => {
    const { records, turmasExistentes, evaluations } = useAppContext();
    const [selectedTurma, setSelectedTurma] = useState('');

    const handlePrint = () => {
        window.print();
    };

    const stats = useMemo(() => {
        if (!records) return {
            total: 0, ocorrencias: 0, saidas: 0, atrasos: 0, coord: 0, meritos: 0,
            topInfratores: [], topMeritos: [], topTurmas: []
        };

        const categories = {
            total: records.length,
            ocorrencias: records.filter(r => r.categoria === 'ocorrencia').length,
            saidas: records.filter(r => r.categoria === 'saida').length,
            atrasos: records.filter(r => r.categoria === 'atraso').length,
            coord: records.filter(r => r.categoria === 'coordenação').length,
            meritos: records.filter(r => r.categoria === 'merito').length
        };

        // Ranking de Alunos (Ocorrências)
        const infratoresMap = {};
        records.filter(r => r.categoria === 'ocorrencia').forEach(r => {
            infratoresMap[r.alunoNome] = (infratoresMap[r.alunoNome] || 0) + 1;
        });
        const topInfratores = Object.entries(infratoresMap)
            .map(([nome, count]) => ({ nome, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        // Ranking de Alunos (Mérito)
        const meritosMap = {};
        records.filter(r => r.categoria === 'merito').forEach(r => {
            meritosMap[r.alunoNome] = (meritosMap[r.alunoNome] || 0) + 1;
        });
        const topMeritos = Object.entries(meritosMap)
            .map(([nome, count]) => ({ nome, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        // Ranking de Turmas (Atividade Total + Média Avaliação)
        const turmasMap = {};
        records.forEach(r => {
            if (r.turma) {
                if (!turmasMap[r.turma]) turmasMap[r.turma] = { total: 0, ocorrencias: 0, meritos: 0, sumStars: 0, countEval: 0 };
                turmasMap[r.turma].total++;
                if (r.categoria === 'ocorrencia') turmasMap[r.turma].ocorrencias++;
                if (r.categoria === 'merito') turmasMap[r.turma].meritos++;
            }
        });

        // Adicionar avaliações ao mapa de turmas
        (evaluations || []).forEach(ev => {
            if (ev.turma) {
                if (!turmasMap[ev.turma]) turmasMap[ev.turma] = { total: 0, ocorrencias: 0, meritos: 0, sumStars: 0, countEval: 0 };
                turmasMap[ev.turma].sumStars += Number(ev.nota || 0);
                turmasMap[ev.turma].countEval++;
            }
        });

        const topTurmas = Object.entries(turmasMap)
            .map(([turma, data]) => ({
                turma,
                ...data,
                avgRating: data.countEval > 0 ? (data.sumStars / data.countEval).toFixed(1) : '–'
            }))
            .sort((a, b) => b.ocorrencias - a.ocorrencias)
            .slice(0, 6);

        return { ...categories, topInfratores, topMeritos, topTurmas };
    }, [records, evaluations]);

    const turmaDetail = useMemo(() => {
        if (!selectedTurma || !records) return null;
        const filtered = records.filter(r => r.turma === selectedTurma);
        const oc = filtered.filter(r => r.categoria === 'ocorrencia').length;
        const me = filtered.filter(r => r.categoria === 'merito').length;
        const sa = filtered.filter(r => r.categoria === 'saida').length;

        // Avaliações da turma específica
        const tEvals = (evaluations || []).filter(e => e.turma === selectedTurma);
        const avg = tEvals.length > 0
            ? (tEvals.reduce((acc, curr) => acc + Number(curr.nota || 0), 0) / tEvals.length).toFixed(1)
            : '–';

        // Alunos mais ativos na turma
        const tMap = {};
        filtered.forEach(r => {
            tMap[r.alunoNome] = (tMap[r.alunoNome] || 0) + 1;
        });
        const topAlunos = Object.entries(tMap)
            .map(([nome, count]) => ({ nome, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 3);

        return { total: filtered.length, oc, me, sa, topAlunos, avgRating: avg, evalCount: tEvals.length };
    }, [selectedTurma, records, evaluations]);

    return (
        <div className="space-y-6 flex-1 w-full animate-in fade-in duration-500 pb-10">
            {/* Título e Header */}
            <div className="flex items-center justify-between px-2 no-print">
                <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                    <BarChart3 className="text-indigo-600" size={24} strokeWidth={2.5} />
                    Painel de Inteligência
                </h2>
                <div className="flex gap-2">
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-200 text-[10px] font-black uppercase text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
                    >
                        <Printer size={14} /> Imprimir Relatório
                    </button>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-2 rounded-xl border">
                        Análise em Tempo Real
                    </div>
                </div>
            </div>

            {/* Estilos de Impressão */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    .no-print { display: none !important; }
                    body { background: white !important; padding: 0 !important; margin: 0 !important; }
                    .bg-white, .bg-slate-50, .bg-slate-900 { 
                        background: white !important; 
                        color: black !important; 
                        box-shadow: none !important;
                        border: 1px solid #ddd !important;
                    }
                    .text-white, .text-indigo-400, .text-slate-400 { color: black !important; }
                    .rounded-[3rem], .rounded-[2.5rem], .rounded-[2rem] { border-radius: 8px !important; }
                    select, button { display: none !important; }
                    .grid { display: block !important; }
                    .grid > div { margin-bottom: 1.5rem !important; page-break-inside: avoid; }
                }
            `}} />

            {/* Cards de Visão Geral */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/80 backdrop-blur-md p-5 rounded-[2rem] border border-white shadow-lg shadow-slate-200/40 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform">
                        <Activity size={40} className="text-indigo-600" />
                    </div>
                    <span className="text-3xl font-black text-indigo-600 block">{stats.total}</span>
                    <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">Registros Atuais</span>
                </div>
                <div className="bg-white/80 backdrop-blur-md p-5 rounded-[2rem] border border-white shadow-lg shadow-slate-200/40 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform">
                        <AlertCircle size={40} className="text-rose-600" />
                    </div>
                    <span className="text-3xl font-black text-rose-600 block">{stats.ocorrencias}</span>
                    <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">Ocorrências</span>
                </div>
                <div className="bg-white/80 backdrop-blur-md p-5 rounded-[2rem] border border-white shadow-lg shadow-slate-200/40 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform">
                        <Award size={40} className="text-emerald-600" />
                    </div>
                    <span className="text-3xl font-black text-emerald-600 block">{stats.meritos}</span>
                    <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">Méritos/Elogios</span>
                </div>
                <div className="bg-white/80 backdrop-blur-md p-5 rounded-[2rem] border border-white shadow-lg shadow-slate-200/40 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform">
                        <Star size={40} className="text-yellow-500" />
                    </div>
                    <span className="text-3xl font-black text-slate-800 block">{evaluations?.length || 0}</span>
                    <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">Avaliações de Aula</span>
                </div>
            </div>

            {/* Ranking de Alunos */}
            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white/90 backdrop-blur-sm p-6 rounded-[2.5rem] border border-white shadow-xl shadow-slate-200/30">
                    <h3 className="text-sm font-extrabold flex items-center gap-2 mb-5 text-rose-600">
                        <TrendingDown size={18} /> Ranking de Ocorrências
                    </h3>
                    <div className="space-y-3">
                        {stats.topInfratores.length === 0 ? (
                            <p className="text-xs font-bold text-slate-400 text-center py-4 italic">Sem registros críticos.</p>
                        ) : stats.topInfratores.map((a, idx) => (
                            <button
                                key={idx}
                                onClick={() => onStudentClick && onStudentClick(a.nome)}
                                className="w-full flex items-center justify-between p-3.5 bg-slate-50/50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer group/item"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="w-6 h-6 flex items-center justify-center bg-rose-100 text-rose-600 rounded-lg text-[10px] font-black">{idx + 1}</span>
                                    <span className="text-xs font-extrabold text-slate-700 group-hover/item:text-indigo-600">{a.nome}</span>
                                </div>
                                <span className="text-xs font-black text-rose-500 bg-rose-50 px-2.5 py-1 rounded-lg group-hover/item:bg-indigo-50 group-hover/item:text-indigo-500">{a.count}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-white/90 backdrop-blur-sm p-6 rounded-[2.5rem] border border-white shadow-xl shadow-slate-200/30">
                    <h3 className="text-sm font-extrabold flex items-center gap-2 mb-5 text-emerald-600">
                        <TrendingUp size={18} /> Destaques Positivos (Méritos)
                    </h3>
                    <div className="space-y-3">
                        {stats.topMeritos.length === 0 ? (
                            <p className="text-xs font-bold text-slate-400 text-center py-4 italic">Incentive os alunos!</p>
                        ) : stats.topMeritos.map((a, idx) => (
                            <button
                                key={idx}
                                onClick={() => onStudentClick && onStudentClick(a.nome)}
                                className="w-full flex items-center justify-between p-3.5 bg-slate-50/50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer group/item"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="w-6 h-6 flex items-center justify-center bg-emerald-100 text-emerald-600 rounded-lg text-[10px] font-black">{idx + 1}</span>
                                    <span className="text-xs font-extrabold text-slate-700 group-hover/item:text-indigo-600">{a.nome}</span>
                                </div>
                                <span className="text-xs font-black text-emerald-500 bg-emerald-50 px-2.5 py-1 rounded-lg group-hover/item:bg-indigo-50 group-hover/item:text-indigo-500">{a.count}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Ranking de Turmas */}
            <div className="bg-white/90 backdrop-blur-sm p-8 rounded-[3rem] border border-white shadow-xl shadow-slate-200/40">
                <h3 className="text-sm font-extrabold flex items-center gap-2 mb-8 text-indigo-800">
                    <BarChart3 size={18} /> Clima Escolar por Turma
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                    {stats.topTurmas.map((t, idx) => {
                        const percOc = (t.ocorrencias / (t.total || 1)) * 100;
                        const percMe = (t.meritos / (t.total || 1)) * 100;
                        return (
                            <div key={idx} className="space-y-3 p-1 rounded-xl">
                                <div className="flex justify-between items-end mb-1">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-black text-slate-800">{t.turma}</span>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <Star size={10} className="fill-yellow-400 text-yellow-400" />
                                            <span className="text-[10px] font-black text-slate-600">{t.avgRating} / 5</span>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-400">{t.total} movimentos</span>
                                </div>
                                <div className="space-y-2">
                                    <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner border border-slate-200/50">
                                        <div className="h-full bg-rose-500 transition-all duration-1000 shadow-[0_0_10px_rgba(244,63,94,0.3)]" style={{ width: `${percOc}% ` }}></div>
                                        <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${percMe}% ` }}></div>
                                    </div>
                                    <div className="flex justify-between text-[8px] font-black uppercase tracking-wider">
                                        <span className="text-rose-500 flex items-center gap-1"><div className="w-1.5 h-1.5 bg-rose-500 rounded-full"></div> {t.ocorrencias} Oc.</span>
                                        <span className="text-emerald-600 flex items-center gap-1">{t.meritos} Méritos <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div></span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Resumo Detalhado por Turma (Interativo) */}
            <div className="bg-slate-900 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
                    <div className="md:w-1/3 space-y-4">
                        <h3 className="text-lg font-black tracking-tight leading-tight">Explorador de<br /><span className="text-indigo-400 underline decoration-indigo-400/30 underline-offset-4">Dados Específicos</span></h3>
                        <p className="text-xs font-bold text-slate-400 leading-relaxed italic">Selecione uma turma para ver o perfil de comportamento e os alunos mais mencionados.</p>
                        <select
                            className="w-full mt-4 p-4 bg-slate-800/80 rounded-2xl border border-slate-700 outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all font-bold text-sm text-indigo-100 appearance-none shadow-xl cursor-pointer"
                            value={selectedTurma}
                            onChange={(e) => setSelectedTurma(e.target.value)}
                        >
                            <option value="">Escolher Turma...</option>
                            {turmasExistentes.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>

                    <div className="md:w-2/3 w-full">
                        {!turmaDetail ? (
                            <div className="h-48 flex items-center justify-center border-2 border-dashed border-slate-700/50 rounded-[2.5rem]">
                                <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] animate-pulse">Aguardando Seleção...</span>
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 gap-6 animate-in zoom-in-95 duration-300">
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="p-4 bg-slate-800 rounded-2xl border border-slate-700 text-center flex flex-col items-center shadow-lg">
                                            <span className="text-2xl font-black text-white">{turmaDetail.total}</span>
                                            <span className="block text-[8px] uppercase font-black text-slate-500 tracking-tighter">Movimentos</span>
                                        </div>
                                        <div className="p-4 bg-indigo-600/20 rounded-2xl border border-indigo-500/30 text-center flex flex-col items-center shadow-lg">
                                            <div className="flex items-center gap-1 mb-1">
                                                <Star size={16} className="fill-yellow-400 text-yellow-400" />
                                                <span className="text-2xl font-black text-white">{turmaDetail.avgRating}</span>
                                            </div>
                                            <span className="block text-[8px] uppercase font-black text-indigo-400 tracking-tighter">Nota Média</span>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-slate-800 rounded-2xl border border-slate-700 flex items-center justify-between shadow-lg">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] uppercase font-black text-slate-500 mb-1">Comportamento</span>
                                            <div className="flex gap-4">
                                                <span className="text-sm font-black text-rose-400">{turmaDetail.oc} <span className="text-[9px] text-slate-600">Oc.</span></span>
                                                <span className="text-sm font-black text-emerald-400">{turmaDetail.me} <span className="text-[9px] text-slate-600">Méritos</span></span>
                                            </div>
                                        </div>
                                        <div className="text-[9px] font-bold text-slate-500 italic lowercase">{turmaDetail.evalCount} aulas avaliadas</div>
                                    </div>
                                </div>
                                <div className="bg-slate-800/50 p-6 rounded-[2rem] border border-slate-700 shadow-lg">
                                    <h4 className="text-[9px] uppercase font-black text-slate-400 mb-4 flex items-center gap-2 tracking-widest"><Users size={12} strokeWidth={3} /> Protagonistas</h4>
                                    <div className="space-y-2">
                                        {turmaDetail.topAlunos.map((a, i) => (
                                            <button
                                                key={i}
                                                onClick={() => onStudentClick && onStudentClick(a.nome)}
                                                className="w-full flex justify-between items-center bg-slate-800 p-2.5 rounded-xl border border-slate-700/50 hover:bg-slate-700 transition-all group/subitem cursor-pointer"
                                            >
                                                <span className="text-[10px] font-bold truncate max-w-[140px] group-hover/subitem:text-indigo-300">{a.nome}</span>
                                                <div className="flex items-center gap-1">
                                                    <span className="text-[10px] font-black text-indigo-400">{a.count}</span>
                                                    <ChevronRight size={12} className="text-slate-600 group-hover/subitem:translate-x-0.5 transition-transform" />
                                                </div>
                                            </button>
                                        ))}
                                        {turmaDetail.topAlunos.length === 0 && <p className="text-[10px] text-slate-600 italic py-4 text-center">Nenhum evento registrado.</p>}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
