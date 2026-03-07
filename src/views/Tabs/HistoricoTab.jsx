import React, { useState, useMemo } from 'react';
import { History, Search, Download, Edit, Trash2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { useAppContext } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { useModals } from '../../contexts/ModalContext';

export const HistoricoTab = () => {
    const { userRole } = useAuth();
    const { records, turmasExistentes } = useAppContext();
    const { setEditRecordModal, setDeleteConfirm, setFotoViewerModal } = useModals();

    const [filterTurma, setFilterTurma] = useState('');
    const [filterAluno, setFilterAluno] = useState('');
    const [filterData, setFilterData] = useState(new Date().toISOString().split('T')[0]);
    const [filterType, setFilterType] = useState('todos');

    const downloadPDF = () => {
        try {
            const doc = new jsPDF();
            doc.setFontSize(18);
            doc.text("Relatório de Histórico - Anísio Teixeira", 14, 22);
            doc.setFontSize(11);
            doc.text(`Data: ${filterData || 'Todas'} | Turma: ${filterTurma || 'Todas'} | Tipo: ${filterType}`, 14, 30);

            const tableColumn = ["Data/Hora", "Turma", "Aluno", "Autor", "Detalhe"];
            const tableRows = [];

            filteredHistory.forEach(record => {
                const rowData = [
                    record.timestamp, record.turma, record.alunoNome,
                    `${record.autorRole === 'aluno' ? '(A) ' : ''}${record.professor}`, record.detalhe
                ];
                tableRows.push(rowData);
            });

            // Usando autoTable se disponível (requer importação adicional no App principal, aqui faremos texto simples caso não tenha autoTable)
            if (doc.autoTable) {
                doc.autoTable({ head: [tableColumn], body: tableRows, startY: 40, styles: { fontSize: 8 } });
            } else {
                let y = 40;
                tableRows.forEach(row => {
                    doc.text(`${row[0].substring(0, 10)} - ${row[1]} - ${row[2]} - ${row[4].substring(0, 30)}...`, 14, y);
                    y += 7;
                })
            }
            doc.save(`historico_${new Date().getTime()}.pdf`);
        } catch (error) {
            console.error(error);
            alert("Erro ao gerar PDF");
        }
    };

    const filteredHistory = useMemo(() => {
        if (!records) return [];
        return records.filter(r => {
            const dMatch = !filterData || r.timestamp?.includes(filterData.split('-').reverse().join('/'));
            const tMatch = !filterTurma || r.turma === filterTurma;
            const aMatch = !filterAluno || (r.alunoNome && r.alunoNome.toLowerCase().includes(filterAluno.toLowerCase()));
            const tyMatch = filterType === 'todos' || r.categoria === filterType;
            return dMatch && tMatch && aMatch && tyMatch;
        });
    }, [filterTurma, filterAluno, filterData, filterType, records]);

    return (
        <div className="space-y-4 flex-1 w-full animate-in fade-in duration-300">
            <div className="bg-white/90 backdrop-blur-sm p-5 rounded-[2rem] border border-white shadow-xl shadow-slate-200/40 space-y-4">
                <h3 className="text-sm font-extrabold flex items-center gap-2 text-indigo-600 tracking-tight"><History size={18} strokeWidth={2.5} /> Relatório de Atividades</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <input type="date" value={filterData} onChange={e => setFilterData(e.target.value)} className="w-full p-3.5 bg-slate-50/80 rounded-xl border border-slate-200 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all font-bold text-slate-700 text-sm" />
                    <select value={filterTurma} onChange={e => setFilterTurma(e.target.value)} className="w-full p-3.5 bg-slate-50/80 rounded-xl border border-slate-200 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all font-bold text-slate-700 text-sm">
                        <option value="">Todas as Turmas</option>
                        {turmasExistentes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <div className="relative col-span-2 md:col-span-1 border border-slate-200 rounded-xl bg-slate-50/80 overflow-hidden focus-within:ring-4 focus-within:ring-indigo-500/10 focus-within:border-indigo-400 focus-within:bg-white transition-all">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search size={16} className="text-slate-400" /></div>
                        <input type="text" placeholder="Buscar aluno..." value={filterAluno} onChange={e => setFilterAluno(e.target.value)} className="w-full pl-9 pr-4 py-3.5 bg-transparent border-none outline-none font-bold text-slate-700 text-sm" />
                    </div>
                    <select value={filterType} onChange={e => setFilterType(e.target.value)} className="col-span-2 md:col-span-1 w-full p-3.5 bg-slate-50/80 rounded-xl border border-slate-200 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all font-bold text-slate-700 text-sm">
                        <option value="todos">Todos Eventos</option>
                        <option value="saida">Apenas Saídas</option>
                        <option value="ocorrencia">Apenas Ocorrências</option>
                        <option value="coordenação">Apenas Coordenação</option>
                    </select>
                </div>
                {userRole === 'admin' && (
                    <button onClick={downloadPDF} className="w-full bg-slate-800 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-700 shadow-md shadow-slate-800/20 active:scale-[0.98] transition-all"><Download size={16} /> Exportar relatório em PDF</button>
                )}
            </div>

            <div className="space-y-3">
                {filteredHistory.map(r => (
                    <div key={r.id} className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-slate-200/60 shadow-sm shadow-slate-200/50 hover:shadow-md transition-all">
                        <div className="flex justify-between items-start mb-2">
                            <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-1 rounded-lg ${r.categoria === 'ocorrencia' ? 'bg-rose-100 text-rose-700 border border-rose-200/50' :
                                    r.categoria === 'coordenação' ? 'bg-orange-100 text-orange-700 border border-orange-200/50' :
                                        r.categoria === 'atraso' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200/50' :
                                            'bg-indigo-100 text-indigo-700 border border-indigo-200/50'
                                }`}>{r.categoria}</span>
                            <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg tabular-nums tracking-tight border border-slate-100">{r.timestamp}</span>
                        </div>
                        <h4 className="font-extrabold text-sm text-slate-800 tracking-tight leading-none mb-1 text-left">{r.alunoNome}</h4>
                        <div className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5 mb-2.5 w-full">
                            <span className="bg-slate-100 px-1.5 py-0.5 rounded-md inline-block">{r.turma}</span>
                            <span className="truncate flex-1 text-left">• Por: {r.autorRole === 'aluno' ? 'Aluno(a)' : 'Prof.'} {r.professor}</span>
                        </div>
                        <div className="text-xs bg-slate-50 p-3 rounded-xl border border-slate-100 font-medium text-slate-600 leading-relaxed text-left flex justify-between items-end gap-2">
                            <span className="flex-1">{r.detalhe}</span>
                            <div className="flex gap-2 shrink-0">
                                {r.fotoUrl && (
                                    <button onClick={() => setFotoViewerModal(r.fotoUrl)} className="text-indigo-600 font-bold bg-indigo-50 px-2 py-1 rounded-lg hover:bg-indigo-100 transition-colors">Ver Foto</button>
                                )}
                                {userRole === 'admin' && (
                                    <div className="flex gap-1.5 bg-white p-1 rounded-lg shadow-sm border border-slate-200/50">
                                        <button onClick={() => setEditRecordModal(r)} className="p-1.5 bg-slate-100 text-slate-500 rounded-md hover:bg-indigo-50 hover:text-indigo-600 transition-colors"><Edit size={14} /></button>
                                        <button onClick={() => setDeleteConfirm(r)} className="p-1.5 bg-rose-50 text-rose-500 rounded-md hover:bg-rose-100 hover:text-rose-600 transition-colors"><Trash2 size={14} /></button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                {filteredHistory.length === 0 && (
                    <div className="text-center p-8 bg-slate-50/50 rounded-[2rem] border border-slate-200 border-dashed">
                        <p className="text-slate-400 font-bold text-sm">Nenhum registo encontrado com estes filtros.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
