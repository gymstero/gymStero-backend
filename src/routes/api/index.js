const express = require('express');
const router = express.Router();

router.use('/user', require('./setting'));

// router.use('/workout', require('./workout'));

// router.use('/schedule', require('./schedule'));

// router.use('/run-workout', require('./run-workout'));

module.exports = router;
