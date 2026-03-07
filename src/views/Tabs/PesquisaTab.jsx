import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';

export const PesquisaTab = () => {
    const { alunos } = useAppContext();
    const [searchQuery, setSearchQuery] = useState('');

    const searchResults = React.useMemo(() => {
        if (!searchQuery.trim() || searchQuery.length < 3) return [];
        const query = searchQuery.toLowerCase();
        return alunos.filter(a => a.nome.toLowerCase().includes(query) || a.turma.toLowerCase().includes(query));
    }, [searchQuery, alunos]);

    return (
        <div className="space-y-6 flex-1 w-full animate-in fade-in duration-300">
            <div className="bg-white/90 backdrop-blur-sm p-6 rounded-[2rem] border border-white shadow-xl shadow-slate-200/40 space-y-4">
                <h3 className="text-sm font-extrabold flex items-center gap-2 text-indigo-600 tracking-tight"><Search size={18} strokeWidth={2.5} /> Pesquisa de Alunos</h3>
                <div className="relative border-2 border-slate-200 rounded-2xl bg-white focus-within:ring-4 focus-within:ring-indigo-500/10 focus-within:border-indigo-400 focus-within:bg-indigo-50/10 transition-all overflow-hidden">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500"><Search size={20} strokeWidth={3} /></div>
                    <input type="text" placeholder="Digite nome ou turma (mín. 3 letras)..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-transparent outline-none font-bold text-slate-700 text-sm placeholder:text-slate-400" />
                </div>

                {searchQuery.length >= 3 && (
                    <div className="mt-6 space-y-3">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-2 mb-2">Resultados da Busca:</p>
                        {searchResults.length === 0 ? (
                            <div className="text-center p-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200"><p className="text-sm font-bold text-slate-400">Nenhum aluno encontrado.</p></div>
                        ) : (
                            searchResults.map(a => (
                                <div key={a.id} className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/60 flex justify-between items-center shadow-sm hover:shadow-md hover:bg-white transition-all group">
                                    <div>
                                        <h4 className="font-extrabold text-sm text-slate-800 tracking-tight">{a.nome}</h4>
                                        <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider mt-1 bg-indigo-50 px-2 py-0.5 rounded-lg inline-block border border-indigo-100">{a.turma}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
