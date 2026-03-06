import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, appId } from '../../firebase/config';
import { LogOut, UserCheck, Clock } from 'lucide-react';

export default function PainelSaidas({ alunos, usernameInput, activeExits }) {
  const [busca, setBusca] = useState('');
  
  const registrarSaida = async (aluno, tipo) => {
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'activeExits'), {
        alunoId: aluno.id,
        nome: aluno.nome,
        turma: aluno.turma,
        tipo: tipo,
        professor: usernameInput,
        timestamp: new Date().toLocaleTimeString('pt-BR'),
        rawTimestamp: Date.now()
      });
      
      // Também registramos no histórico geral (limitado no App.jsx para economizar cota)
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'history'), {
        acao: `Saída: ${tipo}`,
        aluno: aluno.nome,
        turma: aluno.turma,
        professor: usernameInput,
        rawTimestamp: Date.now()
      });
      
      alert(`Saída de ${aluno.nome} registrada!`);
    } catch (e) {
      alert("Erro ao registrar saída.");
    }
  };

  const filtrados = alunos.filter(a => a.nome.toLowerCase().includes(busca.toLowerCase())).slice(0, 10);

  return (
    <div className="space-y-4">
      <input 
        className="w-full p-4 rounded-2xl border shadow-sm outline-none focus:ring-2 focus:ring-indigo-500" 
        placeholder="Buscar aluno para saída..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
      />
      
      <div className="grid gap-3">
        {filtrados.map(aluno => (
          <div key={aluno.id} className="bg-white p-4 rounded-2xl shadow-sm border flex justify-between items-center">
            <div>
              <p className="font-bold text-slate-800">{aluno.nome}</p>
              <p className="text-xs text-slate-500">{aluno.turma}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => registrarSaida(aluno, 'Banheiro')} className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Clock size={18}/></button>
              <button onClick={() => registrarSaida(aluno, 'Bebedouro')} className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><UserCheck size={18}/></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}