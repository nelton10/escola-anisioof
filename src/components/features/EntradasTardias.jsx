import React from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db, appId } from '../../firebase/config';
import { Clock9, AlertCircle } from 'lucide-react';

export default function EntradasTardias({ alunos, usernameInput, turmasExistentes }) {
  const registrarAtraso = async (aluno) => {
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'history'), {
        acao: 'Entrada Tardia / Atraso',
        aluno: aluno.nome,
        turma: aluno.turma,
        professor: usernameInput,
        rawTimestamp: Date.now(),
        timestamp: new Date().toLocaleTimeString('pt-BR')
      });
      alert(`Atraso de ${aluno.nome} registrado!`);
    } catch (e) { alert("Erro ao registrar."); }
  };

  return (
    <div className="space-y-4">
      <h3 className="font-black text-slate-800 flex items-center gap-2 mb-4">
        <Clock9 className="text-indigo-600" /> Registro de Atrasos
      </h3>
      <p className="text-xs font-bold text-slate-400 px-2 uppercase">Selecione o aluno que chegou atrasado:</p>
      {/* Aqui você pode reutilizar a lógica de busca do Painel de Saídas */}
      <div className="grid gap-2">
        {alunos.slice(0, 10).map(aluno => (
          <button key={aluno.id} onClick={() => registrarAtraso(aluno)} className="p-4 bg-white rounded-2xl border text-left hover:border-indigo-600 transition-all font-bold">
            {aluno.nome} <span className="text-[10px] text-slate-400 ml-2">({aluno.turma})</span>
          </button>
        ))}
      </div>
    </div>
  );
}