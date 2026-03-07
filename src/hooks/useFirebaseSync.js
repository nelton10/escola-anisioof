import { useEffect } from 'react';
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
        isFirstLoad, prevCoordQueueRef
    } = useAppContext();

    // Sistema Antizumbi (economia de banco no background / sleep do celular)
    useEffect(() => {
        let lastTick = Date.now();
        const wakeUpCheck = setInterval(async () => {
            const now = Date.now();
            if (now - lastTick > 5000 && user) {
                console.warn("DETECTOR DE COMA: Religando Firebase...");
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
        document.addEventListener("visibilitychange", () => {
            if (document.visibilityState === 'visible') handleNetworkChange();
        });

        return () => {
            clearInterval(wakeUpCheck);
            window.removeEventListener("focus", handleNetworkChange);
            window.removeEventListener("online", handleNetworkChange);
            document.removeEventListener("visibilitychange", handleNetworkChange);
        };
    }, [user]);

    // Sync Global de Dados via Snapshot
    useEffect(() => {
        if (!user) return;

        const unsubConfig = onSnapshot(doc(db, 'artifacts', appId, 'public', 'data', 'config', 'main'),
            (d) => {
                if (d.exists()) {
                    const data = d.data();
                    setConfig(prev => ({ ...prev, ...data }));
                    if (data.alunosList) setAlunos(data.alunosList);
                }
            },
            (err) => console.error("Erro Config Snapshot:", err)
        );

        const unsubExits = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'activeExits'),
            (s) => setActiveExits(s.docs.map(d => ({ ...d.data(), id: d.id }))),
            (err) => console.error("Erro Exits Snapshot:", err)
        );

        const qHistory = query(collection(db, 'artifacts', appId, 'public', 'data', 'history'), orderBy('rawTimestamp', 'desc'), limit(100));
        const unsubHistory = onSnapshot(qHistory,
            (s) => setRecords(s.docs.map(d => ({ ...d.data(), id: d.id }))),
            (err) => console.error("Erro History Snapshot:", err)
        );

        const unsubCoord = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'coordinationQueue'),
            (s) => {
                const newQueue = s.docs.map(d => ({ ...d.data(), id: d.id }));
                if (isFirstLoad.current) { isFirstLoad.current = false; }
                else if (userRole === 'admin') {
                    const prevIds = prevCoordQueueRef.current.map(i => i.id);
                    const addedItems = newQueue.filter(i => !prevIds.includes(i.id));
                    if (addedItems.length > 0) {
                        playEmergencySound();
                        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === "granted") {
                            try { addedItems.forEach(item => { new Notification("ALERTA: Aluno Retirado", { body: `${item.alunoNome} foi encaminhado para a coordenação.` }); }); } catch (err) { }
                        }
                    }
                }
                prevCoordQueueRef.current = newQueue; setCoordinationQueue(newQueue);
            },
            (err) => console.error("Erro Coord Snapshot:", err)
        );

        const unsubLibrary = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'libraryQueue'),
            (s) => setLibraryQueue(s.docs.map(d => ({ ...d.data(), id: d.id }))),
            (err) => console.error("Erro Library Snapshot:", err)
        );

        const unsubSuspensions = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'suspensions'),
            (s) => setSuspensions(s.docs.map(d => ({ ...d.data(), id: d.id }))),
            (err) => console.error("Erro Suspensions Snapshot:", err)
        );

        const qAvisos = query(collection(db, 'artifacts', appId, 'public', 'data', 'avisos'), orderBy('rawTimestamp', 'desc'), limit(30));
        const unsubAvisos = onSnapshot(qAvisos,
            (s) => setAvisos(s.docs.map(d => ({ ...d.data(), id: d.id }))),
            (err) => console.error("Erro Avisos Snapshot:", err)
        );

        const qEval = query(collection(db, 'artifacts', appId, 'public', 'data', 'evaluations'), orderBy('rawTimestamp', 'desc'), limit(50));
        const unsubEval = onSnapshot(qEval,
            (s) => setEvaluations(s.docs.map(d => ({ ...d.data(), id: d.id }))),
            (err) => console.error("Erro Evaluations Snapshot:", err)
        );

        return () => { unsubConfig(); unsubExits(); unsubHistory(); unsubCoord(); unsubLibrary(); unsubSuspensions(); unsubAvisos(); unsubEval(); };
    }, [user, userRole, setConfig, setAlunos, setActiveExits, setRecords, setCoordinationQueue, setLibraryQueue, setSuspensions, setAvisos, setEvaluations]);

};
