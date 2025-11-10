import { initializeApp } from 'firebase/app';
import { getAuth } from "firebase/auth";

// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyClKDKGi72jLfbtgWF1957XHWZghwSM0YI",
    authDomain: "errordetectinator.firebaseapp.com",
    databaseURL: "https://errordetectinator-default-rtdb.firebaseio.com",
    projectId: "errordetectinator",
    storageBucket: "errordetectinator.appspot.com",
    messagingSenderId: "442966541608",
    appId: "1:442966541608:web:b08d5b8a9ea1d5ba2ffc1d"
};
//initialize app and authorization
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Export initialized Firebase app
export const firebaseApp = app; 
