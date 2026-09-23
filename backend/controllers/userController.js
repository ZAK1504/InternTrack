const User = require('../models/User');

// @route   GET /api/users/notifications
// @desc    Get notifications for the logged in user
const getNotifications = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('notifications');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Return notifications sorted by newest first
    const sortedNotifications = user.notifications.sort((a, b) => b.createdAt - a.createdAt);
    res.json(sortedNotifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   DELETE /api/users/notifications
// @desc    Clear all notifications for the logged in user
const clearNotifications = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.notifications = [];
    await user.save();
    
    res.json({ message: 'Notifications cleared' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getNotifications,
  clearNotifications
};
