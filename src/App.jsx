import React, { useState, useEffect } from 'react';
import { db } from './firebase'; // Importando o banco que configuramos
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  query, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';

function App() {
  const [alunos, setAlunos] = useState([]);
  const [alunoSelecionado, setAlunoSelecionado] = useState("");
  const [status, setStatus] = useState({ tipo: '', msg: '' });

  // BUSCA DE ALUNOS - Com fechamento de conexão (Crucial!)
  useEffect(() => {
    const q = query(collection(db, "alunos"), orderBy("nome", "asc"));
    
    // Abrindo a conexão em tempo real
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dados = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAlunos(dados);
    }, (error) => {
      console.error("Erro ao buscar alunos:", error);
      setStatus({ tipo: 'erro', msg: 'Erro ao carregar lista de alunos.' });
    });

    // REGRA DE OURO: Quando o app fecha, a conexão com o Firebase é cortada aqui.
    // Isso evita que você gaste sua cota à toa!
    return () => unsubscribe();
  }, []);

  const registrarSaida = async (e) => {
    e.preventDefault();

    if (!alunoSelecionado) {
      setStatus({ tipo: 'erro', msg: 'Por favor, selecione um aluno!' });
      return;
    }

    try {
      setStatus({ tipo: 'info', msg: 'Registrando...' });

      // Salvando no Firebase
      await addDoc(collection(db, "saidas"), {
        nomeAluno: alunoSelecionado,
        dataSaida: serverTimestamp(), // Usa a hora do servidor, não do celular (mais seguro)
        escola: "EEMTI Anísio Teixeira"
      });

      setAlunoSelecionado("");
      setStatus({ tipo: 'sucesso', msg: 'Saída registrada com sucesso!' });
      
      // Limpa a mensagem após 3 segundos
      setTimeout(() => setStatus({ tipo: '', msg: '' }), 3000);

    } catch (error) {
      console.error("Erro ao registrar:", error);
      setStatus({ tipo: 'erro', msg: 'Falha ao registrar. O sistema tentará novamente offline.' });
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1>Gestão Anísio Teixeira</h1>
        <p>Controle de Saída de Alunos</p>
      </header>

      <main style={styles.main}>
        {status.msg && (
          <div style={{...styles.alerta, backgroundColor: status.tipo === 'erro' ? '#ffcccc' : '#ccffcc'}}>
            {status.msg}
          </div>
        )}

        <form onSubmit={registrarSaida} style={styles.form}>
          <label htmlFor="aluno">Nome do Aluno:</label>
          <input
            id="aluno"
            list="lista-alunos"
            value={alunoSelecionado}
            onChange={(e) => setAlunoSelecionado(e.target.value)}
            placeholder="Comece a digitar o nome..."
            style={styles.input}
            autoComplete="off"
          />
          
          <datalist id="lista-alunos">
            {alunos.map((aluno) => (
              <option key={aluno.id} value={aluno.nome} />
            ))}
          </datalist>

          <button type="submit" style={styles.button}>
            Confirmar Saída
          </button>
        </form>
      </main>
    </div>
  );
}

// Estilização Básica (Para não precisar de CSS externo por enquanto)
const styles = {
  container: { fontFamily: 'sans-serif', maxWidth: '500px', margin: '0 auto', padding: '20px' },
  header: { textAlign: 'center', marginBottom: '30px', borderBottom: '2px solid #007bff', paddingBottom: '10px' },
  main: { display: 'flex', flexDirection: 'column', gap: '20px' },
  form: { display: 'flex', flexDirection: 'column', gap: '10px' },
  input: { padding: '12px', fontSize: '16px', borderRadius: '5px', border: '1px solid #ccc' },
  button: { padding: '15px', fontSize: '18px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' },
  alerta: { padding: '10px', borderRadius: '5px', textAlign: 'center', fontWeight: 'bold' }
};

export default App;
