import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use

const firebaseConfig = {
  apiKey: "AIzaSyDxafWABzdwnokrYgyZRqCcfVgLDeXM18I",
  authDomain: "shvushon-hahamim.firebaseapp.com",
  projectId: "shvushon-hahamim",
  storageBucket: "shvushon-hahamim.appspot.com",
  messagingSenderId: "358728914528",
  appId: "1:358728914528:web:088c3dd33ec38fdd0a9505",
  measurementId: "G-SBW22SF8ZE",
  databaseURL: "https://shvushon-hahamim-default-rtdb.europe-west1.firebasedatabase.app",
};
export const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
