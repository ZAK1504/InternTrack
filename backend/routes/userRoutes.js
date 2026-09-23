const express = require('express');
const router = express.Router();
const { getNotifications, clearNotifications } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.route('/notifications')
  .get(protect, getNotifications)
  .delete(protect, clearNotifications);

module.exports = router;
