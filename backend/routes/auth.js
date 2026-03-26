const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { SECRET } = require('../middleware/auth');

const router = express.Router();

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const user = await User.findOne({ username, password });

  if (!user) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  const token = jwt.sign(
    { id: user._id, username: user.username },
    SECRET,
    { expiresIn: '2h' }
  );

  res.json({ token, username: user.username });
});

router.post('/signup', async (req, res) => {
  const { username, password, name } = req.body;

  if (!username || !password || !name) {
    return res.status(400).json({ error: 'Username, password, and name are required' });
  }

  const existing = await User.findOne({ username });
  if (existing) {
    return res.status(409).json({ error: 'Username already exists' });
  }

  const user = await User.create({ username, password, name });

  const token = jwt.sign(
    { id: user._id, username: user.username },
    SECRET,
    { expiresIn: '2h' }
  );

  res.status(201).json({ token, username: user.username });
});

router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;
