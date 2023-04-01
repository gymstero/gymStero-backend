const { initializeApp } = require('firebase/app');
const { getFirestore } = require('firebase/firestore');
const admin = require('firebase-admin');
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
  credential: admin.credential.cert({
    type: process.env.SERVICE_ACCOUNT_TYPE,
    project_id: process.env.PROJECT_ID,
    private_key_id: process.env.PRIVATE_KEY_ID,
    private_key: JSON.parse(process.env.PRIVATE_KEY),
    client_email: process.env.CLIENT_EMAIL,
    client_id: process.env.CLIENT_ID,
    auth_uri: process.env.AUTH_URI,
    token_uri: process.env.TOKEN_URI,
    auth_provider_x509_cert_url: process.env.AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.CLIENT_X509_CERT_URL,
  }),
};

const firebaseApp = initializeApp(firebaseConfig);
admin.initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

module.exports = { firebaseApp, admin, db };
