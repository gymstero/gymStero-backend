const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} = require('firebase/auth');
const { collection, addDoc } = require('firebase/firestore');
const { db } = require('../firebase/config');
const { User } = require('../model/User');

const auth = getAuth();
const googleAuthProvider = new GoogleAuthProvider();

router.post('/register', (req, res) => {
  if (req.body.password1 !== req.body.password2) {
    res.status(401).json({ message: 'Passwords do not match', code: 401 });
  } else {
    bcrypt
      .hash(req.body.password1, 10)
      .then((hash) => {
        createUserWithEmailAndPassword(auth, req.body.email, hash)
          .then(async (userCredential) => {
            const ref = collection(db, 'users').withConverter(userConverter);
            await addDoc(ref, new User(userCredential.user.uid, req.body.email, hash));
            res.status(201).json({ message: `${req.body.email} has been registered`, code: 201 });
          })
          .catch((error) => {
            const errorMessage = error.message;
            res.status(500).json({
              message: errorMessage,
              code: 500,
            });
          });
      })
      .catch((err) => {
        res.status(500).json({ message: 'Something went wrong while hashing password', code: 500 });
      });
  }
});

router.get('/register-with-google', (req, res) => {
  signInWithPopup(auth, googleAuthProvider)
    .then((result) => {
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential.accessToken;
      const user = result.user;
    })
    .catch((err) => {
      const errorMessage = err.message;
      res.status(500).json({
        message: errorMessage,
        code: 500,
      });
    });
});

router.post('/login', (req, res) => {
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed in
    })
    .catch((error) => {
      const errorMessage = error.message;
    });
});

const userConverter = {
  toFirestore: (user) => {
    return {
      id: user.id,
      email: user.email,
      password: user.password,
    };
  },
  fromFirestore: (snapshot, options) => {
    const data = snapshot.data(options);
    return new User(data.id, data.email, data.password);
  },
};

module.exports = router;
