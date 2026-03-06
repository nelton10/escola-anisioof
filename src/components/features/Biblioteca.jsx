import React from 'react';
import { BookMarked, UserMinus } from 'lucide-react';

export default function Biblioteca({ libraryQueue }) {
  return (
    <div className="space-y-4">
      <h3 className="font-black text-slate-800 flex items-center gap-2 mb-4">
        <BookMarked className="text-indigo-600" /> Alunos na Biblioteca
      </h3>
      {libraryQueue.length === 0 ? (
        <div className="py-10 text-center bg-white rounded-3xl border-2 border-dashed">
          <p className="text-slate-400 font-bold">Biblioteca vazia no momento.</p>
        </div>
      ) : (
        libraryQueue.map(item => (
          <div key={item.id} className="bg-white p-4 rounded-2xl border shadow-sm flex justify-between items-center">
            <p className="font-bold text-slate-800">{item.aluno}</p>
            <button className="p-3 bg-red-50 text-red-600 rounded-xl"><UserMinus size={18}/></button>
          </div>
        ))
      )}
    </div>
  );
}