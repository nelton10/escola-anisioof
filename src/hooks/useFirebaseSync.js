import { useEffect, useRef } from 'react';
import { onSnapshot, doc, collection, enableNetwork, disableNetwork, query, orderBy, limit } from 'firebase/firestore';
import { db, appId } from '../services/firebase';
import { useAppContext } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { playEmergencySound } from '../services/audio';

export const useFirebaseSync = () => {
    const { user, userRole } = useAuth();
    const {
        setConfig, setAlunos, setActiveExits, setRecords,
        setCoordinationQueue, setLibraryQueue, setSuspensions, setAvisos, setEvaluations,
        setTurmasExistentes, setStats, setCheckins, setWarnings
    } = useAppContext();

    const isFirstLoad = useRef(true);
    const prevCoordQueueRef = useRef([]);

    // Sistema Antizumbi
    useEffect(() => {
        let lastTick = Date.now();
        const wakeUpCheck = setInterval(async () => {
            const now = Date.now();
            if (now - lastTick > 5000 && user) {
                try { await disableNetwork(db); await enableNetwork(db); } catch (e) { }
            }
            lastTick = now;
        }, 1000);

        const handleNetworkChange = async () => {
            if (user && navigator.onLine) {
                try { await disableNetwork(db); await enableNetwork(db); } catch (e) { }
            }
        };

        window.addEventListener("focus", handleNetworkChange);
        window.addEventListener("online", handleNetworkChange);
        return () => {
            clearInterval(wakeUpCheck);
            window.removeEventListener("focus", handleNetworkChange);
            window.removeEventListener("online", handleNetworkChange);
        };
    }, [user]);

    // Sync Global
    useEffect(() => {
        if (!user) return;

        // Solicitar permissão de notificação
        if ("Notification" in window && Notification.permission === "default") {
            Notification.requestPermission();
        }

        const unsubConfig = onSnapshot(doc(db, 'artifacts', appId, 'public', 'data', 'config', 'main'), (d) => {
            if (d.exists()) {
                const data = d.data();
                setConfig(prev => ({ ...prev, ...data }));
            }
        });

        const qHistory = query(collection(db, 'artifacts', appId, 'public', 'data', 'history'), orderBy('rawTimestamp', 'desc'), limit(150));
        const unsubHistory = onSnapshot(qHistory, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setRecords(data);

            if (!isFirstLoad.current && Notification.permission === "granted") {
                snapshot.docChanges().forEach((change) => {
                    if (change.type === "added") {
                        const item = change.doc.data();
                        if (item.categoria === 'ocorrencia' || item.detalhe?.includes('Retirado')) {
                            new Notification("Nova Ocorrência", { body: `${item.alunoNome}: ${item.detalhe}` });
                            playEmergencySound();
                        }
                    }
                });
            }
            isFirstLoad.current = false;
        });

        const unsubAlunos = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'students'), (s) => {
            const data = s.docs.map(d => ({ id: d.id, ...d.data() }));
            setAlunos(data);
            const turmas = [...new Set(data.map(a => a.turma))].filter(Boolean).sort();
            setTurmasExistentes(turmas);
        });

        const unsubCoord = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'coordinationQueue'), (s) => {
            const data = s.docs.map(d => ({ id: d.id, ...d.data() }));
            setCoordinationQueue(data);
        });

        const unsubEval = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'evaluations'), (s) => {
            setEvaluations(s.docs.map(d => ({ id: d.id, ...d.data() })));
        });

        const unsubExits = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'activeExits'), (s) => {
            setActiveExits(s.docs.map(d => ({ id: d.id, ...d.data() })));
        });

        return () => {
            unsubConfig();
            unsubHistory();
            unsubAlunos();
            unsubCoord();
            unsubEval();
            unsubExits();
        };
    }, [user, userRole, setConfig, setAlunos, setRecords, setCoordinationQueue, setEvaluations, setActiveExits, setTurmasExistentes]);
};
