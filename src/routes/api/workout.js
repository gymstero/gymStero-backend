const express = require('express');
const router = express.Router();
const { getDocs, collection, query, where } = require('firebase/firestore');
const { db } = require('../../firebase/config');

router.get('/exercises', async (req, res) => {
  console.info('GET /api/workout/exercise requested', req.query.muscleGroup);
  let exercises = [];
  let condition;

  if (req.query.muscleGroup) {
    condition = where('muscleGroup', '==', req.query.muscleGroup);
  }

  if (req.query.exerciseType) {
    condition = where('exerciseType', '==', req.query.exerciseType);
  }

  try {
    const exerciseQuery = query(collection(db, 'exercises'), condition);
    const querySnapshot = await getDocs(exerciseQuery);
    querySnapshot.forEach((doc) => {
      let exercise = doc.data();
      exercise.id = doc.id;
      exercises.push(exercise);
    });

    res.status(200).json({ code: 200, message: 'Exercise data sent successfully', exercises });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

module.exports = router;



