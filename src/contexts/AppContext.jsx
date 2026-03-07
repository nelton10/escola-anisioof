import React, { createContext, useContext, useState, useRef, useMemo, useEffect } from 'react';
import { onSnapshot, doc, collection, enableNetwork, disableNetwork } from 'firebase/firestore';
import { db, appId } from '../services/firebase';
import { playEmergencySound } from '../services/audio';

// --- CONTEXTO GLOBAL DA ESCOLA (Dados Reativos do Firebase) ---
const AppContext = createContext();

export const AppProvider = ({ children }) => {
    // 1. DADOS OBTIDOS DO FIREBASE
    const [config, setConfig] = useState({
        autoBlocks: [], exitLimitMinutes: 15, passwords: { admin: 'gestao', professor: 'prof', apoio: 'apoio' }
    });
    const [alunos, setAlunos] = useState([]);
    const [activeExits, setActiveExits] = useState([]);
    const [records, setRecords] = useState([]);
    const [coordinationQueue, setCoordinationQueue] = useState([]);
    const [libraryQueue, setLibraryQueue] = useState([]);
    const [suspensions, setSuspensions] = useState([]);
    const [avisos, setAvisos] = useState([]);

    // Refs para controle interno e avisos
    const prevCoordQueueRef = useRef([]);
    const isFirstLoad = useRef(true);

    // Variáveis úteis e de uso comum no sistema
    const turmasExistentes = useMemo(() => {
        return Array.isArray(alunos) ? [...new Set(alunos.map(a => a.turma))].sort() : [];
    }, [alunos]);

    const [currentTimeStr, setCurrentTimeStr] = useState('');
    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            setCurrentTimeStr(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`);
        };
        updateTime();
        const int = setInterval(updateTime, 10000);
        return () => clearInterval(int);
    }, []);

    const activeBlock = useMemo(() => {
        if (!config.autoBlocks || !Array.isArray(config.autoBlocks)) return null;
        return config.autoBlocks.find(block => currentTimeStr >= block.start && currentTimeStr <= block.end);
    }, [config.autoBlocks, currentTimeStr]);

    // Função para checar saidas diárias de um aluno específico (Utilizada na aba de saídas)
    const getTodayExitsCount = (alunoId) => {
        if (!alunoId) return 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return (records || []).filter(r =>
            r.alunoId === alunoId &&
            r.categoria === 'saida' &&
            (r.rawTimestamp || 0) >= today.getTime()
        ).length;
    };

    const getSuspendedInTurma = (turma) => {
        if (!turma) return [];
        return suspensions.filter(s => s.turma === turma);
    }

    const value = {
        // Configurações
        config, setConfig,
        activeBlock,

        // Dados das Listas
        alunos, setAlunos, turmasExistentes,
        activeExits, setActiveExits,
        records, setRecords,
        coordinationQueue, setCoordinationQueue,
        libraryQueue, setLibraryQueue,
        suspensions, setSuspensions,
        avisos, setAvisos,

        // Utilitários de dados
        getTodayExitsCount, getSuspendedInTurma
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);
