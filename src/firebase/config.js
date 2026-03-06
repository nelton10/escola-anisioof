import { initializeApp } from "firebase/app";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";

const firebaseConfig = {
  // Insira suas credenciais aqui
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ATENÇÃO: Isso permite que o app funcione sem internet na escola
enableIndexedDbPersistence(db).catch((err) => {
    if (err.code == 'failed-precondition') {
        console.error("Múltiplas abas abertas, persistência falhou.");
    } else if (err.code == 'unimplemented') {
        console.error("Navegador não suporta persistência.");
    }
});

export { db };
