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
  arrayRemove,
} = require('firebase/firestore');
const { db } = require('../../firebase/config');
const { bothSameDate } = require('../../helper/helper');
const { Workout, workoutConverter } = require('../../model/Workout');

router.get('/:id/setting', async (req, res) => {
  console.info('GET /api/user/:id/setting requested');

  try {
    const snapshot = await getDoc(doc(db, 'users', req.params.id));
    const user = snapshot.data();

    res.status(200).json({ code: 200, message: 'User data sent successfully', userData: user });
  } catch (error) {
    console.error('Could not get user data from Firestore', error);
    res.status(500).json({ code: 500, message: error.message });
  }
});

router.put('/:id/setting', async (req, res) => {
  console.info('PUT /api/user/:id/setting requested');
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
  console.info('GET /user/:id/profile requested');

  try {
    const snapshot = await getDoc(doc(db, 'users', req.params.id));
    let user = snapshot.data();
    user.password = undefined;
    user.email = undefined;

    const workoutQuery = query(
      collection(db, 'workouts'),
      where(documentId(), 'in', user.workouts.slice(0, 10))
    );

    let workouts = [];
    const today = new Date();
    const workoutSnapshot = await getDocs(workoutQuery);
    workoutSnapshot.forEach((doc) => {
      let workout = doc.data();
      if (workout.schedule && workout.schedule.length > 0) {
        let nextClosestDate = new Date(workout.schedule[0]);

        for (const dateString of workout.schedule) {
          const date = new Date(dateString);
          if (date >= today && (date < nextClosestDate || nextClosestDate < today)) {
            nextClosestDate = date;
          }
        }

        workout.id = doc.id;
        workout.schedule = nextClosestDate;
        workout.startDate = undefined;
        workout.endDate = undefined;
        workout.daysInWeek = undefined;
        workout.reminder = undefined;
        workouts.push(workout);
      }
    });

    const sortedWorkouts = workouts.sort((a, b) => new Date(a.schedule) - new Date(b.schedule));
    const upcomingWorkouts = sortedWorkouts.filter((workout) =>
      bothSameDate(workout.schedule, workouts[0].schedule)
    );

    let workoutsWithExerciseIds = [];
    await Promise.all(
      upcomingWorkouts.map(async (workout) => {
        let exercises = [];
        const exerciseQuery = query(
          collection(db, 'exerciseGoals'),
          where(documentId(), 'in', workout.exerciseGoals.slice(0, 10))
        );
        const exerciseGoalSnapshot = await getDocs(exerciseQuery);
        exerciseGoalSnapshot.forEach((doc) => {
          let exerciseGoal = doc.data();
          exercises.push(exerciseGoal.exerciseId);
        });
        workout.exercises = exercises;
        workoutsWithExerciseIds.push(workout);
      })
    );

    res.status(200).json({
      code: 200,
      message: 'User profile data sent',
      userData: user,
      workouts: workoutsWithExerciseIds,
    });
  } catch (error) {
    console.error('Could not get user data from Firestore', error);
    res.status(500).json({ code: 500, message: error.message });
  }
});

router.get('/:id/workouts', async (req, res) => {
  console.info('GET /user/:id/workouts requested');
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
      const workoutQuery = query(
        collection(db, 'workouts'),
        where(documentId(), 'in', workoutIds.slice(0, 10))
      );
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
            where(documentId(), 'in', workout.exerciseGoals.slice(0, 10))
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
      where(documentId(), 'in', user.workouts.slice(0, 10))
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

router.get('/:id', async (req, res) => {
  console.info('GET /api/user/:id requested');

  const snapshot = await getDoc(doc(db, 'users', req.params.id));
  const user = snapshot.data();

  let userQuery;
  if (req.query.username) {
    userQuery = query(collection(db, 'users'), where('username', '==', req.query.username));
  } else {
    userQuery = query(collection(db, 'users'), orderBy('numOfFollowers', 'desc'), limit(10));
  }

  let users = [];
  try {
    const userSnapshot = await getDocs(userQuery);
    userSnapshot.forEach((doc) => {
      let user = doc.data();
      if (user.publicUser && user.id !== req.params.id) {
        user.password = undefined;
        user.email = undefined;
        users.push(user);
      }
    });

    res
      .status(200)
      .json({ code: 200, message: `Popular users sent`, users, following: user.following });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ code: 500, message: 'Something went wrong while getting users in DB' });
  }
});

router.put('/:userId/following/:id', async (req, res) => {
  console.info('PUT /api/user/:id/following/:id');

  try {
    const snapshot = await getDoc(doc(db, 'users', req.params.userId));
    const user = snapshot.data();

    if (!user.following.includes(req.params.id)) {
      await updateDoc(doc(db, 'users', req.params.userId), {
        following: arrayUnion(req.params.id),
      });

      await updateDoc(doc(db, 'users', req.params.id), {
        followers: arrayUnion(req.params.userId),
        numOfFollowers: increment(1),
      });
    }
    user.following.push(req.params.id);

    res.status(200).json({
      code: 200,
      message: `User ${req.params.userId} is following ${req.params.id}`,
      following: user.following,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ code: 500, message: 'Something went wrong while getting users in DB' });
  }
});

router.put('/:userId/unfollowing/:id', async (req, res) => {
  console.info('PUT /api/user/:id/unfollowing/:id requested');

  try {
    const snapshot = await getDoc(doc(db, 'users', req.params.userId));
    const user = snapshot.data();

    if (user.followers.includes(req.params.id)) {
      await updateDoc(doc(db, 'users', req.params.userId), {
        following: arrayRemove(req.params.id),
      });

      await updateDoc(doc(db, 'users', req.params.id), {
        followers: arrayRemove(req.params.userId),
        numOfFollowers: increment(-1),
      });
    }
    following = user.following.filter((each) => each !== req.params.id);

    res.status(200).json({
      code: 200,
      message: `User ${req.params.userId} unfollowed ${req.params.id}`,
      following,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ code: 500, message: 'Something went wrong while getting users in DB' });
  }
});

router.get('/:id/get-following', async (req, res) => {
  console.info('GET /api/user/:id/get-following requested');

  try {
    const snapshot = await getDoc(doc(db, 'users', req.params.id));
    const user = snapshot.data();

    res.status(200).json({
      code: 200,
      message: `Following users sent`,
      following: user.following,
    });
  } catch (err) {
    console.error(err.message);
    res
      .status(500)
      .json({ code: 500, message: 'Something went wrong while getting following users in DB' });
  }
});

router.get('/:id/get-connections', async (req, res) => {
  console.info('GET /api/user/:id/get-connections requested');

  try {
    const snapshot = await getDoc(doc(db, 'users', req.params.id));
    const user = snapshot.data();

    const followingQuery = query(
      collection(db, 'users'),
      where(documentId(), 'in', user.following.slice(0, 10))
    );
    const followingSnapshot = await getDocs(followingQuery);
    let followingUsers = [];
    followingSnapshot.forEach((doc) => {
      let user = doc.data();
      user.password = undefined;
      user.email = undefined;
      followingUsers.push(user);
    });

    let followers = [];
    const followerQuery = query(collection(db, 'users'));
    const followerSnapshot = await getDocs(followerQuery);
    followerSnapshot.forEach((doc) => {
      let user = doc.data();
      if (user.following.includes(req.params.id)) {
        user.password = undefined;
        user.email = undefined;
        followers.push(user);
      }
    });

    res.status(200).json({
      code: 200,
      message: `Following user data sent`,
      followingUsers,
      followers,
    });
  } catch (err) {
    console.error(err.message);
    res
      .status(500)
      .json({ code: 500, message: 'Something went wrong while getting following users in DB' });
  }
});



module.exports = router;