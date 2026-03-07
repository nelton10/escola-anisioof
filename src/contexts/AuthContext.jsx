import React, { createContext, useContext, useState, useEffect } from 'react';
import { signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState('professor');
    const [usernameInput, setUsernameInput] = useState('');
    const [loggedStudent, setLoggedStudent] = useState(null);

    // Efeito para login automático ao abrir o app
    useEffect(() => {
        try {
            const savedAuth = localStorage.getItem('anisio_auth');
            if (savedAuth) {
                try {
                    const { role, name } = JSON.parse(savedAuth);
                    setUserRole(role);
                    setUsernameInput(name);
                    setIsAuthenticated(true);
                } catch (e) {
                    localStorage.removeItem('anisio_auth');
                }
            }
        } catch (error) {
            console.warn("Acesso ao LocalStorage bloqueado.", error);
        }
    }, []);

    // Inicializar o Auth Anônimo base do Firebase
    useEffect(() => {
        const initAuth = async () => {
            try {
                if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
                    try { await signInWithCustomToken(auth, __initial_auth_token); }
                    catch (e) { await signInAnonymously(auth); }
                } else { await signInAnonymously(auth); }
            } catch (err) { console.error(err); }
        };
        initAuth();
        const unsubscribe = onAuthStateChanged(auth, setUser);
        return () => unsubscribe();
    }, []);

    const handleLogout = () => {
        try { localStorage.removeItem('anisio_auth'); } catch (e) { }
        setIsAuthenticated(false);
        setUsernameInput('');
        setLoggedStudent(null);
    };

    const value = {
        user,
        isAuthenticated, setIsAuthenticated,
        userRole, setUserRole,
        usernameInput, setUsernameInput,
        loggedStudent, setLoggedStudent,
        handleLogout
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
