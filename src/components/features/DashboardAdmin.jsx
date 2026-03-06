import React, { useState } from 'react';
import { 
  Settings, 
  Users, 
  Database, 
  Download, 
  FileSpreadsheet, 
  History as HistoryIcon,
  AlertTriangle
} from 'lucide-react';

export default function DashboardAdmin({ alunos, records, config, saveConfig }) {
  const [jsonInput, setJsonInput] = useState('');

  // 1. FUNÇÃO: Atualizar Lista de Alunos (Via JSON)
  const atualizarAlunos = () => {
    try {
      const lista = JSON.parse(jsonInput);
      if (Array.isArray(lista)) {
        saveConfig({ ...config, alunosList: lista });
        alert("Sucesso: Banco de dados de alunos atualizado!");
        setJsonInput('');
      } else {
        alert("Erro: O JSON deve ser uma lista [].");
      }
    } catch (e) {
      alert("Erro Matemático: Formato JSON inválido. Verifique aspas e vírgulas.");
    }
  };

  // 2. FUNÇÃO: Exportar Alunos (CSV)
  const exportarAlunosCSV = () => {
    if (alunos.length === 0) return alert("Sem dados para exportar.");
    
    const cabecalho = ["ID", "Nome", "Turma"];
    const linhas = alunos.map(a => [a.id, `"${a.nome.toUpperCase()}"`, `"${a.turma}"`].join(","));
    downloadCSV([cabecalho.join(","), ...linhas].join("\n"), "lista_alunos_anisio");
  };

  // 3. FUNÇÃO: Exportar Histórico de Ocorrências/Saídas (CSV)
  const exportarHistoricoCSV = () => {
    if (records.length === 0) return alert("Histórico vazio ou bloqueado pela cota.");
    
    const cabecalho = ["Data/Hora", "Ação", "Aluno", "Turma", "Responsável"];
    const linhas = records.map(r => [
      r.timestamp,
      `"${r.acao}"`,
      `"${r.aluno}"`,
      `"${r.turma || 'N/A'}"`,
      `"${r.professor}"`
    ].join(","));
    downloadCSV([cabecalho.join(","), ...linhas].join("\n"), "relatorio_geral_anisio");
  };

  // Função Auxiliar de Download (Abstração)
  const downloadCSV = (conteudo, nomeArquivo) => {
    const blob = new Blob(["\ufeff" + conteudo], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${nomeArquivo}_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500">
      {/* SEÇÃO 1: RESUMO E RELATÓRIOS */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-slate-100">
        <h3 className="font-black text-slate-800 flex items-center gap-2 mb-6">
          <Settings className="text-indigo-600" size={22} /> Painel de Controle Administrativo
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 flex justify-between items-center">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Alunos Ativos</p>
              <p className="text-3xl font-black text-indigo-600">{alunos.length}</p>
            </div>
            <button onClick={exportarAlunosCSV} className="p-4 bg-white text-emerald-600 rounded-2xl shadow-sm hover:scale-105 transition-transform border border-emerald-50">
              <FileSpreadsheet size={24} />
            </button>
          </div>

          <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 flex justify-between items-center">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ações Recentes</p>
              <p className="text-3xl font-black text-orange-500">{records.length}</p>
            </div>
            <button onClick={exportarHistoricoCSV} className="p-4 bg-white text-orange-600 rounded-2xl shadow-sm hover:scale-105 transition-transform border border-orange-50">
              <HistoryIcon size={24} />
            </button>
          </div>
        </div>

        {/* ALERTA DE COTA (Educativo) */}
        {records.length >= 100 && (
          <div className="mb-6 p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-3">
            <AlertTriangle className="text-amber-600 shrink-0" size={20} />
            <p className="text-[11px] font-bold text-amber-700">
              O freio de mão está ativo: Apenas as últimas 100 ações são exibidas para proteger sua cota do Firebase.
            </p>
          </div>
        )}
      </div>

      {/* SEÇÃO 2: ATUALIZAÇÃO DO BANCO DE DADOS */}
      <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl text-white">
        <h3 className="font-black flex items-center gap-2 mb-4">
          <Database className="text-indigo-400" /> Importar Lista Escolar
        </h3>
        <p className="text-xs text-slate-400 mb-6 font-medium">
          Cole abaixo o código JSON gerado pela secretaria. Isso substituirá a lista atual imediatamente.
        </p>

        <textarea 
          className="w-full p-5 rounded-2xl bg-slate-800 border border-slate-700 h-40 font-mono text-[11px] text-indigo-300 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          placeholder='[{"id": "1", "nome": "NELTON COSTA", "turma": "PROFMAT"}]'
          value={jsonInput}
          onChange={e => setJsonInput(e.target.value)}
        />

        <button 
          onClick={atualizarAlunos} 
          className="w-full mt-4 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black shadow-lg shadow-indigo-900/20 transition-all flex justify-center items-center gap-2"
        >
          <Database size={20} /> SINCRONIZAR COM O CLOUD
        </button>
      </div>
    </div>
  );
}