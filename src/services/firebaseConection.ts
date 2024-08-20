
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // inicializar o serviço
import { getStorage } from "firebase/storage";



const firebaseConfig = {
  apiKey: "AIzaSyC-NnGx-3jLWQ1pWjNupezCc9riq1GOnUM",
  authDomain: "webcarros-d4c18.firebaseapp.com",
  projectId: "webcarros-d4c18",
  storageBucket: "webcarros-d4c18.appspot.com",
  messagingSenderId: "195169035616",
  appId: "1:195169035616:web:9efa6a29b9c2ce9a81ea05"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app)
const auth = getAuth(app)
const storage = getStorage(app)

export {db, auth, storage };