const { initializeApp } = require('firebase/app');
const { getFirestore } = require('firebase/firestore');
const { getAnalytics } = require('firebase/analytics');
const admin = require('firebase-admin');
const serviceAccount = require('../../serviceAccountKey.json');
require('dotenv').config();

const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  databaseURL: process.env.DATABASE_URL,
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.MESSAGE_SENDER_ID,
  appId: process.env.APP_ID,
  measurementId: process.env.MEASUREMENT_ID,
  credential: admin.credential.cert(serviceAccount),
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
//const analytics = getAnalytics(app);

module.exports = { app, db };
