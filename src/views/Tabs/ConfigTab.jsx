import React, { useState, useRef, useEffect } from 'react';
import { Settings, FileUp, Trash2, ArrowRight, Check, DatabaseBackup, Download, Plus, UserPlus, Edit } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { db, appId } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useAppContext } from '../../contexts/AppContext';
import { useModals } from '../../contexts/ModalContext';

export const ConfigTab = () => {
    const { userRole } = useAuth();
    const { config, alunos, turmasExistentes } = useAppContext();
    const { showNotification, setDeleteStudentsModal, setDeleteTurma } = useModals();

    const [limitInput, setLimitInput] = useState(config.exitLimitMinutes?.toString() || '15');
    const [passAdmin, setPassAdmin] = useState(config.passwords?.admin || 'gestao');
    const [passProf, setPassProf] = useState(config.passwords?.professor || 'prof');
    const [passApoio, setPassApoio] = useState(config.passwords?.apoio || 'apoio');
    const [fileStatus, setFileStatus] = useState('');
    const fileInputRef = useRef(null);
    const backupInputRef = useRef(null);

    // Gestão Manual
    const [manualNome, setManualNome] = useState('');
    const [manualTurma, setManualTurma] = useState('');
    const [searchStudent, setSearchStudent] = useState('');

    // Blocos automáticos
    const [autoBlocksConfig, setAutoBlocksConfig] = useState(config.autoBlocks || []);

    useEffect(() => {
        setAutoBlocksConfig(config.autoBlocks || []);
        setLimitInput(config.exitLimitMinutes?.toString() || '15');
        setPassAdmin(config.passwords?.admin || 'gestao');
        setPassProf(config.passwords?.professor || 'prof');
        setPassApoio(config.passwords?.apoio || 'apoio');
    }, [config]);

    const addBlock = () => setAutoBlocksConfig([...autoBlocksConfig, { start: '09:00', end: '09:20', label: 'Intervalo Manhã' }]);
    const removeBlock = (index) => setAutoBlocksConfig(autoBlocksConfig.filter((_, i) => i !== index));
    const updateBlock = (index, field, value) => {
        const newBlocks = [...autoBlocksConfig];
        newBlocks[index][field] = value;
        setAutoBlocksConfig(newBlocks);
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (evt) => {
            try {
                const lines = evt.target.result.split(/\r?\n/).filter(line => line.trim());
                const parsedAlunos = lines.map(line => {
                    const parts = line.split(/[;\t,]/);
                    return { id: Math.random().toString(36).substring(2, 9), nome: parts[0]?.trim() || 'Desconhecido', turma: parts[1]?.trim() || 'Sem Turma' };
                });
                if (parsedAlunos.length > 0) {
                    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'config', 'main'), { alunosList: [...alunos, ...parsedAlunos] }, { merge: true });
                    setFileStatus(`Sucesso: ${parsedAlunos.length} alunos adicionados!`);
                }
            } catch (err) { setFileStatus("Erro no processamento."); }
        };
        reader.readAsText(file);
    };

    const handleExportBackup = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(alunos, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `backup_escola_${new Date().toISOString().split('T')[0]}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
        showNotification("Backup gerado com sucesso!");
    };

    const handleImportBackup = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (evt) => {
            try {
                const data = JSON.parse(evt.target.result);
                if (Array.isArray(data)) {
                    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'config', 'main'), { alunosList: data }, { merge: true });
                    showNotification("Backup restaurado!");
                }
            } catch (err) { showNotification("Erro ao ler arquivo de backup."); }
        };
        reader.readAsText(file);
    };

    const addAlunoManual = async () => {
        if (!manualNome || !manualTurma) return showNotification("Preencha nome e turma!");
        const nuevo = { id: Math.random().toString(36).substring(2, 9), nome: manualNome, turma: manualTurma };
        try {
            await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'config', 'main'), { alunosList: [...alunos, nuevo] }, { merge: true });
            setManualNome(''); setManualTurma('');
            showNotification("Aluno adicionado!");
        } catch (e) { showNotification("Erro ao adicionar."); }
    };

    const deleteAluno = async (id) => {
        if (!window.confirm("Remover este aluno?")) return;
        const updated = alunos.filter(a => a.id !== id);
        try {
            await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'config', 'main'), { alunosList: updated }, { merge: true });
            showNotification("Aluno removido.");
        } catch (e) { showNotification("Erro ao remover."); }
    };

    const updateTurma = async (id, novaTurma) => {
        const updated = alunos.map(a => a.id === id ? { ...a, turma: novaTurma } : a);
        try {
            await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'config', 'main'), { alunosList: updated }, { merge: true });
            showNotification("Turma atualizada!");
        } catch (e) { showNotification("Erro ao atualizar turma."); }
    };

    const saveSettings = async () => {
        if (userRole !== 'admin') return;
        try {
            await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'config', 'main'), {
                exitLimitMinutes: parseInt(limitInput) || 15,
                passwords: { admin: passAdmin, professor: passProf, apoio: passApoio },
                autoBlocks: autoBlocksConfig
            }, { merge: true });
            showNotification("Configurações salvas!");
        } catch (e) { showNotification("Erro ao salvar."); }
    };

    if (userRole !== 'admin') {
        return <div className="p-8 text-center text-slate-500 font-bold bg-white/50 rounded-2xl border border-slate-200">Área restrita à Gestão.</div>;
    }

    const filteredAlunos = searchStudent.length > 2
        ? alunos.filter(a => a.nome.toLowerCase().includes(searchStudent.toLowerCase()))
        : [];

    return (
        <div className="space-y-6 flex-1 w-full animate-in fade-in duration-300 pb-10">
            {/* CONFIGURAÇÕES TÉCNICAS */}
            <div className="bg-white/90 backdrop-blur-sm p-6 rounded-[2rem] border border-white shadow-xl shadow-slate-200/40 space-y-4">
                <h3 className="text-sm font-extrabold flex items-center justify-between text-indigo-800 tracking-tight"><div className="flex items-center gap-2"><Settings size={18} strokeWidth={2.5} /> Parâmetros do Sistema</div></h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-2">Senha Gestão</label>
                        <input type="text" value={passAdmin} onChange={e => setPassAdmin(e.target.value)} className="w-full p-4 bg-slate-50/80 rounded-2xl border border-slate-200 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/10 font-bold text-slate-700 text-sm" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-2">Senha Professor</label>
                        <input type="text" value={passProf} onChange={e => setPassProf(e.target.value)} className="w-full p-4 bg-slate-50/80 rounded-2xl border border-slate-200 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/10 font-bold text-slate-700 text-sm" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-2">Senha Apoio</label>
                        <input type="text" value={passApoio} onChange={e => setPassApoio(e.target.value)} className="w-full p-4 bg-slate-50/80 rounded-2xl border border-slate-200 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/10 font-bold text-slate-700 text-sm" />
                    </div>
                </div>

                <div className="pt-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-2">Tempo de Saída (Minutos)</label>
                    <input type="number" value={limitInput} onChange={e => setLimitInput(e.target.value)} className="w-full p-4 bg-slate-50/80 rounded-2xl border border-slate-200 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/10 font-bold text-slate-700 text-sm" />
                </div>

                <div className="pt-4 border-t border-slate-100">
                    <div className="flex justify-between items-center mb-4">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-2">Pausas/Intervalos Programados</label>
                        <button onClick={addBlock} className="text-[11px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg">+ Novo Bloqueio</button>
                    </div>
                    <div className="space-y-2">
                        {autoBlocksConfig.map((block, i) => (
                            <div key={i} className="flex gap-2 items-center bg-slate-50/50 p-2 rounded-xl border border-slate-200/60">
                                <input type="text" placeholder="Nome" value={block.label} onChange={e => updateBlock(i, 'label', e.target.value)} className="flex-1 p-2 bg-white rounded-lg border border-slate-200 text-xs font-bold" />
                                <input type="time" value={block.start} onChange={e => updateBlock(i, 'start', e.target.value)} className="w-24 p-2 bg-white rounded-lg border border-slate-200 text-xs font-bold" />
                                <input type="time" value={block.end} onChange={e => updateBlock(i, 'end', e.target.value)} className="w-24 p-2 bg-white rounded-lg border border-slate-200 text-xs font-bold" />
                                <button onClick={() => removeBlock(i)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"><Trash2 size={16} /></button>
                            </div>
                        ))}
                    </div>
                </div>

                <button onClick={saveSettings} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-extrabold hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"><Check size={20} /> Salvar Parâmetros</button>
            </div>

            {/* BACKUP E RESTAURAÇÃO */}
            <div className="bg-white/90 backdrop-blur-sm p-6 rounded-[2rem] border border-white shadow-xl shadow-slate-200/40 space-y-4">
                <h3 className="text-sm font-extrabold flex items-center gap-2 text-slate-800 tracking-tight"><DatabaseBackup size={18} strokeWidth={2.5} /> Backup e Restauração</h3>
                <div className="grid grid-cols-2 gap-3">
                    <button onClick={handleExportBackup} className="flex items-center justify-center gap-2 p-4 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-2xl font-bold text-xs hover:bg-emerald-100 transition-all">
                        <Download size={18} /> Exportar Backup (JSON)
                    </button>
                    <button onClick={() => backupInputRef.current?.click()} className="flex items-center justify-center gap-2 p-4 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-2xl font-bold text-xs hover:bg-indigo-100 transition-all">
                        <FileUp size={18} /> Restaurar Backup
                    </button>
                </div>
                <input type="file" ref={backupInputRef} onChange={handleImportBackup} accept=".json" className="hidden" />
                <p className="text-[10px] text-slate-400 font-bold uppercase text-center">O backup contém toda a lista de alunos e turmas.</p>
            </div>

            {/* GESTÃO MANUAL DE ALUNOS */}
            <div className="bg-white/90 backdrop-blur-sm p-6 rounded-[2rem] border border-white shadow-xl shadow-slate-200/40 space-y-5">
                <h3 className="text-sm font-extrabold flex items-center gap-2 text-slate-800 tracking-tight"><UserPlus size={18} strokeWidth={2.5} /> Gestão Individual de Alunos</h3>

                {/* Adicionar Novo */}
                <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200 space-y-3">
                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Adicionar Aluno Manualmente</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <input type="text" placeholder="Nome Completo" value={manualNome} onChange={e => setManualNome(e.target.value)} className="p-3.5 bg-white rounded-xl border border-slate-200 outline-none text-sm font-bold" />
                        <input type="text" placeholder="Turma (Ex: 9º A)" value={manualTurma} onChange={e => setManualTurma(e.target.value)} className="p-3.5 bg-white rounded-xl border border-slate-200 outline-none text-sm font-bold" />
                    </div>
                    <button onClick={addAlunoManual} className="w-full flex items-center justify-center gap-2 py-3.5 bg-indigo-600 text-white rounded-xl font-bold shadow-md hover:bg-indigo-700 active:scale-95 transition-all text-sm">
                        <Plus size={18} /> Cadastrar Aluno
                    </button>
                </div>

                {/* Editar/Remover */}
                <div className="space-y-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Pesquisar para Editar ou Remover</p>
                    <input type="text" placeholder="Digite o nome (mín. 3 letras)..." value={searchStudent} onChange={e => setSearchStudent(e.target.value)} className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-200 outline-none font-bold text-slate-700 text-sm focus:border-indigo-300" />

                    <div className="space-y-2">
                        {filteredAlunos.map(a => (
                            <div key={a.id} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                                <div>
                                    <p className="font-extrabold text-slate-800 text-sm">{a.nome}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md border border-indigo-100 uppercase">{a.turma}</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <select
                                        onChange={(e) => updateTurma(a.id, e.target.value)}
                                        className="p-1.5 text-xs font-bold border rounded-lg bg-slate-50 outline-none focus:border-indigo-400"
                                        defaultValue={a.turma}
                                    >
                                        <option value={a.turma}>Mudar Turma...</option>
                                        {turmasExistentes.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                    <button onClick={() => deleteAluno(a.id)} className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"><Trash2 size={16} /></button>
                                </div>
                            </div>
                        ))}
                        {searchStudent.length > 2 && filteredAlunos.length === 0 && <p className="text-center py-4 text-xs font-bold text-slate-400">Nenhum aluno encontrado.</p>}
                    </div>
                </div>
            </div>

            {/* GESTÃO DE TURMAS */}
            <div className="bg-white/90 backdrop-blur-sm p-6 rounded-[2rem] border border-white shadow-xl shadow-slate-200/40 space-y-5">
                <h3 className="text-sm font-extrabold flex items-center gap-2 text-slate-800 tracking-tight"><DatabaseBackup size={18} strokeWidth={2.5} /> Gestão de Turmas</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {turmasExistentes.map(t => (
                        <div key={t} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200/60 group hover:bg-white transition-all">
                            <span className="font-black text-slate-700 uppercase tracking-wider">{t}</span>
                            <button
                                onClick={() => setDeleteTurma(t)}
                                className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 text-rose-600 rounded-lg text-[10px] font-black border border-rose-100 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <Trash2 size={12} /> APAGAR TURMA
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* UPLOAD EM MASSA */}
            <div className="bg-white/90 backdrop-blur-sm p-6 rounded-[2rem] border border-white shadow-xl shadow-slate-200/40 space-y-4">
                <h3 className="text-sm font-extrabold flex items-center gap-2 text-slate-800 tracking-tight"><FileUp size={18} strokeWidth={2.5} /> Importação em Massa (CSV)</h3>
                <button onClick={() => fileInputRef.current?.click()} className="w-full p-6 border-2 border-dashed border-indigo-200 bg-indigo-50/50 hover:bg-indigo-50 rounded-2xl transition-all flex items-center justify-center gap-3 group cursor-pointer text-left">
                    <div className="bg-white p-3 rounded-xl shadow-sm group-hover:scale-110 transition-transform"><FileUp size={24} className="text-indigo-500" /></div>
                    <div>
                        <span className="font-bold text-slate-700 block text-sm">Adicionar Lista (.csv ou .txt)</span>
                        <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">Nome;Turma (Acrescenta aos atuais)</span>
                    </div>
                </button>
                <input type="file" accept=".csv, .txt" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                {fileStatus && <div className="p-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-black text-center">{fileStatus}</div>}
                <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                    <span className="text-xs font-bold text-slate-500 uppercase">Total: {alunos?.length || 0} alunos</span>
                    <button onClick={() => setDeleteStudentsModal(true)} className="px-3 py-1.5 bg-rose-50 text-rose-600 rounded-lg text-xs font-black border border-rose-100">LIMPAR TUDO</button>
                </div>
            </div>
        </div>
    );
};
