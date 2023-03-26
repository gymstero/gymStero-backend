const express = require('express');
const router = express.Router();
const {
  getDocs,
  collection,
  query,
  where,
  doc,
  getDoc,
  addDoc,
  setDoc,
  updateDoc,
  documentId,
  deleteDoc,
  limit,
  arrayUnion,
} = require('firebase/firestore');
const { db } = require('../../firebase/config');
const { Workout, workoutConverter } = require('../../model/Workout');
const { ExerciseGoal, exerciseGoalConverter } = require('../../model/ExerciseGoal');
const { getSchedule } = require('../../helper/helper');

router.get('/exercises', async (req, res) => {
  console.info('GET /api/workout/exercise requested');
  let exercises = [];
  let exercisesByType = [];

  let exerciseQuery;
  if (req.query.exerciseType) {
    exerciseQuery = query(
      collection(db, 'exercises'),
      where('exerciseType', '==', req.query.exerciseType)
    );
  } else {
    exerciseQuery = query(collection(db, 'exercises'));
  }

  try {
    const querySnapshot = await getDocs(exerciseQuery);
    querySnapshot.forEach((doc) => {
      let exercise = doc.data();
      exercise.id = doc.id;
      exercisesByType.push(exercise);
    });

    if (req.query.muscleGroup) {
      exercises = exercisesByType.filter(
        (exercise) => exercise.muscleGroup === req.query.muscleGroup
      );
    } else {
      exercises = exercisesByType;
    }

    res.status(200).json({ code: 200, message: 'Exercise data sent successfully', exercises });
  } catch (err) {
    console.warn(err);
    res.status(500).json({ code: 500, message: err.message });
  }
});

router.get('/exercise/:id', async (req, res) => {
  console.info('GET /api/workout/exercise/:id requested');
  try {
    const exerciseSnapshot = await getDoc(doc(db, 'exercises', req.params.id));
    const exercise = exerciseSnapshot.data();

    res
      .status(200)
      .json({ code: 200, message: `Exercise ${req.params.id} sent successfully`, exercise });
  } catch (err) {
    console.warn(err);
    res.status(500).json({ code: 500, message: err.message });
  }
});

router.post('/exercise-goal', async (req, res) => {
  console.info('POST /api/workout/exercise-goals requested');
  const { exerciseId, targetSets, targetReps, targetWeight, estimatedTime, comment } = req.body;

  try {
    const ref = collection(db, 'exerciseGoals').withConverter(exerciseGoalConverter);
    const result = await addDoc(
      ref,
      new ExerciseGoal(exerciseId, targetSets, targetReps, targetWeight, estimatedTime, comment)
    );

    res.status(201).json({ code: 201, message: 'Exercise goal is created', id: result.id });
  } catch (err) {
    console.warn(err);
    res.status(500).json({ code: 500, message: err.message });
  }
});

router.get('/exercise-goal/:id', async (req, res) => {
  console.info('GET /api/workout/exercise-goal/:id requested');
  try {
    const querySnapshot = await getDoc(doc(db, 'exerciseGoals', req.params.id));
    const exerciseGoal = querySnapshot.data();

    res.status(200).json({
      code: 200,
      message: `Exercise goal ${req.params.id} sent successfully`,
      exerciseGoal,
    });
  } catch (err) {
    console.warn(err);
    res.status(500).json({ code: 500, message: err.message });
  }
});

router.post('/:id/exercise-goal', async (req, res) => {
  console.info('POST /api/workout/:id/exercise-goal requested');
  const { exerciseId, targetSets, targetReps, targetWeight, estimatedTime, comment } = req.body;

  try {
    const ref = collection(db, 'exerciseGoals').withConverter(exerciseGoalConverter);
    const result = await addDoc(
      ref,
      new ExerciseGoal(exerciseId, targetSets, targetReps, targetWeight, estimatedTime, comment)
    );
    const snapshot = await getDoc(doc(db, 'workouts', req.params.id));
    let workout = snapshot.data();
    workout.exerciseGoals.push(result.id);

    await setDoc(doc(db, 'workouts', req.params.id), {
      ...workout,
    });

    res.status(201).json({ code: 201, message: 'Exercise goal is created', workout });
  } catch (err) {
    console.warn(err);
    res.status(500).json({ code: 500, message: err.message });
  }
});

router.put('/exercise-goal/:id', async (req, res) => {
  console.info('PUT /api/workout/exercise-goal/:id requested');
  const exerciseGoalData = req.body;
  try {
    await setDoc(doc(db, 'exerciseGoals', req.params.id), {
      ...exerciseGoalData,
    });

    res.status(200).json({
      code: 200,
      message: `Exercise goal ${req.params.id} updated successfully`,
    });
  } catch (err) {
    console.warn(err);
    res.status(500).json({ code: 500, message: err.message });
  }
});

router.get('/:id/exercise-goals', async (req, res) => {
  console.info('GET /api/workout/:id/exercise-goals requested');
  let exerciseGoals = [];
  let exercises = [];
  let exerciseIds = [];

  try {
    const workoutSnapshot = await getDoc(doc(db, 'workouts', req.params.id));
    const workout = workoutSnapshot.data();

    if (workout.exerciseGoals.length > 0) {
      const exerciseGoalQuery = query(
        collection(db, 'exerciseGoals'),
        where(documentId(), 'in', workout.exerciseGoals)
      );
      const exerciseGoalSnapshot = await getDocs(exerciseGoalQuery);

      exerciseGoalSnapshot.forEach((each) => {
        let exerciseGoal = each.data();
        exerciseGoal.id = each.id;
        exerciseIds.push(exerciseGoal.exerciseId);
        exerciseGoals.push(exerciseGoal);
      });

      if (exerciseIds.length > 0) {
        const exerciseQuery = query(
          collection(db, 'exercises'),
          where(documentId(), 'in', exerciseIds)
        );
        const exerciseSnapshot = await getDocs(exerciseQuery);
        exerciseSnapshot.forEach((each) => {
          let exercise = each.data();
          exercise.id = each.id;
          exercises.push(exercise);
        });
      }

      exerciseGoals.map(
        (exerciseGoal) =>
          (exerciseGoal.exerciseInfo = exercises.find((e) => e.id === exerciseGoal.exerciseId))
      );
    }

    let tempExerciseGoals = [];
    workout.exerciseGoals.forEach((id) => {
      const match = exerciseGoals.find((goal) => goal.id === id);
      tempExerciseGoals.unshift(match);
    });
    exerciseGoals = tempExerciseGoals;

    res.status(200).json({ code: 200, message: 'Exercise goals sent successfully', exerciseGoals });
  } catch (err) {
    console.warn(err);
    res.status(500).json({ code: 500, message: err.message });
  }
});

router.put('/exercise-goals/:id', async (req, res) => {
  console.info('PUT /api/workout/exercise-goals/:id requested');
  const { targetSets, targetReps, targetWeight, estimatedTime, comment } = req.body;

  try {
    const exerciseGoalSnapshot = await setDoc(doc(db, 'exerciseGoals', req.params.id), {
      targetSets,
      targetReps,
      targetWeight,
      estimatedTime,
      comment,
    });
    const exerciseGoal = exerciseGoalSnapshot.data();

    res.status(200).json({ code: 200, message: `Exercise goal ${req.params.id} updated` });
  } catch (err) {
    console.warn(err);
    res.status(500).json({ code: 500, message: err.message });
  }
});

router.delete('/:workoutId/exercise-goal/:exerciseGoalId', async (req, res) => {
  console.info('DELETE /api/workout/:id/exercise-goal/:id requested');

  try {
    const workoutSnapshot = await getDoc(doc(db, 'workouts', req.params.workoutId));
    let workout = workoutSnapshot.data();
    let exerciseGoals = workout.exerciseGoals.filter(
      (exerciseGoal) => exerciseGoal !== req.params.exerciseGoalId
    );
    workout.exerciseGoals = exerciseGoals;

    await setDoc(doc(db, 'workouts', req.params.workoutId), { ...workout });

    await deleteDoc(doc(db, 'exerciseGoals', req.params.exerciseGoalId));

    res
      .status(200)
      .json({ code: 200, message: `Exercise goal ${req.params.exerciseGoalId} deleted` });
  } catch (err) {
    console.warn(err);
    res.status(500).json({ code: 500, message: err.message });
  }
});

router.put('/:id/', async (req, res) => {
  console.info('PUT /api/workout/:id requested');

  try {
    const workoutSnapshot = await getDoc(doc(db, 'workouts', req.params.id));
    let workout = workoutSnapshot.data();

    workout.exerciseGoals = req.body;

    await setDoc(doc(db, 'workouts', req.params.id), {
      ...workout,
    });

    res.status(200).json({ code: 200, message: `Workout plan ${req.params.id} updated` });
  } catch (err) {
    console.warn(err);
    res.status(500).json({ code: 500, message: err.message });
  }
});

router.put('/:id/schedule', async (req, res) => {
  console.info('PUT /api/workout/:id/schedule requested');
  const { startDate, endDate, daysInWeek, reminder } = req.body;

  try {
    const schedule = getSchedule(startDate, endDate, daysInWeek);

    const snapshot = await getDoc(doc(db, 'workouts', req.params.id));
    const workout = snapshot.data();

    const exerciseGoalQuery = query(
      collection(db, 'exerciseGoals'),
      where(documentId(), 'in', workout.exerciseGoals)
    );

    const exerciseGoalSnapshot = await getDocs(exerciseGoalQuery);

    let totalWorkoutTime = 0;
    if (exerciseGoalSnapshot.size > 0) {
      exerciseGoalSnapshot.forEach((doc) => {
        const time = doc.data().estimatedTime;
        totalWorkoutTime += parseInt(time ? time : 0, 10);
      });
    }

    await updateDoc(doc(db, 'workouts', req.params.id), {
      schedule,
      totalWorkoutTime,
      startDate,
      endDate,
      daysInWeek,
      reminder,
    });

    res.status(200).json({
      code: 200,
      message: 'Workout schedule has been updated successfully',
      title: workout.title,
      schedule,
      totalWorkoutTime,
    });
  } catch (err) {
    console.warn(err);
    res.status(500).json({ code: 500, message: err.message });
  }
});

router.put('/:workoutId/schedule-delete', async (req, res) => {
  console.info('PUT /api/workout/:id/schedule-delete requested');

  try {
    await updateDoc(doc(db, 'workouts', req.params.workoutId), {
      schedule: [],
    });

    res.status(200).json({
      code: 200,
      message: `Workout schedule for ${req.params.workoutId} deleted successfully`,
    });
  } catch (err) {
    console.warn(err);
    res.status(500).json({ code: 500, message: err.message });
  }
});

router.get('/user/:id', async (req, res) => {
  console.info('GET /api/workout/user/:id requested');

  try {
    const userQuery = query(collection(db, 'users'), where('publicUser', '==', true), limit(10));
    const userSnapshot = await getDocs(userQuery);

    let publicUsers = [];
    let publicWorkouts = [];
    userSnapshot.forEach((doc) => {
      const user = doc.data();
      if (user.publicUser && user.id !== req.params.id) {
        publicUsers.push(user);
      }
    });
    publicUsers.sort((a, b) => b.numOfFollowers - a.numOfFollowers);

    //Limit the number of workouts per user
    publicUsers.forEach((user) => {
      let firstThreeWorkouts = [];
      if (user.workouts.length > 3) {
        firstThreeWorkouts = user.workouts.slice(0, 3);
      } else {
        firstThreeWorkouts = user.workouts;
      }
      publicWorkouts.push(...firstThreeWorkouts);
    });

    //Limit the total workouts to search (Firestore limit)
    const firstTenWorkouts = publicWorkouts.slice(0, 10);
    let workoutQuery = query(
      collection(db, 'workouts'),
      where(documentId(), 'in', firstTenWorkouts)
    );
    
    let workouts = [];
    const workoutSnapshot = await getDocs(workoutQuery);
    workoutSnapshot.forEach((doc) => {
      const { title, createdAt, exerciseGoals, totalWorkoutTime } = doc.data();
      let workout = { title, createdAt, exerciseGoals, totalWorkoutTime };

      if (!req.query.workoutTitle) {
        req.query.workoutTitle = '';
      }

      if (workout.title.includes(req.query.workoutTitle)) {
        workout.id = doc.id;
        publicUsers.forEach((user) => {
          if (user.workouts.includes(workout.id)) {
            workout.username = user.username;
          }
        });
        workouts.push(workout);
      }
    });

    res.status(200).json({ code: 200, message: `Popular workouts sent`, workouts });
  } catch (err) {
    console.error(err.message);
    res
      .status(500)
      .json({ code: 500, message: 'Something went wrong while getting workouts in DB' });
  }
});

router.put('/copy-workout/:workoutId/to-user/:userId/', async (req, res) => {
  console.info('PUT /api/workout/copy-workout/:id/to-user/:id requested');

  try {
    const snapshot = await getDoc(doc(db, 'workouts', req.params.workoutId));
    const workout = snapshot.data();

    let copiedExerciseGoals = [];
    await Promise.all(
      workout.exerciseGoals.map(async (exercise) => {
        const snapshot = await getDoc(doc(db, 'exerciseGoals', exercise));
        const exerciseGoal = snapshot.data();
        const { exerciseId, targetSets, targetReps, targetWeight, estimatedTime, comment } =
          exerciseGoal;

        const newDocRef = collection(db, 'exerciseGoals').withConverter(exerciseGoalConverter);
        const result = await addDoc(
          newDocRef,
          new ExerciseGoal(exerciseId, targetSets, targetReps, targetWeight, estimatedTime, comment)
        );
        copiedExerciseGoals.push(result.id);
      })
    );

    const workoutRef = collection(db, 'workouts').withConverter(workoutConverter);
    const result = await addDoc(workoutRef, new Workout(workout.title, copiedExerciseGoals));

    await setDoc(doc(db, 'workouts', result.id), {
      ...workout,
    });

    await updateDoc(doc(db, 'users', req.params.userId), {
      workouts: arrayUnion(result.id),
    });

    res.status(200).json({
      code: 200,
      message: `Workout copied successfully`,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ code: 500, message: 'Something went wrong while copying workout' });
  }
});

module.exports = router;