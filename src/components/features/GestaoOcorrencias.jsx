import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db, appId } from '../../firebase/config';
import { AlertTriangle, ShieldAlert } from 'lucide-react';

export default function GestaoOcorrencias({ alunos, usernameInput, turmasExistentes }) {
  const [selectedTurma, setSelectedTurma] = useState('');
  const [selectedAluno, setSelectedAluno] = useState('');
  const [tipo, setTipo] = useState('Fardamento');
  const [obs, setObs] = useState('');

  const salvarOcorrencia = async () => {
    if(!selectedAluno) return alert("Selecione um aluno!");
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'history'), {
        acao: `Ocorrência: ${tipo}`,
        aluno: selectedAluno,
        professor: usernameInput,
        observacao: obs,
        rawTimestamp: Date.now()
      });
      alert("Ocorrência registrada!");
      setObs('');
    } catch (e) { alert("Erro."); }
  };

  return (
    <div className="bg-white p-6 rounded-3xl shadow-lg space-y-4">
      <h3 className="font-bold flex items-center gap-2"><AlertTriangle className="text-orange-500"/> Nova Ocorrência</h3>
      <select className="w-full p-3 rounded-xl border bg-slate-50" onChange={e => setSelectedTurma(e.target.value)}>
        <option value="">Filtrar por Turma...</option>
        {turmasExistentes.map(t => <option key={t} value={t}>{t}</option>)}
      </select>
      
      <select className="w-full p-3 rounded-xl border bg-slate-50" onChange={e => setSelectedAluno(e.target.value)}>
        <option value="">Selecionar Aluno...</option>
        {alunos.filter(a => a.turma === selectedTurma).map(a => <option key={a.id} value={a.nome}>{a.nome}</option>)}
      </select>

      <div className="flex gap-2">
        {['Fardamento', 'Celular', 'Conflito'].map(t => (
          <button key={t} onClick={() => setTipo(t)} className={`flex-1 py-2 rounded-lg text-xs font-bold ${tipo === t ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-500'}`}>{t}</button>
        ))}
      </div>

      <textarea className="w-full p-3 rounded-xl border bg-slate-50" placeholder="Detalhes (opcional)..." value={obs} onChange={e => setObs(e.target.value)} />
      
      <button onClick={salvarOcorrencia} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2">
        <ShieldAlert size={20}/> REGISTRAR AGORA
      </button>
    </div>
  );
}