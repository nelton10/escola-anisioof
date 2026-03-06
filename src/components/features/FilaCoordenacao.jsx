import React from 'react';
import { collection, deleteDoc, doc, addDoc } from 'firebase/firestore';
import { db, appId } from '../../firebase/config';
import { Users, CheckCircle, Trash2 } from 'lucide-react';

export default function FilaCoordenacao({ coordinationQueue, usernameInput }) {
  const finalizarAtendimento = async (item) => {
    try {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'coordinationQueue', item.id));
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'history'), {
        acao: 'Atendimento Concluído',
        aluno: item.aluno,
        professor: usernameInput,
        rawTimestamp: Date.now()
      });
      alert("Atendimento finalizado!");
    } catch (e) { alert("Erro ao finalizar."); }
  };

  return (
    <div className="space-y-4">
      <h3 className="font-black text-slate-800 flex items-center gap-2 mb-4">
        <Users className="text-indigo-600" /> Fila da Coordenação
      </h3>
      
      {coordinationQueue.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-3xl border-2 border-dashed border-slate-200">
          <p className="font-bold text-slate-400">Nenhum aluno em espera.</p>
        </div>
      ) : (
        coordinationQueue.map(item => (
          <div key={item.id} className="bg-white p-5 rounded-2xl border-l-4 border-l-indigo-600 shadow-sm flex justify-between items-center">
            <div>
              <p className="font-black text-slate-800">{item.aluno}</p>
              <p className="text-xs font-bold text-slate-500 uppercase">{item.motivo}</p>
            </div>
            <button onClick={() => finalizarAtendimento(item)} className="p-3 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-colors">
              <CheckCircle size={20} />
            </button>
          </div>
        ))
      )}
    </div>
  );
}