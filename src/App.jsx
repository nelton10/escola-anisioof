import React, { useState, useEffect } from 'react';
import { auth, db, appId } from './firebase/config';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, onSnapshot, doc, setDoc, query, orderBy, limit, where } from 'firebase/firestore';

import LoginScreen from './components/auth/LoginScreen';
import PainelSaidas from './components/features/PainelSaidas';
import GestaoOcorrencias from './components/features/GestaoOcorrencias';
import DiarioBordo from './components/features/DiarioBordo';
import DashboardAdmin from './components/features/DashboardAdmin';
import Historico from './components/features/Historico';
import FilaCoordenacao from './components/features/FilaCoordenacao';
import Biblioteca from './components/features/Biblioteca';
import PesquisaAlunos from './components/features/PesquisaAlunos';
import EntradasTardias from './components/features/EntradasTardias';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('professor');
  const [activeTab, setActiveTab] = useState('saidas');
  const [usernameInput, setUsernameInput] = useState('');
  
  const [alunos, setAlunos] = useState([]);
  const [config, setConfig] = useState({});
  const [records, setRecords] = useState([]);
  const [activeExits, setActiveExits] = useState([]);
  const [coordinationQueue, setCoordinationQueue] = useState([]);
  const [libraryQueue, setLibraryQueue] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setUserRole(localStorage.getItem('userRole') || 'professor');
        setUsernameInput(localStorage.getItem('username') || 'Professor');
      } else {
        setUser(null);
        localStorage.clear();
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    
    const unsubConfig = onSnapshot(doc(db, 'artifacts', appId, 'public', 'data', 'config', 'main'), (d) => {
      if (d.exists()) {
        setConfig(d.data());
        if (d.data().alunosList) setAlunos(d.data().alunosList);
      }
    });

    // FILTRO DE HISTÓRICO: Admin vê tudo, Professor vê apenas o dele
    const qHistory = userRole === 'admin' 
      ? query(collection(db, 'artifacts', appId, 'public', 'data', 'history'), orderBy('rawTimestamp', 'desc'), limit(100))
      : query(collection(db, 'artifacts', appId, 'public', 'data', 'history'), where("professor", "==", usernameInput), orderBy('rawTimestamp', 'desc'), limit(50));

    const unsubHistory = onSnapshot(qHistory, (s) => setRecords(s.docs.map(d => ({ ...d.data(), id: d.id }))));
    const unsubExits = onSnapshot(query(collection(db, 'artifacts', appId, 'public', 'data', 'activeExits'), limit(30)), (s) => setActiveExits(s.docs.map(d => ({ ...d.data(), id: d.id }))));
    const unsubCoord = onSnapshot(query(collection(db, 'artifacts', appId, 'public', 'data', 'coordinationQueue'), limit(20)), (s) => setCoordinationQueue(s.docs.map(d => ({ ...d.data(), id: d.id }))));
    const unsubLib = onSnapshot(query(collection(db, 'artifacts', appId, 'public', 'data', 'libraryQueue'), limit(20)), (s) => setLibraryQueue(s.docs.map(d => ({ ...d.data(), id: d.id }))));

    return () => { unsubConfig(); unsubHistory(); unsubExits(); unsubCoord(); unsubLib(); };
  }, [user, userRole, usernameInput]);

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.clear();
    window.location.reload();
  };

  const saveConfig = async (newData) => {
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'config', 'main'), newData, { merge: true });
  };

  const turmasExistentes = [...new Set(alunos.map(a => a.turma))].sort();

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-12 w-12 border-t-4 border-indigo-600"></div></div>;

  if (!user) return <LoginScreen setUserRole={setUserRole} config={config} setUsernameInput={setUsernameInput} />;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <nav className="px-4 py-3 sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b overflow-x-auto no-scrollbar">
        <div className="flex gap-2 min-w-max">
          {[
            {id: 'saidas', label: 'Saídas'}, {id: 'ocorrencias', label: 'Ocorrências'},
            {id: 'diario', label: 'Diário'}, {id: 'historico', label: 'Histórico'},
            {id: 'atrasos', label: 'Atrasos'}, {id: 'coord', label: 'Coordenação'},
            {id: 'medidas', label: 'Biblioteca'}, {id: 'pesquisa', label: 'Pesquisa'},
            {id: 'admin', label: 'Gestão', adminOnly: true}
          ].map((tab) => (
            (!tab.adminOnly || userRole === 'admin') && (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} 
                className={`px-4 py-2 rounded-xl text-[11px] font-black transition-all ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                {tab.label}
              </button>
            )
          ))}
          <button onClick={handleLogout} className="px-4 py-2 rounded-xl text-[11px] font-black bg-red-50 text-red-500">Sair</button>
        </div>
      </nav>

      <main className="flex-1 px-4 pb-24 pt-4 max-w-2xl mx-auto w-full">
        {activeTab === 'saidas' && <PainelSaidas alunos={alunos} usernameInput={usernameInput} activeExits={activeExits} />}
        {activeTab === 'ocorrencias' && <GestaoOcorrencias alunos={alunos} usernameInput={usernameInput} turmasExistentes={turmasExistentes} />}
        {activeTab === 'diario' && <DiarioBordo turmasExistentes={turmasExistentes} usernameInput={usernameInput} />}
        {activeTab === 'historico' && <Historico records={records} />}
        {activeTab === 'atrasos' && <EntradasTardias alunos={alunos} usernameInput={usernameInput} turmasExistentes={turmasExistentes} />}
        {activeTab === 'coord' && <FilaCoordenacao coordinationQueue={coordinationQueue} usernameInput={usernameInput} />}
        {activeTab === 'medidas' && <Biblioteca libraryQueue={libraryQueue} usernameInput={usernameInput} />}
        {activeTab === 'pesquisa' && <PesquisaAlunos alunos={alunos} records={records} />}
        {activeTab === 'admin' && <DashboardAdmin alunos={alunos} records={records} config={config} saveConfig={saveConfig} />}
      </main>
    </div>
  );
}
