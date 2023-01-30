const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} = require('firebase/auth');
const { collection, addDoc, getDocs, query, where } = require('firebase/firestore');
const { db } = require('../firebase/config');
const { User } = require('../model/User');

const auth = getAuth();

router.post('/register', async (req, res) => {
  const email = req.body.email;

  if (req.body.password !== req.body.confirmPassword) {
    res.status(401).json({ message: 'Passwords do not match', code: 401 });
  } else {
    bcrypt
      .hash(req.body.password, 10)
      .then((hash) => {
        createUserWithEmailAndPassword(auth, email, hash)
          .then(async (userCredential) => {
            const ref = collection(db, 'users').withConverter(userConverter);
            await addDoc(ref, new User(userCredential.user.uid, email, hash));
            res.status(201).json({ message: `${email} has been registered`, code: 201 });
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
router.post('/login', async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  try {
    const userCheck = await getDocs(query(collection(db, 'users'), where('email', '==', email)));
    if (userCheck.size !== 1) {
      return res.status(404).json({ code: 404, message: 'User Does Not Exist' });
    }
    let hashedPassword;
    userCheck.forEach((user) => {
      hashedPassword = user.data().password;
    });

    const isMatch = await bcrypt.compare(password, hashedPassword);
    if (!isMatch) {
        return res.status(401).json({ code: 401, message: 'Wrong Password' });
      } else {
        await signInWithEmailAndPassword(auth, email, hashedPassword);
        res.status(200).json({ code: 200, message: 'Login successful!' });
      }
  } catch (error) {
    res.status(500).json({ code: 500, error: error.message });
  }
});

router.post('/logout', (req, res) => {
  auth
    .signOut()
    .then(() => {
      res.status(200).json({ code: 200, message: 'Log out successful!' });
      res.redirect('/login');
    })
    .catch((error) => {
      res.status(500).json({ code: 500, error: error.message });
    });
});

/*---------------------------------------------------*/
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
