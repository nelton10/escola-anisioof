import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';

function App() {
  const [alunos, setAlunos] = useState([]);
  const [saidasAtivas, setSaidasAtivas] = useState([]);
  const [alunoSelecionado, setAlunoSelecionado] = useState("");
  const [status, setStatus] = useState({ tipo: '', msg: '' });

  // 1. Monitorar Lista Geral de Alunos
  useEffect(() => {
    const q = query(collection(db, "alunos"), orderBy("nome", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setAlunos(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (err) => console.error("Erro Alunos:", err));
    return () => unsubscribe();
  }, []);

  // 2. Monitorar Saídas Ativas
  useEffect(() => {
    const qSaidas = query(collection(db, "saidas"), orderBy("dataSaida", "desc"));
    const unsubscribe = onSnapshot(qSaidas, (snapshot) => {
      setSaidasAtivas(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (err) => console.error("Erro Saídas:", err));
    return () => unsubscribe();
  }, []);

  // 3. Função de Saída
  const registrarSaida = async (e) => {
    e.preventDefault();
    if (!alunoSelecionado) return setStatus({ tipo: 'erro', msg: 'Selecione um aluno!' });

    try {
      await addDoc(collection(db, "saidas"), {
        nomeAluno: alunoSelecionado,
        dataSaida: serverTimestamp()
      });
      setAlunoSelecionado("");
      setStatus({ tipo: 'sucesso', msg: 'Saída confirmada!' });
    } catch (err) {
      console.error(err);
      setStatus({ tipo: 'erro', msg: 'Falha ao registrar saída.' });
    }
  };

  // 4. Função de Volta (Onde estava o erro)
  const registrarVolta = async (idDoc) => {
    if (!idDoc) return;
    try {
      console.log("Deletando id:", idDoc);
      // Criamos a referência do documento antes de deletar
      const referencia = doc(db, "saidas", idDoc);
      await deleteDoc(referencia);
      setStatus({ tipo: 'sucesso', msg: 'Aluno voltou!' });
    } catch (err) {
      console.error("Erro ao deletar:", err);
      setStatus({ tipo: 'erro', msg: 'Erro ao marcar volta.' });
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '500px', margin: '0 auto' }}>
      <h2>Controle Anísio Teixeira</h2>

      {status.msg && <p style={{ color: status.tipo === 'erro' ? 'red' : 'green' }}>{status.msg}</p>}

      <form onSubmit={registrarSaida}>
        <input 
          list="lista" 
          value={alunoSelecionado} 
          onChange={(e) => setAlunoSelecionado(e.target.value)} 
          placeholder="Nome do aluno..."
          style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
        />
        <datalist id="lista">
          {alunos.map(a => <option key={a.id} value={a.nome} />)}
        </datalist>
        <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none' }}>
          Registrar Saída
        </button>
      </form>

      <hr style={{ margin: '20px 0' }} />

      <h3>Alunos Fora ({saidasAtivas.length})</h3>
      {saidasAtivas.map(s => (
        <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid #eee' }}>
          <span>{s.nomeAluno}</span>
          <button 
            onClick={() => registrarVolta(s.id)} 
            style={{ backgroundColor: '#28a745', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px' }}
          >
            Marcar Volta
          </button>
        </div>
      ))}
    </div>
  );
}

export default App;
