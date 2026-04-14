// ==========================================
// FIREBASE CONFIGURATION (FINAL WORKING)
// ==========================================

const firebaseConfig = {
  apiKey: "AIzaSyBqRT4ORcCzCifm9E5-HLEhXMhzlkkoHyA",
  authDomain: "medalerts-71832.firebaseapp.com",
  projectId: "medalerts-71832",
  storageBucket: "medalerts-71832.firebasestorage.app",
  messagingSenderId: "646990623700",
  appId: "1:646990623700:web:77407fdc099a118e55dc41",
  measurementId: "G-VQ3BDD2ZHC"
};

// Initialize Firebase (IMPORTANT)
firebase.initializeApp(firebaseConfig);

// Auth object
const auth = firebase.auth();


// ==========================================
// EMAILJS CONFIG (KEEP FOR LATER USE)
// ==========================================

const EMAILJS_CONFIG = {
  PUBLIC_KEY: "YOUR_EMAILJS_PUBLIC_KEY",
  SERVICE_ID: "YOUR_EMAILJS_SERVICE_ID",
  TEMPLATE_ID: "tempalte_fx07jrk"
};

