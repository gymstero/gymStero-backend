const express = require('express');
const router = express.Router();
const {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
} = require('firebase/auth');
const { app } = require('../firebase/config');

const auth = getAuth();

router.post('/register', (req, res) => {
  console.log(`REQ: ${req.body.password}`);
  createUserWithEmailAndPassword(auth, req.body.email, req.body.password)
    .then((userCredential) => {
      // Signed in
      const user = userCredential.user;
      res.status(200).json({ code: 201, message: `${req.body.email} has been registered` });
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      // ..
    });
});

router.post('/login', (req, res) => {
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed in
      const user = userCredential.user;
      // ...
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
    });
});

module.exports = router;
