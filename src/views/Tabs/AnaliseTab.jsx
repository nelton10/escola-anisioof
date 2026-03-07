import React, { useMemo, useState } from 'react';
import { Activity, TrendingUp, TrendingDown, Users, Award, AlertCircle, ChevronRight, BarChart3, Search } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';

export const AnaliseTab = () => {
    const { records, turmasExistentes } = useAppContext();
    const [selectedTurma, setSelectedTurma] = useState('');

    const stats = useMemo(() => {
        if (!records || records.length === 0) return {
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

        // Ranking de Turmas (Atividade Total)
        const turmasMap = {};
        records.forEach(r => {
            if (r.turma) {
                if (!turmasMap[r.turma]) turmasMap[r.turma] = { total: 0, ocorrencias: 0, meritos: 0 };
                turmasMap[r.turma].total++;
                if (r.categoria === 'ocorrencia') turmasMap[r.turma].ocorrencias++;
                if (r.categoria === 'merito') turmasMap[r.turma].meritos++;
            }
        });
        const topTurmas = Object.entries(turmasMap)
            .map(([turma, data]) => ({ turma, ...data }))
            .sort((a, b) => b.ocorrencias - a.ocorrencias)
            .slice(0, 6);

        return { ...categories, topInfratores, topMeritos, topTurmas };
    }, [records]);

    const turmaDetail = useMemo(() => {
        if (!selectedTurma || !records) return null;
        const filtered = records.filter(r => r.turma === selectedTurma);
        const oc = filtered.filter(r => r.categoria === 'ocorrencia').length;
        const me = filtered.filter(r => r.categoria === 'merito').length;
        const sa = filtered.filter(r => r.categoria === 'saida').length;

        // Alunos mais ativos na turma
        const tMap = {};
        filtered.forEach(r => {
            tMap[r.alunoNome] = (tMap[r.alunoNome] || 0) + 1;
        });
        const topAlunos = Object.entries(tMap)
            .map(([nome, count]) => ({ nome, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 3);

        return { total: filtered.length, oc, me, sa, topAlunos };
    }, [selectedTurma, records]);

    return (
        <div className="space-y-6 flex-1 w-full animate-in fade-in duration-500 pb-10">
            {/* Título e Header */}
            <div className="flex items-center justify-between px-2">
                <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                    <BarChart3 className="text-indigo-600" size={24} strokeWidth={2.5} />
                    Painel de Inteligência
                </h2>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full border">
                    Atualizado agora
                </div>
            </div>

            {/* Cards de Visão Geral */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/80 backdrop-blur-md p-5 rounded-[2rem] border border-white shadow-lg shadow-slate-200/40 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform">
                        <Activity size={40} className="text-indigo-600" />
                    </div>
                    <span className="text-3xl font-black text-indigo-600 block">{stats.total}</span>
                    <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">Total de Registros</span>
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
                        <Users size={40} className="text-slate-600" />
                    </div>
                    <span className="text-3xl font-black text-slate-800 block">{turmasExistentes.length}</span>
                    <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">Turmas Ativas</span>
                </div>
            </div>

            {/* Ranking de Alunos */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Ranking Negativo */}
                <div className="bg-white/90 backdrop-blur-sm p-6 rounded-[2.5rem] border border-white shadow-xl shadow-slate-200/30">
                    <h3 className="text-sm font-extrabold flex items-center gap-2 mb-5 text-rose-600">
                        <TrendingDown size={18} /> Alunos com mais Ocorrências
                    </h3>
                    <div className="space-y-3">
                        {stats.topInfratores.length === 0 ? (
                            <p className="text-xs font-bold text-slate-400 text-center py-4 italic">Sem registros no momento.</p>
                        ) : stats.topInfratores.map((a, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3.5 bg-slate-50/50 rounded-2xl border border-slate-100 hover:bg-white transition-colors">
                                <div className="flex items-center gap-3">
                                    <span className="w-6 h-6 flex items-center justify-center bg-rose-100 text-rose-600 rounded-lg text-[10px] font-black">{idx + 1}</span>
                                    <span className="text-xs font-extrabold text-slate-700">{a.nome}</span>
                                </div>
                                <span className="text-xs font-black text-rose-500 bg-rose-50 px-2.5 py-1 rounded-lg">{a.count}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Ranking Positivo */}
                <div className="bg-white/90 backdrop-blur-sm p-6 rounded-[2.5rem] border border-white shadow-xl shadow-slate-200/30">
                    <h3 className="text-sm font-extrabold flex items-center gap-2 mb-5 text-emerald-600">
                        <TrendingUp size={18} /> Alunos com mais Méritos
                    </h3>
                    <div className="space-y-3">
                        {stats.topMeritos.length === 0 ? (
                            <p className="text-xs font-bold text-slate-400 text-center py-4 italic">Surpreenda os alunos!</p>
                        ) : stats.topMeritos.map((a, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3.5 bg-slate-50/50 rounded-2xl border border-slate-100 hover:bg-white transition-colors">
                                <div className="flex items-center gap-3">
                                    <span className="w-6 h-6 flex items-center justify-center bg-emerald-100 text-emerald-600 rounded-lg text-[10px] font-black">{idx + 1}</span>
                                    <span className="text-xs font-extrabold text-slate-700">{a.nome}</span>
                                </div>
                                <span className="text-xs font-black text-emerald-500 bg-emerald-50 px-2.5 py-1 rounded-lg">{a.count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Ranking de Turmas */}
            <div className="bg-white/90 backdrop-blur-sm p-8 rounded-[3rem] border border-white shadow-xl shadow-slate-200/40">
                <h3 className="text-sm font-extrabold flex items-center gap-2 mb-8 text-indigo-800">
                    <BarChart3 size={18} /> Análise Comportamental por Turma
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                    {stats.topTurmas.map((t, idx) => {
                        const percOc = (t.ocorrencias / (t.total || 1)) * 100;
                        const percMe = (t.meritos / (t.total || 1)) * 100;
                        return (
                            <div key={idx} className="space-y-3 p-1 rounded-xl">
                                <div className="flex justify-between items-end mb-1">
                                    <span className="text-sm font-black text-slate-800">{t.turma}</span>
                                    <span className="text-[10px] font-bold text-slate-400">{t.total} mov. totais</span>
                                </div>
                                <div className="space-y-2">
                                    <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
                                        <div className="h-full bg-rose-500 rounded-r-sm transition-all duration-1000" style={{ width: `${percOc}%` }}></div>
                                        <div className="h-full bg-emerald-500 rounded-l-sm transition-all duration-1000" style={{ width: `${percMe}%` }}></div>
                                    </div>
                                    <div className="flex justify-between text-[9px] font-black uppercase tracking-wider">
                                        <span className="text-rose-500 flex items-center gap-1"><div className="w-1.5 h-1.5 bg-rose-500 rounded-full"></div> {t.ocorrencias} Ocorrências</span>
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
                            className="w-full mt-4 p-4 bg-slate-800/80 rounded-2xl border border-slate-700 outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all font-bold text-sm text-indigo-100 appearance-none"
                            value={selectedTurma}
                            onChange={(e) => setSelectedTurma(e.target.value)}
                        >
                            <option value="">Escolher Turma...</option>
                            {turmasExistentes.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>

                    <div className="md:w-2/3 w-full">
                        {!turmaDetail ? (
                            <div className="h-40 flex items-center justify-center border-2 border-dashed border-slate-700/50 rounded-3xl">
                                <span className="text-xs font-black text-slate-600 uppercase tracking-widest">Aguardando Seleção...</span>
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 gap-6 animate-in zoom-in-95 duration-300">
                                <div className="space-y-5">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="p-4 bg-slate-800 rounded-2xl border border-slate-700 text-center">
                                            <span className="text-2xl font-black text-white">{turmaDetail.total}</span>
                                            <span className="block text-[9px] uppercase font-bold text-slate-500">Ações</span>
                                        </div>
                                        <div className="p-4 bg-slate-800 rounded-2xl border border-slate-700 text-center">
                                            <span className="text-2xl font-black text-rose-400">{turmaDetail.oc}</span>
                                            <span className="block text-[9px] uppercase font-bold text-slate-500">Conflitos</span>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-indigo-600/10 border border-indigo-500/40 rounded-2xl flex items-center justify-between">
                                        <span className="text-[10px] uppercase font-black text-indigo-300">Meritocracia</span>
                                        <span className="text-xl font-black text-emerald-400">+{turmaDetail.me}</span>
                                    </div>
                                </div>
                                <div className="bg-slate-800/50 p-6 rounded-3xl border border-slate-700">
                                    <h4 className="text-[10px] uppercase font-black text-slate-400 mb-4 flex items-center gap-2"><Users size={12} /> Alunos Protagonistas</h4>
                                    <div className="space-y-2">
                                        {turmaDetail.topAlunos.map((a, i) => (
                                            <div key={i} className="flex justify-between items-center bg-slate-800 p-2.5 rounded-xl border border-slate-700/50">
                                                <span className="text-[11px] font-bold truncate max-w-[120px]">{a.nome}</span>
                                                <ChevronRight size={14} className="text-indigo-400" />
                                            </div>
                                        ))}
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
