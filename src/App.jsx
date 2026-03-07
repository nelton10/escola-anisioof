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
  const [saidasAtivas, setSaidasAtivas] = useState([]); // Nova lista para quem está fora
  const [alunoSelecionado, setAlunoSelecionado] = useState("");
  const [status, setStatus] = useState({ tipo: '', msg: '' });

  // 1. BUSCA LISTA GERAL DE ALUNOS
  useEffect(() => {
    const q = query(collection(db, "alunos"), orderBy("nome", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setAlunos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  // 2. BUSCA LISTA DE QUEM ESTÁ FORA (SAÍDAS ATIVAS)
  useEffect(() => {
    const qSaidas = query(collection(db, "saidas"), orderBy("dataSaida", "desc"));
    const unsubscribe = onSnapshot(qSaidas, (snapshot) => {
      setSaidasAtivas(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  // 3. REGISTRAR SAÍDA
  const registrarSaida = async (e) => {
    e.preventDefault();
    if (!alunoSelecionado) return setStatus({ tipo: 'erro', msg: 'Selecione um aluno!' });

    try {
      await addDoc(collection(db, "saidas"), {
        nomeAluno: alunoSelecionado,
        dataSaida: serverTimestamp(),
        escola: "EEMTI Anísio Teixeira"
      });
      setAlunoSelecionado("");
      setStatus({ tipo: 'sucesso', msg: 'Saída registrada!' });
    } catch (error) {
      setStatus({ tipo: 'erro', msg: 'Erro ao registrar saída.' });
    }
  };

  // 4. REGISTRAR VOLTA (A chave para o seu problema!)
  const registrarVolta = async (idDocumento) => {
    try {
      // Quando o aluno volta, removemos o registro da coleção "saidas"
      await deleteDoc(doc(db, "saidas", idDocumento));
      setStatus({ tipo: 'sucesso', msg: 'Retorno confirmado!' });
    } catch (error) {
      console.error(error);
      setStatus({ tipo: 'erro', msg: 'Erro ao registrar retorno.' });
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1>Gestão Anísio Teixeira</h1>
        <p>Controle de Fluxo</p>
      </header>

      {status.msg && (
        <div style={{...styles.alerta, backgroundColor: status.tipo === 'erro' ? '#ffcccc' : '#ccffcc'}}>
          {status.msg}
        </div>
      )}

      {/* SEÇÃO DE SAÍDA */}
      <section style={styles.section}>
        <h3>Registrar Nova Saída</h3>
        <form onSubmit={registrarSaida} style={styles.form}>
          <input
            list="lista-alunos"
            value={alunoSelecionado}
            onChange={(e) => setAlunoSelecionado(e.target.value)}
            placeholder="Nome do aluno..."
            style={styles.input}
          />
          <datalist id="lista-alunos">
            {alunos.map(aluno => <option key={aluno.id} value={aluno.nome} />)}
          </datalist>
          <button type="submit" style={styles.buttonSaida}>Confirmar Saída</button>
        </form>
      </section>

      {/* SEÇÃO DE QUEM ESTÁ FORA */}
      <section style={styles.section}>
        <h3>Alunos Ausentes ({saidasAtivas.length})</h3>
        <div style={styles.lista}>
          {saidasAtivas.length === 0 ? (
            <p>Nenhum aluno fora da sala no momento.</p>
          ) : (
            saidasAtivas.map((saida) => (
              <div key={saida.id} style={styles.itemSaida}>
                <span>{saida.nomeAluno}</span>
                <button 
                  onClick={() => registrarVolta(saida.id)} 
                  style={styles.buttonVolta}
                >
                  Marcar Volta
                </button>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

const styles = {
  container: { fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto', padding: '20px' },
  header: { textAlign: 'center', borderBottom: '2px solid #007bff', marginBottom: '20px' },
  section: { backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
  form: { display: 'flex', gap: '10px', flexDirection: 'column' },
  input: { padding: '10px', fontSize: '16px' },
  buttonSaida: { padding: '10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  buttonVolta: { padding: '5px 10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  itemSaida: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', borderBottom: '1px solid #ddd' },
  alerta: { padding: '10px', borderRadius: '5px', textAlign: 'center', marginBottom: '10px' }
};

export default App;
