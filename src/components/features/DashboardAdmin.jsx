import React, { useState } from 'react';
import { Settings, Database, FileSpreadsheet, History as HistoryIcon, AlertTriangle } from 'lucide-react';

export default function DashboardAdmin({ alunos, records, config, saveConfig }) {
  const [jsonInput, setJsonInput] = useState('');

  const atualizarAlunos = () => {
    try {
      const lista = JSON.parse(jsonInput);
      if (Array.isArray(lista)) {
        saveConfig({ ...config, alunosList: lista });
        alert("Lista de alunos atualizada!");
        setJsonInput('');
      }
    } catch (e) { alert("JSON Inválido! Use aspas duplas."); }
  };

  const downloadCSV = (conteudo, nome) => {
    const blob = new Blob(["\ufeff" + conteudo], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${nome}_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.csv`;
    link.click();
  };

  const exportarAlunos = () => {
    const cabecalho = "ID,Nome,Turma\n";
    const corpo = alunos.map(a => `${a.id},"${a.nome}","${a.turma}"`).join("\n");
    downloadCSV(cabecalho + corpo, "lista_alunos_anisio");
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-slate-100">
        <h3 className="font-black text-slate-800 flex items-center gap-2 mb-6"><Settings className="text-indigo-600"/> Painel Administrativo</h3>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-slate-50 p-5 rounded-3xl border flex flex-col items-center">
            <p className="text-[10px] font-black text-slate-400 uppercase">Alunos</p>
            <p className="text-2xl font-black text-indigo-600">{alunos.length}</p>
            <button onClick={exportarAlunos} className="mt-2 text-emerald-600"><FileSpreadsheet size={20}/></button>
          </div>
          <div className="bg-slate-50 p-5 rounded-3xl border flex flex-col items-center text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase">Ações Hoje</p>
            <p className="text-2xl font-black text-orange-500">{records.length}</p>
          </div>
        </div>
        <textarea className="w-full p-4 rounded-2xl bg-slate-50 border h-32 font-mono text-xs" 
          placeholder='[{"id": "1", "nome": "Aluno", "turma": "1A"}]' value={jsonInput} onChange={e => setJsonInput(e.target.value)} />
        <button onClick={atualizarAlunos} className="w-full mt-4 py-4 bg-slate-900 text-white rounded-2xl font-black flex justify-center gap-2"><Database size={20}/> SINCRONIZAR BANCO</button>
      </div>
    </div>
  );
}
