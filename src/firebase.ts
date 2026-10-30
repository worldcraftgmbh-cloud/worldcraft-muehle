import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

export const firebaseConfig = {
  apiKey: "AIzaSyAgTanP3TWi7cPQmwzGmFA0mmfo6HFoGq0",
  authDomain: "worldcraft-schach.firebaseapp.com",
  projectId: "worldcraft-schach",
  storageBucket: "worldcraft-schach.firebasestorage.app",
  messagingSenderId: "140634400169",
  appId: "1:140634400169:web:3ca2cebbc93c7db0f410b8",
  measurementId: "G-3QXVHBL7S3"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
