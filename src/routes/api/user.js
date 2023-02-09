const express = require('express');
const router = express.Router();
const { collection, doc, getDocs, setDoc, query, where, addDoc } = require('firebase/firestore');
const { db } = require('../../firebase/config');
const { Workout } = require('../../model/Workout');

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

//Need test
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

router.post('/:id/workout', async (req, res) => {
  try {
    const ref = collection(db, 'workouts'); //.withConverter(workoutConverter)
    await addDoc(ref, new Workout()); //Need schema
    console.log(`Workout for ${email} has been created`);
    res.status(201).json({ code: 201, message: 'Workout has been created successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ code: 500, message: 'Something went wrong while adding workout to DB' });
  }
});


module.exports = router;
