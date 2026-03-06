import React from 'react';
import { History, UserCircle, Tag } from 'lucide-react';

export default function Historico({ records }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center px-2">
        <h3 className="font-black text-slate-800 flex items-center gap-2">
          <History className="text-indigo-600" /> Atividades Recentes
        </h3>
        <span className="text-[10px] bg-slate-200 px-2 py-1 rounded-full font-bold text-slate-600">Últimas 100</span>
      </div>
      
      <div className="space-y-3">
        {records.length === 0 && <p className="text-center py-10 text-slate-400 font-bold">Nenhum registro encontrado.</p>}
        {records.map(log => (
          <div key={log.id} className="bg-white p-4 rounded-2xl border shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <span className={`text-[10px] font-black px-2 py-1 rounded-md uppercase ${log.acao.includes('Ocorrência') ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                {log.acao}
              </span>
              <span className="text-[10px] font-bold text-slate-400">{log.timestamp || 'Agora'}</span>
            </div>
            <p className="font-bold text-slate-700 flex items-center gap-1"><UserCircle size={14}/> {log.aluno}</p>
            <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-1 font-medium italic"><Tag size={12}/> {log.professor}</p>
          </div>
        ))}
      </div>
    </div>
  );
}