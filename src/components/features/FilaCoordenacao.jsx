import React from 'react';
import { collection, deleteDoc, doc, addDoc } from 'firebase/firestore';
import { db, appId } from '../../firebase/config';
import { Users, CheckCircle, Trash2, Clock } from 'lucide-react';

export default function FilaCoordenacao({ coordinationQueue, usernameInput }) {
  
  // A FUNÇÃO DE OURO: Deleta o registro para economizar sua cota
  const finalizarAtendimento = async (item) => {
    try {
      // 1. Remove da fila ativa imediatamente (Para de gastar leitura)
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'coordinationQueue', item.id));

      // 2. Grava apenas uma linha no histórico para registro oficial
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'history'), {
        acao: `Atendimento Concluído: ${item.motivo}`,
        aluno: item.aluno,
        turma: item.turma || "N/A",
        professor: usernameInput, // Quem finalizou o atendimento
        timestamp: new Date().toLocaleTimeString('pt-BR'),
        rawTimestamp: Date.now()
      });

      alert(`Atendimento de ${item.aluno} arquivado com sucesso!`);
    } catch (e) {
      console.error("Erro ao finalizar:", e);
      alert("Erro ao limpar a fila.");
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="flex justify-between items-center px-2">
        <h3 className="font-black text-slate-800 flex items-center gap-2">
          <Users className="text-indigo-600" /> Fila de Espera ({coordinationQueue.length})
        </h3>
      </div>
      
      {coordinationQueue.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200">
          <p className="font-bold text-slate-300 uppercase tracking-widest text-xs">Nenhum aluno aguardando</p>
        </div>
      ) : (
        coordinationQueue.map(item => (
          <div key={item.id} className="bg-white p-6 rounded-[2rem] border-l-8 border-l-indigo-600 shadow-xl flex justify-between items-center group hover:scale-[1.01] transition-all">
            <div className="space-y-1">
              <p className="font-black text-slate-800 text-lg">{item.aluno}</p>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md uppercase">
                  {item.motivo}
                </span>
                <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                  <Clock size={10} /> {item.timestamp}
                </span>
              </div>
            </div>
            
            <button 
              onClick={() => finalizarAtendimento(item)} 
              className="p-4 bg-slate-900 text-white rounded-2xl shadow-lg shadow-slate-200 hover:bg-emerald-600 active:scale-90 transition-all"
              title="Finalizar e remover da fila"
            >
              <CheckCircle size={24} />
            </button>
          </div>
        ))
      )}
    </div>
  );
}
