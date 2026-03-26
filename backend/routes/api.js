const express = require('express');
const fs = require('fs');
const path = require('path');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

const dataPath = (file) => path.join(__dirname, '../data', file);

router.get('/dashboard', requireAuth, (req, res) => {
  const friends = JSON.parse(fs.readFileSync(dataPath('friends.json'), 'utf-8'));
  res.json({
    totalFriends: friends.length,
    messages: 7,
    notifications: 3,
    posts: 142,
  });
});

router.get('/friends', requireAuth, (req, res) => {
  const friends = JSON.parse(fs.readFileSync(dataPath('friends.json'), 'utf-8'));
  res.json(friends);
});

router.get('/profile', requireAuth, (req, res) => {
  const users = JSON.parse(fs.readFileSync(dataPath('users.json'), 'utf-8'));
  const user = users.find((u) => u.id === req.user.id);

  if (!user) return res.status(404).json({ error: 'User not found' });

  res.json({
    name: user.name,
    memberSince: user.memberSince,
    initial: user.name.charAt(0).toUpperCase(),
    posts: 142,
    friends: 24,
    likes: 389,
  });
});

module.exports = router;
