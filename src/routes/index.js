const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).json({ message: 'API server response', code: 200 });
});

router.use('/user', require('../authorization'));

router.use(`/v1`, require('./api'));

module.exports = router;
