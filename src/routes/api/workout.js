const express = require('express');
const router = express.Router();
const { getDocs, collection } = require('firebase/firestore');
const { db } = require('../../firebase/config');

router.get('/workouts', (req, res) => {});

router.get('/exercises', async (req, res) => {
  let exercises = [];
  try {
    const querySnapshot = await getDocs(collection(db, 'exercises'));
    querySnapshot.forEach((doc) => {
      exercises.push(doc.data());
    });
    res.status(200).json({ code: 200, message: 'Exercise data sent successfully', exercises });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

router.post('/workout', (req, res) => {});

router.get('/workout/:id', (req, res) => {
  console.log(`REQ: ${req}`);
});

router.put('/workout/:id', (req, res) => {});

router.delete('/workout/:id', (req, res) => {});

module.exports = router;
