import React, { useState } from 'react';
import { Settings, Users, Database, ShieldCheck, Download } from 'lucide-react';

export default function DashboardAdmin({ alunos, records, config, saveConfig, turmasExistentes }) {
  const [jsonInput, setJsonInput] = useState('');

  const atualizarAlunos = () => {
    try {
      const lista = JSON.parse(jsonInput);
      if (Array.isArray(lista)) {
        saveConfig({ ...config, alunosList: lista });
        alert("Lista de alunos atualizada com sucesso!");
      }
    } catch (e) { alert("Erro: Formato JSON inválido."); }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
        <h3 className="font-black text-slate-800 flex items-center gap-2 mb-6">
          <Settings className="text-indigo-600" /> Configurações do Sistema
        </h3>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-slate-50 p-4 rounded-2xl border">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Total de Alunos</p>
            <p className="text-2xl font-black text-slate-800">{alunos.length}</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl border">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Ações Hoje</p>
            <p className="text-2xl font-black text-slate-800">{records.length}</p>
          </div>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-bold text-slate-600">Atualizar Banco de Dados (Colar JSON)</label>
          <textarea 
            className="w-full p-4 rounded-2xl bg-slate-50 border h-32 font-mono text-xs"
            placeholder='[{"nome": "Aluno Exemplo", "turma": "1A"}]'
            value={jsonInput}
            onChange={e => setJsonInput(e.target.value)}
          />
          <button onClick={atualizarAlunos} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black flex justify-center gap-2">
            <Database size={20} /> SINCRONIZAR ALUNOS
          </button>
        </div>
      </div>
    </div>
  );
}