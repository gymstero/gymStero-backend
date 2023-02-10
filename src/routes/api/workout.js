const express = require('express');
const router = express.Router();
const { getDocs, collection, query } = require('firebase/firestore');
const { db } = require('../../firebase/config');

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

module.exports = router;
