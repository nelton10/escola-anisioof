import React, { useState } from 'react';
import { collection, addDoc, doc, deleteDoc } from 'firebase/firestore';
import { db, appId } from '../../firebase/config';
import { Clock, UserCheck, CheckCircle2 } from 'lucide-react';

export default function PainelSaidas({ alunos, usernameInput, activeExits }) {
  const [busca, setBusca] = useState('');

  const registrarSaida = async (aluno, tipo) => {
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'activeExits'), {
        alunoId: aluno.id, nome: aluno.nome, turma: aluno.turma, tipo, professor: usernameInput, timestamp: new Date().toLocaleTimeString('pt-BR'), rawTimestamp: Date.now()
      });
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'history'), {
        acao: `Saída: ${tipo}`, aluno: aluno.nome, turma: aluno.turma, professor: usernameInput, timestamp: new Date().toLocaleTimeString('pt-BR'), rawTimestamp: Date.now()
      });
      setBusca('');
    } catch (e) { alert("Erro ao registrar."); }
  };

  const registrarRetorno = async (id) => {
    await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'activeExits', id));
  };

  const filtrados = alunos.filter(a => a.nome.toLowerCase().includes(busca.toLowerCase())).slice(0, 5);

  return (
    <div className="space-y-6">
      <input className="w-full p-5 rounded-3xl border-none shadow-inner bg-white font-bold" placeholder="Buscar para saída..." value={busca} onChange={e => setBusca(e.target.value)} />
      {busca && (
        <div className="space-y-2">
          {filtrados.map(aluno => (
            <div key={aluno.id} className="p-4 bg-white rounded-2xl flex justify-between items-center shadow-sm">
              <p className="font-black text-xs">{aluno.nome}</p>
              <div className="flex gap-2">
                <button onClick={() => registrarSaida(aluno, 'Banheiro')} className="p-3 bg-blue-500 text-white rounded-xl"><Clock size={16}/></button>
                <button onClick={() => registrarSaida(aluno, 'Bebedouro')} className="p-3 bg-emerald-500 text-white rounded-xl"><UserCheck size={16}/></button>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="space-y-3">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Fora de Sala ({activeExits.length})</h4>
        {activeExits.map(s => (
          <div key={s.id} className="bg-white p-5 rounded-3xl shadow-md border border-indigo-50 flex justify-between items-center">
            <div><p className="font-black text-slate-800 text-sm">{s.nome}</p><p className="text-[10px] font-bold text-slate-400 uppercase">{s.tipo} • {s.timestamp}</p></div>
            <button onClick={() => registrarRetorno(s.id)} className="p-3 bg-slate-900 text-white rounded-2xl font-black text-[10px] flex items-center gap-1"><CheckCircle2 size={14}/> RETORNOU</button>
          </div>
        ))}
      </div>
    </div>
  );
}
