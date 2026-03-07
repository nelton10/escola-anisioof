import React from 'react';
import { Activity } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';

export const AnaliseTab = () => {
    const { records } = useAppContext();

    const stats = React.useMemo(() => {
        if (!records) return { total: 0, ocorrencias: 0, saidas: 0, atrasos: 0, coord: 0 };
        return {
            total: records.length,
            ocorrencias: records.filter(r => r.categoria === 'ocorrencia').length,
            saidas: records.filter(r => r.categoria === 'saida').length,
            atrasos: records.filter(r => r.categoria === 'atraso').length,
            coord: records.filter(r => r.categoria === 'coordenação').length
        };
    }, [records]);

    return (
        <div className="space-y-6 flex-1 w-full animate-in fade-in duration-300">
            <div className="bg-white/90 backdrop-blur-sm p-6 rounded-[2rem] border border-white shadow-xl shadow-slate-200/40 space-y-5">
                <h3 className="text-sm font-extrabold flex items-center gap-2 text-indigo-600 tracking-tight"><Activity size={18} strokeWidth={2.5} /> Visão Geral (Base Atual)</h3>
                <div className="grid grid-cols-2 gap-3">
                    <div className="p-5 rounded-2xl bg-indigo-50 border border-indigo-100 flex flex-col justify-center items-center text-center">
                        <span className="text-3xl font-black text-indigo-600 mb-1">{stats.total}</span>
                        <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">Registos Totais</span>
                    </div>
                    <div className="p-5 rounded-2xl bg-rose-50 border border-rose-100 flex flex-col justify-center items-center text-center">
                        <span className="text-3xl font-black text-rose-600 mb-1">{stats.ocorrencias}</span>
                        <span className="text-[10px] uppercase font-bold text-rose-400 tracking-wider">Ocorrências</span>
                    </div>
                    <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-100 flex flex-col justify-center items-center text-center">
                        <span className="text-3xl font-black text-emerald-600 mb-1">{stats.saidas}</span>
                        <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Saídas Totais</span>
                    </div>
                    <div className="p-5 rounded-2xl bg-yellow-50 border border-yellow-100 flex flex-col justify-center items-center text-center">
                        <span className="text-3xl font-black text-yellow-600 mb-1">{stats.atrasos}</span>
                        <span className="text-[10px] uppercase font-bold text-yellow-400 tracking-wider">Atrasos (Portaria)</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
