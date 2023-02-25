const express = require('express');
const router = express.Router();

router.use('/user', require('./user'));

router.use('/workout', require('./workout'));

module.exports = router;
