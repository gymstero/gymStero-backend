const express = require('express');
const router = express.Router();
const {
  collection,
  doc,
  getDocs,
  setDoc,
  query,
  where,
  limit,
  addDoc,
  documentId,
  getDoc,
} = require('firebase/firestore');
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

router.get('/:id/workouts', async (req, res) => {
  let user;
  let workouts = [];
  try {
    const userQuery = query(collection(db, 'users'), where('id', '==', req.params.id), limit(1));
    const userQuerySnapshot = await getDocs(userQuery);
    userQuerySnapshot.forEach((doc) => (user = doc.data()));

    const workoutQuery = query(
      collection(db, 'workouts'),
      where(documentId(), 'in', user.workouts)
    );
    const workoutQuerySnapshot = await getDocs(workoutQuery);
    workoutQuerySnapshot.forEach((doc) => {
      let workout = doc.data();
      workout.id = doc.id;
      workouts.push(workout);
    });

    res.status(200).json({
      code: 200,
      message: 'Exercise data sent successfully',
      workouts,
    });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

router.post('/:id/workout', async (req, res) => {
  const { title, exerciseGoals } = req.body;
  let user;
  const createdAt = new Date().toISOString();
  try {
    const ref = collection(db, 'workouts').withConverter(workoutConverter);
    const result = await addDoc(ref, new Workout(title, exerciseGoals));

    const q = query(collection(db, 'users'), where('id', '==', req.params.id), limit(1));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => (user = doc.data()));

    user.workouts.push(result.id);
    await setDoc(doc(db, 'users', user.id), {
      ...user,
      workouts: user.workouts,
    });

    console.log(`Workout for ${result.id} has been created`);
    res.status(201).json({ code: 201, message: 'Workout has been created successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ code: 500, message: 'Something went wrong while adding workout to DB' });
  }
});

router.get('/:id/workout/:id', async (req, res) => {
  try {
    const workout = await (await getDoc(doc(db, 'workouts', req.params.id))).data();
    res.status(200).json({ code: 200, message: 'Workout sent successfully', workout });
  } catch (err) {
    console.error(err.message);
    res
      .status(500)
      .json({ code: 500, message: 'Something went wrong while fetching workout from DB' });
  }
});

router.put('/:id/workout/:id', async (req, res) => {});

router.delete('/:id/workout/:id', async (req, res) => {});

const workoutConverter = {
  toFirestore: (workout) => {
    return {
      title: workout.title,
      exerciseGoals: workout.exerciseGoals,
      startDate: workout.startDate,
      endDate: workout.endDate,
      routine: workout.routine,
      daysWhenWeekly: workout.daysWhenWeekly,
      reminder: workout.reminder,
      createdAt: workout.createdAt,
    };
  },
  fromFirestore: (snapshot, options) => {
    const data = snapshot.data(options);
    return new Workout(
      data.title,
      data.exerciseGoals,
      data.startDate,
      data.endDate,
      data.routine,
      data.daysWhenWeekly,
      data.reminder,
      data.createdAt
    );
  },
};

module.exports = router;
