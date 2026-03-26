const express = require('express');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { SECRET } = require('../middleware/auth');

const router = express.Router();

router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const users = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../data/users.json'), 'utf-8')
  );

  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (!user) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  const token = jwt.sign(
    { id: user.id, username: user.username },
    SECRET,
    { expiresIn: '2h' }
  );

  res.json({ token, username: user.username });
});

router.post('/logout', (req, res) => {
  // JWT is stateless — client discards the token
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;
