import React, { useState } from 'react';
import { LogOut, UserCheck, TimerOff, DoorOpen, ListChecks, FileSpreadsheet, MessageSquarePlus, ShieldCheck, UserPlus, Search, Settings, ShieldAlert, ArrowRight, X } from 'lucide-react';

// Contexts
import { AppProvider, useAppContext } from './contexts/AppContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ModalProvider, useModals } from './contexts/ModalContext';

// Hooks & Services
import { useFirebaseSync } from './hooks/useFirebaseSync';
import { doc, setDoc } from 'firebase/firestore';
import { db, appId } from './services/firebase';

// Components & Modals
import { GlobalToast } from './components/ui/GlobalToast';
import { EditRecordModal } from './components/modals/EditRecordModal';
import { EndSuspensionModal } from './components/modals/EndSuspensionModal';
import { DeleteConfirmModal } from './components/modals/DeleteConfirmModal';
import { SuspensionModal } from './components/modals/SuspensionModal';
import { AuthReturnModal } from './components/modals/AuthReturnModal';
import { OvertimeModal } from './components/modals/OvertimeModal';
import { FotoViewerModal } from './components/modals/FotoViewerModal';

// Views / Tabs
import { LoginView } from './views/LoginView';
import { SaidasTab } from './views/Tabs/SaidasTab';
import { OcorrenciasTab } from './views/Tabs/OcorrenciasTab';
import { HistoricoTab } from './views/Tabs/HistoricoTab';
import { AtrasosTab } from './views/Tabs/AtrasosTab';
import { CoordenacaoTab } from './views/Tabs/CoordenacaoTab';
import { BibliotecaTab } from './views/Tabs/BibliotecaTab';
import { AvisosTab } from './views/Tabs/AvisosTab';
import { AnaliseTab } from './views/Tabs/AnaliseTab';
import { ConfigTab } from './views/Tabs/ConfigTab';
import { PesquisaTab } from './views/Tabs/PesquisaTab';

const NavItem = ({ active, icon: Icon, label, onClick, badge, alert }) => (
  <button onClick={onClick} className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all ${active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-500 hover:bg-slate-100/80 hover:text-slate-800'}`}>
    <div className="flex items-center gap-3.5"><Icon size={20} strokeWidth={active ? 2.5 : 2} className={active ? 'text-white' : 'text-slate-400'} /><span className={`text-[13px] tracking-wide ${active ? 'font-extrabold' : 'font-bold'}`}>{label}</span></div>
    {badge > 0 && <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg border ${active ? 'bg-white/20 text-white border-white/10' : 'bg-slate-200 text-slate-600 border-slate-300'}`}>{badge}</span>}
    {alert && <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)] animate-pulse border border-white"></span>}
  </button>
);

const DesktopSidebar = ({ currentTab, setCurrentTab, stats }) => {
  const { userRole, handleLogout, usernameInput } = useAuth();
  const isAluno = userRole === 'aluno';
  return (
    <nav className="w-72 bg-white/90 backdrop-blur-xl border-r border-slate-200/60 p-6 flex-col hidden lg:flex shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)] z-10 rounded-r-[2.5rem] relative">
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-slate-50/50 to-transparent pointer-events-none rounded-r-[2.5rem]"></div>
      <div className="mb-10 text-center relative z-10 mt-4">
        <div className={`w-20 h-20 mx-auto rounded-[1.5rem] shadow-sm flex items-center justify-center mb-4 transition-transform hover:scale-105 border-4 ${isAluno ? 'bg-emerald-50 text-emerald-500 border-white' : 'bg-indigo-50 border-white text-indigo-600 shadow-indigo-100'}`} >
          {isAluno ? <UserPlus size={40} /> : <ShieldCheck size={40} />}
        </div>
        <p className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-1 truncate px-2">{isAluno ? 'Aluno / Apoio' : userRole === 'admin' ? 'Gestão / Admin' : 'Professor'}</p>
        <h2 className="text-xl font-extrabold text-slate-800 tracking-tight truncate px-2">{usernameInput}</h2>
      </div>
      <div className="space-y-1.5 flex-1 relative z-10 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
        <NavItem active={currentTab === 'saidas'} icon={UserCheck} label="Ativar Saída" onClick={() => setCurrentTab('saidas')} badge={stats.saidasAtivas} />
        {!isAluno && <NavItem active={currentTab === 'ocorrencias'} icon={ShieldAlert} label="Ocorrência" onClick={() => setCurrentTab('ocorrencias')} />}
        {!isAluno && <NavItem active={currentTab === 'atrasos'} icon={TimerOff} label="Registar Atraso" onClick={() => setCurrentTab('atrasos')} />}
        <div className="my-4 h-px bg-slate-100"></div>
        <NavItem active={currentTab === 'historico'} icon={ListChecks} label="Histórico" onClick={() => setCurrentTab('historico')} />
        <NavItem active={currentTab === 'pesquisa'} icon={Search} label="Pesquisa Diária" onClick={() => setCurrentTab('pesquisa')} />
        <NavItem active={currentTab === 'avisos'} icon={MessageSquarePlus} label="Mural / Avisos" onClick={() => setCurrentTab('avisos')} alert={stats.avisosCount > 0} />
        <div className="my-4 h-px bg-slate-100"></div>
        {!isAluno && <NavItem active={currentTab === 'coordenacao'} icon={DoorOpen} label="Coordenação" onClick={() => setCurrentTab('coordenacao')} badge={stats.coordQueue} alert={stats.coordQueue > 0} />}
        {!isAluno && <NavItem active={currentTab === 'biblioteca'} icon={FileSpreadsheet} label="Biblioteca" onClick={() => setCurrentTab('biblioteca')} badge={stats.libQueue} />}
        {userRole === 'admin' && (
          <>
            <div className="my-4 h-px bg-slate-100"></div>
            <NavItem active={currentTab === 'analise'} icon={ShieldCheck} label="Análise de Dados" onClick={() => setCurrentTab('analise')} />
            <NavItem active={currentTab === 'config'} icon={Settings} label="Configurações" onClick={() => setCurrentTab('config')} />
          </>
        )}
      </div>
      <button onClick={handleLogout} className="mt-8 flex items-center justify-center gap-2 w-full p-4 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all font-bold text-sm relative z-10 group">
        <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" /> Encerrar Sessão
      </button>
    </nav>
  );
};

const MobileNav = ({ currentTab, setCurrentTab, isMenuOpen, setIsMenuOpen, stats }) => {
  const { userRole, handleLogout, usernameInput } = useAuth();
  const isAluno = userRole === 'aluno';
  return (
    <div className="lg:hidden">
      <div className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-b border-slate-200/60 p-4 flex justify-between items-center z-40 rounded-b-[2rem] shadow-sm">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 border-white shadow-sm ${isAluno ? 'bg-emerald-50 text-emerald-500' : 'bg-indigo-50 text-indigo-600'}`}>{isAluno ? <UserPlus size={20} /> : <ShieldCheck size={20} />}</div>
          <div className="flex flex-col"><span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none">{isAluno ? 'Aluno/Apoio' : 'Escola Anísio'}</span><span className="text-sm font-extrabold text-slate-800 tracking-tight leading-none mt-1 truncate max-w-[120px]">{usernameInput}</span></div>
        </div>
        <div className="flex items-center gap-2.5">
          {(stats.coordQueue > 0 || stats.avisosCount > 0) && !isAluno && <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.6)]"></div>}
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs hover:bg-slate-200 transition-colors uppercase tracking-wider">{isMenuOpen ? 'Fechar' : 'Menu'}</button>
        </div>
      </div>
      {isMenuOpen && (
        <div className="fixed inset-0 z-30 pt-24 pb-20 px-4 bg-slate-50/95 backdrop-blur-lg overflow-y-auto animate-in slide-in-from-top-full duration-300">
          <div className="space-y-1.5 max-w-sm mx-auto">
            <NavItem active={currentTab === 'saidas'} icon={UserCheck} label="Ativar Saída" onClick={() => { setCurrentTab('saidas'); setIsMenuOpen(false); }} badge={stats.saidasAtivas} />
            <NavItem active={currentTab === 'historico'} icon={ListChecks} label="Histórico" onClick={() => { setCurrentTab('historico'); setIsMenuOpen(false); }} />
            <NavItem active={currentTab === 'avisos'} icon={MessageSquarePlus} label="Mural de Avisos" onClick={() => { setCurrentTab('avisos'); setIsMenuOpen(false); }} alert={stats.avisosCount > 0} />
            <NavItem active={currentTab === 'pesquisa'} icon={Search} label="Pesquisa" onClick={() => { setCurrentTab('pesquisa'); setIsMenuOpen(false); }} />
            {!isAluno && (
              <>
                <div className="my-4 h-px bg-slate-200"></div>
                <NavItem active={currentTab === 'ocorrencias'} icon={ShieldAlert} label="Ocorrência" onClick={() => { setCurrentTab('ocorrencias'); setIsMenuOpen(false); }} />
                <NavItem active={currentTab === 'coordenacao'} icon={DoorOpen} label="Coordenação" onClick={() => { setCurrentTab('coordenacao'); setIsMenuOpen(false); }} badge={stats.coordQueue} alert={stats.coordQueue > 0} />
                <NavItem active={currentTab === 'biblioteca'} icon={FileSpreadsheet} label="Biblioteca" onClick={() => { setCurrentTab('biblioteca'); setIsMenuOpen(false); }} badge={stats.libQueue} />
                <NavItem active={currentTab === 'atrasos'} icon={TimerOff} label="Registar Atraso" onClick={() => { setCurrentTab('atrasos'); setIsMenuOpen(false); }} />
              </>
            )}
            {userRole === 'admin' && (
              <>
                <div className="my-4 h-px bg-slate-200"></div>
                <NavItem active={currentTab === 'analise'} icon={ShieldCheck} label="Análise" onClick={() => { setCurrentTab('analise'); setIsMenuOpen(false); }} />
                <NavItem active={currentTab === 'config'} icon={Settings} label="Configurações" onClick={() => { setCurrentTab('config'); setIsMenuOpen(false); }} />
              </>
            )}
            <div className="my-4 h-px bg-slate-200"></div>
            <button onClick={handleLogout} className="w-full flex items-center justify-center p-4 text-rose-500 bg-rose-50 hover:bg-rose-100 rounded-2xl font-bold transition-colors gap-2"><LogOut size={18} /> Sair do Sistema</button>
          </div>
        </div>
      )}
    </div>
  );
};


// ----------------------------------------------------------------------
// COMPONENTE CORE (Lida com lógica de Tab, Provider Hook e Wipe)
// ----------------------------------------------------------------------
const CoreApp = () => {
  const { isAuthenticated, userRole } = useAuth();
  const { deleteStudentsModal, setDeleteStudentsModal } = useModals();
  const { activeExits, coordinationQueue, libraryQueue, avisos } = useAppContext();
  useFirebaseSync();

  const [currentTab, setCurrentTab] = useState('saidas');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (!isAuthenticated) return <LoginView />;

  const stats = {
    saidasAtivas: activeExits.length,
    coordQueue: coordinationQueue.length,
    libQueue: libraryQueue.length,
    avisosCount: avisos.length
  };

  const confirmDeleteAllStudents = async () => {
    try {
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'config', 'main'), { alunosList: [] }, { merge: true });
      setDeleteStudentsModal(false);
      window.location.reload();
    } catch (e) { alert("Erro ao limpar dados"); }
  };

  return (
    <div className="flex h-screen h-[100dvh] bg-slate-50 overflow-hidden font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <DesktopSidebar currentTab={currentTab} setCurrentTab={setCurrentTab} stats={stats} />
      <MobileNav currentTab={currentTab} setCurrentTab={setCurrentTab} isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} stats={stats} />

      <main className="flex-1 overflow-y-auto relative perspective-[1000px]">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-transparent to-emerald-50/50 pointer-events-none"></div>

        <div className="max-w-4xl mx-auto p-4 lg:p-10 pt-24 lg:pt-10 min-h-full flex flex-col relative z-10 transition-all duration-300">
          <header className="mb-8 animate-in fade-in slide-in-from-top-6 flex items-center justify-between">
            <div>
              <h2 className="text-3xl lg:text-4xl font-black text-slate-800 tracking-tight leading-none mb-1.5 drop-shadow-sm">
                {currentTab === 'saidas' && 'Painel de Saídas'}
                {currentTab === 'ocorrencias' && 'Ocorrências'}
                {currentTab === 'historico' && 'Histórico Global'}
                {currentTab === 'coordenacao' && 'Coordenação'}
                {currentTab === 'biblioteca' && 'Biblioteca'}
                {currentTab === 'atrasos' && 'Controle de Atrasos'}
                {currentTab === 'avisos' && 'Mural de Comunicação'}
                {currentTab === 'analise' && 'Análise Estratégica'}
                {currentTab === 'config' && 'Configurações'}
                {currentTab === 'pesquisa' && 'Pesquisa Rápida'}
              </h2>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest pl-1">
                {new Date().toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
            </div>
          </header>

          {currentTab === 'saidas' && <SaidasTab />}
          {currentTab === 'ocorrencias' && userRole !== 'aluno' && <OcorrenciasTab />}
          {currentTab === 'historico' && <HistoricoTab />}
          {currentTab === 'coordenacao' && userRole !== 'aluno' && <CoordenacaoTab />}
          {currentTab === 'biblioteca' && userRole !== 'aluno' && <BibliotecaTab />}
          {currentTab === 'atrasos' && userRole !== 'aluno' && <AtrasosTab />}
          {currentTab === 'avisos' && <AvisosTab />}
          {currentTab === 'analise' && userRole === 'admin' && <AnaliseTab />}
          {currentTab === 'config' && userRole === 'admin' && <ConfigTab />}
          {currentTab === 'pesquisa' && <PesquisaTab />}
        </div>
      </main>

      {/* Injeção de Modais Reactivos */}
      <GlobalToast />
      <EditRecordModal />
      <EndSuspensionModal />
      <DeleteConfirmModal />
      <SuspensionModal />
      <AuthReturnModal />
      <OvertimeModal />
      <FotoViewerModal />

      {/* Wipe Data Modal */}
      {deleteStudentsModal && (
        <div className="fixed inset-0 z-[120] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full text-center shadow-2xl border-2 border-rose-500 animate-in zoom-in-95">
            <div className="bg-rose-50 text-rose-500 w-16 h-16 rounded-[1.25rem] flex items-center justify-center mx-auto mb-4"><X size={32} /></div>
            <h3 className="font-extrabold text-xl mb-2 text-slate-800 tracking-tight">Apagar BD?</h3>
            <p className="text-sm text-slate-500 mb-6 font-medium">Esta acção elimina todos os alunos actuais do sistema e é irreversível.</p>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setDeleteStudentsModal(false)} className="py-3.5 bg-slate-100 hover:bg-slate-200 rounded-2xl font-bold text-slate-600 transition-colors">Cancelar</button>
              <button onClick={confirmDeleteAllStudents} className="py-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-bold shadow-lg shadow-rose-600/20">CONFIRMAR</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ----------------------------------------------------------------------
// BOOTSTRAP: EMPACOTAMENTO DOS PROVIDERS E RENDER FINAL
// ----------------------------------------------------------------------
export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <ModalProvider>
          <CoreApp />
        </ModalProvider>
      </AppProvider>
    </AuthProvider>
  );
}
