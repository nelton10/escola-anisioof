import React, { useState } from 'react';
import { Search, UserCircle, ClipboardList } from 'lucide-react';

export default function PesquisaAlunos({ alunos, records }) {
  const [busca, setBusca] = useState('');
  const [alunoSelecionado, setAlunoSelecionado] = useState(null);

  const historicoFiltrado = records.filter(r => r.aluno === alunoSelecionado?.nome);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          className="w-full pl-12 pr-4 py-4 rounded-2xl border shadow-sm outline-none focus:ring-4 focus:ring-indigo-500/10 font-bold"
          placeholder="Pesquisar por nome do aluno..."
          onChange={e => setBusca(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        {busca && alunos.filter(a => a.nome.toLowerCase().includes(busca.toLowerCase())).slice(0, 5).map(a => (
          <button key={a.id} onClick={() => setAlunoSelecionado(a)} className="w-full p-4 bg-white rounded-2xl border text-left font-bold flex justify-between items-center">
            {a.nome} <span className="text-xs text-slate-400">{a.turma}</span>
          </button>
        ))}
      </div>

      {alunoSelecionado && (
        <div className="bg-white p-6 rounded-3xl border border-indigo-100 shadow-xl mt-6 animate-in slide-in-from-bottom-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-indigo-100 p-3 rounded-2xl text-indigo-600"><UserCircle size={32}/></div>
            <div>
              <h4 className="font-black text-slate-800">{alunoSelecionado.nome}</h4>
              <p className="text-xs font-bold text-slate-400 uppercase">{alunoSelecionado.turma}</p>
            </div>
          </div>
          
          <h5 className="text-xs font-black text-slate-400 uppercase mb-4 flex items-center gap-2">
            <ClipboardList size={14}/> Histórico Individual Recente
          </h5>
          <div className="space-y-3">
            {historicoFiltrado.length === 0 ? <p className="text-xs font-bold text-slate-300">Sem registros recentes para este aluno.</p> :
              historicoFiltrado.map(h => (
                <div key={h.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-xs font-black text-slate-700">{h.acao}</p>
                  <p className="text-[10px] text-slate-400 font-bold">{h.timestamp}</p>
                </div>
              ))
            }
          </div>
        </div>
      )}
    </div>
  );
}