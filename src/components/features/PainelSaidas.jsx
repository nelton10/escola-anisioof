import React, { useState } from 'react';
import { collection, addDoc, doc, deleteDoc } from 'firebase/firestore'; // Importamos deleteDoc
import { db, appId } from '../../firebase/config';
import { LogOut, UserCheck, Clock, CheckCircle2 } from 'lucide-react';

export default function PainelSaidas({ alunos, usernameInput, activeExits }) {
  const [busca, setBusca] = useState('');

  // 1. REGISTRAR SAÍDA: Cria um registro temporário
  const registrarSaida = async (aluno, tipo) => {
    try {
      // Adiciona na fila de saídas ativas
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'activeExits'), {
        alunoId: aluno.id,
        nome: aluno.nome,
        turma: aluno.turma,
        tipo: tipo,
        professor: usernameInput,
        timestamp: new Date().toLocaleTimeString('pt-BR'),
        rawTimestamp: Date.now()
      });

      // Registra no histórico permanente (que já limitamos a 50 itens no App.jsx)
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'history'), {
        acao: `Saída: ${tipo}`,
        aluno: aluno.nome,
        turma: aluno.turma,
        professor: usernameInput,
        timestamp: new Date().toLocaleTimeString('pt-BR'),
        rawTimestamp: Date.now()
      });
      
      setBusca('');
    } catch (e) {
      alert("Erro ao registrar saída.");
    }
  };

  // 2. REGISTRAR RETORNO: A chave para economizar sua cota!
  const registrarRetorno = async (saidaId) => {
    try {
      // O segredo: DELETAR o documento da fila ativa
      // Isso remove o aluno da tela e impede que ele gaste leituras no futuro
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'activeExits', saidaId));
    } catch (e) {
      console.error("Erro ao registrar retorno:", e);
    }
  };

  const filtrados = alunos.filter(a => a.nome.toLowerCase().includes(busca.toLowerCase())).slice(0, 8);

  return (
    <div className="space-y-6">
      {/* BUSCA DE ALUNO */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
        <input 
          className="w-full p-4 rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-indigo-500 font-bold" 
          placeholder="Nome do aluno para saída..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
        
        {busca && (
          <div className="mt-4 space-y-2 animate-in fade-in slide-in-from-top-2">
            {filtrados.map(aluno => (
              <div key={aluno.id} className="p-4 bg-slate-50 rounded-2xl flex justify-between items-center border border-slate-100">
                <div className="max-w-[150px]">
                  <p className="font-black text-slate-800 text-sm truncate">{aluno.nome}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">{aluno.turma}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => registrarSaida(aluno, 'Banheiro')} className="p-3 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-200 active:scale-95 transition-all"><Clock size={18}/></button>
                  <button onClick={() => registrarSaida(aluno, 'Bebedouro')} className="p-3 bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-200 active:scale-95 transition-all"><UserCheck size={18}/></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* LISTA DE ALUNOS FORA DE SALA */}
      <div className="space-y-3">
        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">Alunos fora de sala ({activeExits.length})</h4>
        {activeExits.length === 0 ? (
          <div className="py-10 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200">
            <p className="font-bold text-slate-300">Todos os alunos estão em sala.</p>
          </div>
        ) : (
          activeExits.map(saida => (
            <div key={saida.id} className="bg-white p-5 rounded-3xl shadow-xl border border-indigo-50 flex justify-between items-center animate-in zoom-in-95 duration-300">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`w-2 h-2 rounded-full ${saida.tipo === 'Banheiro' ? 'bg-blue-500' : 'bg-emerald-500'} animate-pulse`}></span>
                  <p className="font-black text-slate-800">{saida.nome}</p>
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Saída: {saida.timestamp} • {saida.tipo}</p>
              </div>
              <button 
                onClick={() => registrarRetorno(saida.id)} 
                className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-2xl font-black text-[10px] hover:bg-emerald-600 transition-colors shadow-lg shadow-slate-200"
              >
                <CheckCircle2 size={16} /> RETORNOU
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
