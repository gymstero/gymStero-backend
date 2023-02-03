const express = require('express');
const router = express.Router();
const authenticate = require('../authorization/authenticate');

router.get('/', (req, res) => {
  res.status(200).json({ message: 'API server response', code: 200 });
});

router.use('/user', require('../authorization'));

router.use(`/api`, authenticate, require('./api'));

module.exports = router;

