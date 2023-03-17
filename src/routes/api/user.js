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
  updateDoc,
  deleteDoc,
  orderBy,
  arrayUnion,
  increment,
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
  console.log('GET /user/id/profile requested');
  try {
    const querySnapshot = await getDocs(
      query(collection(db, 'users'), where('id', '==', req.params.id))
    );
    let userData;
    querySnapshot.forEach((doc) => {
      userData = doc.data();
    });

    res
      .status(200)
      .json({ code: 200, message: 'User profile sent successfully', userData: userData });
  } catch (error) {
    console.error('Could not get user profile from Firestore', error);
    res.status(500).json({ code: 500, message: error.message });
  }
});

router.get('/:id/workouts', async (req, res) => {
  console.log('GET /user/:id/workouts requested');
  let workoutIds = [];
  let workouts = [];

  try {
    const snapshot = await getDoc(doc(db, 'users', req.params.id));
    const user = snapshot.data();

    if (user.workouts.length > 10) {
      const startIndex = user.workouts.length - 10;
      workoutIds = user.workouts.splice(startIndex);
    } else {
      workoutIds = user.workouts;
    }

    if (workoutIds.length > 0) {
      const workoutQuery = query(collection(db, 'workouts'), where(documentId(), 'in', workoutIds));
      const workoutQuerySnapshot = await getDocs(workoutQuery);

      workoutQuerySnapshot.forEach((doc) => {
        let workout = doc.data();
        workout.id = doc.id;
        workouts.push(workout);
      });

      for (const workout of workouts) {
        if (workout.exerciseGoals.length > 0) {
          const exerciseGoalQuery = query(
            collection(db, 'exerciseGoals'),
            where(documentId(), 'in', workout.exerciseGoals)
          );
          const exerciseGoalSnapshot = await getDocs(exerciseGoalQuery);

          let exerciseIds = [];
          exerciseGoalSnapshot.forEach((doc) => {
            exerciseIds.push(doc.data().exerciseId);
          });
          workout.exercises = exerciseIds;
        }
      }
    }

    res.status(200).json({
      code: 200,
      message: 'Exercise data sent successfully',
      workouts,
    });
  } catch (err) {
    console.warn(err);
    res.status(500).json({ code: 500, message: err.message });
  }
});

router.post('/:id/workout', async (req, res) => {
  console.info('POST /api/user/:id/workout requested');
  const { title, exerciseGoals } = req.body;
  let user;

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

    console.info(`Workout for ${result.id} has been created`);
    res
      .status(201)
      .json({ code: 201, message: 'Workout has been created successfully', id: result.id });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ code: 500, message: 'Something went wrong while adding workout to DB' });
  }
});

router.get('/:id/workout/:workoutId', async (req, res) => {
  console.info('GET /api/user/:userId/workout/:workoutId requested');
  try {
    const snapshot = await getDoc(doc(db, 'workouts', req.params.workoutId));
    const workout = snapshot.data();

    res.status(200).json({ code: 200, message: 'Workout sent successfully', workout });
  } catch (err) {
    console.error(err.message);
    res
      .status(500)
      .json({ code: 500, message: 'Something went wrong while fetching workout from DB' });
  }
});

router.put('/:userId/workout/:workoutId', async (req, res) => {
  console.info('PUT /api/user/:userId/workout/:workoutId requested');
  const workoutData = req.body;
  try {
    await setDoc(doc(db, 'workouts', req.params.workoutId), {
      ...workoutData,
    });

    res
      .status(200)
      .json({ code: 200, message: `Workout ${req.params.workoutId} updated successfully` });
  } catch (err) {
    console.error(err.message);
    res
      .status(500)
      .json({ code: 500, message: 'Something went wrong while updating workout in DB' });
  }
});

router.delete('/:userId/workout/:workoutId', async (req, res) => {
  console.info('DELETE /user/id/workout/id requested');
  try {
    let snapshot = await getDoc(doc(db, 'users', req.params.userId));
    let userData = snapshot.data();

    const index = userData.workouts.indexOf(req.params.workoutId);
    if (index !== -1) {
      userData.workouts.splice(index, 1);
    }

    await setDoc(doc(db, 'users', userData.id), {
      ...userData,
    });

    await deleteDoc(doc(db, 'workouts', req.params.workoutId));
    res.status(200).json({ code: 200, message: `Workout ${req.params.workoutId} deleted` });
  } catch (err) {
    console.error(err.message);
    res
      .status(500)
      .json({ code: 500, message: 'Something went wrong while deleting workout in DB' });
  }
});

router.get('/:userId/workout-schedule', async (req, res) => {
  console.info('GET /user/id/workout-schedule requested');
  try {
    const userSnapshot = await getDoc(doc(db, 'users', req.params.userId));
    const user = userSnapshot.data();

    const workoutQuery = query(
      collection(db, 'workouts'),
      where(documentId(), 'in', user.workouts)
    );
    const workoutSnapshot = await getDocs(workoutQuery);

    let workoutSchedule = [];
    workoutSnapshot.forEach((each) => {
      let workout = each.data();
      workout.id = each.id;
      workoutSchedule.push({
        id: workout.id,
        title: workout.title,
        schedule: workout.schedule,
        totalWorkoutTime: workout.totalWorkoutTime,
      });
    });

    res
      .status(200)
      .json({ code: 200, message: `Workout schedule sent successfully`, workoutSchedule });
  } catch (err) {
    console.error(err.message);
    res
      .status(500)
      .json({ code: 500, message: 'Something went wrong while deleting workout in DB' });
  }
});

router.get('/', async (req, res) => {
  console.info('GET /api/user requested');

  let userQuery;
  if (req.query.username) {
    userQuery = query(collection(db, 'users'), where('username', '==', req.query.username));
  } else {
    userQuery = query(collection(db, 'users'), orderBy('numOfFollowers'), limit(10));
  }

  let users = [];
  try {
    const userSnapshot = await getDocs(userQuery);
    userSnapshot.forEach((doc) => {
      let user = doc.data();
      if (user.publicUser) {
        users.push({
          id: doc.id,
          username: user.username,
          photoUrl: user.photoUrl,
          numOfFollower: user.numOfFollower,
          description: user.description,
          workouts: user.workout,
        });
      }
    });

    res.status(200).json({ code: 200, message: `Top 10 popular users sent`, users });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ code: 500, message: 'Something went wrong while getting users in DB' });
  }
});

router.put('/:userId/following/:id', async (req, res) => {
  console.info('PUT /api/user/:id/following/:id');

  try {
    await updateDoc(doc(db, 'users', req.params.userId), {
      following: arrayUnion(req.params.id),
    });

    await updateDoc(doc(db, 'users', req.params.id), {
      followers: arrayUnion(req.params.userId),
      numOfFollowers: increment(1),
    });

    res.status(200).json({ code: 200, message: `Top 10 popular users sent` });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ code: 500, message: 'Something went wrong while getting users in DB' });
  }
});

const workoutConverter = {
  toFirestore: (workout) => {
    return {
      title: workout.title,
      exerciseGoals: workout.exerciseGoals,
      startDate: workout.startDate,
      endDate: workout.endDate,
      daysInWeek: workout.daysInWeek,
      reminder: workout.reminder,
      createdAt: workout.createdAt,
      schedule: workout.schedule,
      totalWorkoutTime: workout.totalWorkoutTime,
    };
  },
  fromFirestore: (snapshot, options) => {
    const data = snapshot.data(options);
    return new Workout(
      data.title,
      data.exerciseGoals,
      data.startDate,
      data.endDate,
      data.daysInWeek,
      data.reminder,
      data.createdAt,
      data.schedule,
      data.totalWorkoutTime
    );
  },
};

module.exports = router;
