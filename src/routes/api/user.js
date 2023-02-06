const express = require('express');
const router = express.Router();
const { collection, doc, getDocs, setDoc, query, where } = require('firebase/firestore');
const { db } = require('../../firebase/config');

router.get('/:id/setting', async (req, res) => {
  try {
    const querySnapshot = await getDocs(
      query(collection(db, 'users'), where('id', '==', req.params.id))
    );
    let userData;
    querySnapshot.forEach((doc) => {
      userData = doc.data();
    });

    res.status(200).json({ code: 200, message: 'User data sent successfully', userData: userData });
  } catch (error) {
    console.error('Could not get user data from Firestore', error);
    res.status(500).json({ code: 500, message: error.message });
  }
});

router.put('/:id/setting', async (req, res) => {
  const userData = req.body;

  try {
    await setDoc(doc(db, 'users', userData.id), {
      ...userData,
    });
    res.status(200).json({ code: 200, message: 'User info updated successfully' });
  } catch (err) {
    console.error('Something went wrong while storing user info in Firestore', err);
    res.status(500).json({ code: 500, message: 'Could not save updated user info' });
  }
});

router.get('/:id/profile', async (req, res) => {
  try {
    const querySnapshot = await getDocs(
      query(collection(db, 'users'), where('id', '==', req.params.id))
    );
    let userData;
    querySnapshot.forEach((doc) => {
      userData = doc.data();
    });
    //plus workouts

    res
      .status(200)
      .json({ code: 200, message: 'User profile sent successfully', userData: userData });
  } catch (error) {
    console.error('Could not get user profile from Firestore', error);
    res.status(500).json({ code: 500, message: error.message });
  }
});

router.get('/:id/workouts', async (req, res) => {
  try {
    const querySnapshot = await getDocs(
      query(collection(db, 'users'), where('id', '==', req.params.id))
    );
    querySnapshot.forEach((doc) => {
      exercises.push(doc.data());
    });
    res.status(200).json({ code: 200, message: 'Exercise data sent successfully', exercises });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

module.exports = router;
