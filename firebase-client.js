// firebase-client.js (CDN version for static HTML on Vercel)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDfa_OMVY6UXBZHD81h3Kyc7-AgX09_H7o",
  authDomain: "aa-automods.firebaseapp.com",
  projectId: "aa-automods",
  storageBucket: "aa-automods.firebasestorage.app",
  messagingSenderId: "1080296070303",
  appId: "1:1080296070303:web:824385781bf6ce531d56aa"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
