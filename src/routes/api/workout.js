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
} = require('firebase/firestore');
const { db } = require('../../firebase/config');
const { ExerciseGoal } = require('../../model/ExerciseGoal');
const { getSchedule } = require('../../helper/helper');

router.get('/exercises', async (req, res) => {
  console.info('GET /api/workout/exercise requested');
  let exercises = [];
  let muscleGroup, exerciseType;

  if (req.query.muscleGroup) {
    muscleGroup = where('muscleGroup', '==', req.query.muscleGroup);
  } else {
    muscleGroup = where('muscleGroup', 'not-in', '');
  }

  if (req.query.exerciseType) {
    exerciseType = where('exerciseType', '==', req.query.exerciseType);
  } else {
    exerciseType = where('exerciseType', 'not-in', '');
  }

  try {
    const exerciseQuery = query(collection(db, 'exercises'), muscleGroup, exerciseType);
    const querySnapshot = await getDocs(exerciseQuery);
    querySnapshot.forEach((doc) => {
      let exercise = doc.data();
      exercise.id = doc.id;
      exercises.push(exercise);
    });

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
    console.log(workout);

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
        totalWorkoutTime += parseInt(time, 10);
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

const exerciseGoalConverter = {
  toFirestore: (exerciseGoal) => {
    return {
      exerciseId: exerciseGoal.exerciseId,
      targetSets: exerciseGoal.targetSets,
      targetReps: exerciseGoal.targetReps,
      targetWeight: exerciseGoal.targetWeight,
      estimatedTime: exerciseGoal.estimatedTime,
      comment: exerciseGoal.comment,
    };
  },
  fromFirestore: (snapshot, options) => {
    const data = snapshot.data(options);
    return new ExerciseGoal(
      data.exerciseId,
      data.targetSets,
      data.targetReps,
      data.targetWeight,
      data.estimatedTime,
      data.comment
    );
  },
};

module.exports = router;

