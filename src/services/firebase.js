import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

let firebaseConfig;
try {
    firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {
        apiKey: "AIzaSyCb2Cmqwivdgb_YgCUQbcx43S38QYRDapA",
        authDomain: "gestao-anisio.firebaseapp.com",
        projectId: "gestao-anisio",
        storageBucket: "gestao-anisio.firebasestorage.app",
        messagingSenderId: "946435999048",
        appId: "1:946435999048:web:a3cae6ed73c21a30b59f7d",
        measurementId: "G-KHL4B7MR3X"
    };
} catch (e) {
    firebaseConfig = {
        apiKey: "AIzaSyCb2Cmqwivdgb_YgCUQbcx43S38QYRDapA",
        authDomain: "gestao-anisio.firebaseapp.com",
        projectId: "gestao-anisio",
        storageBucket: "gestao-anisio.firebasestorage.app",
        messagingSenderId: "946435999048",
        appId: "1:946435999048:web:a3cae6ed73c21a30b59f7d"
    };
}

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const appId = typeof __app_id !== 'undefined' ? __app_id : 'gestao-anisio-v1';

export const generateSafeId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
};
