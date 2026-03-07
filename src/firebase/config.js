import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  initializeFirestore, 
  CACHE_SIZE_UNLIMITED, 
  enableIndexedDbPersistence 
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Suas credenciais reais do projeto "gestao-anisio"
const firebaseConfig = {
  apiKey: "AIzaSyCb2Cmqwivdgb_YgCUQbcx43S38QYRDapA",
  authDomain: "gestao-anisio.firebaseapp.com",
  projectId: "gestao-anisio",
  storageBucket: "gestao-anisio.firebasestorage.app",
  messagingSenderId: "946435999048",
  appId: "1:946435999048:web:a3cae6ed73c21a30b59f7d",
  measurementId: "G-KHL4B7MR3X"
};

// 1. Inicializa o App
const app = initializeApp(firebaseConfig);

// 2. Inicializa o Firestore com cache ilimitado (evita travamentos)
const db = initializeFirestore(app, {
  cacheSizeBytes: CACHE_SIZE_UNLIMITED
});

// 3. Inicializa Autenticação e Analytics
const auth = getAuth(app);
const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;

// 4. ATIVAÇÃO DA PERSISTÊNCIA OFFLINE (ESSENCIAL PARA A EEMTI ANÍSIO TEIXEIRA)
// Isso permite que o porteiro registre a saída mesmo se o Wi-Fi cair.
if (typeof window !== "undefined") {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn("Múltiplas abas abertas: persistência offline desativada.");
    } else if (err.code === 'unimplemented') {
      console.warn("O navegador atual não suporta armazenamento offline.");
    }
  });
}

export { db, auth, analytics };
