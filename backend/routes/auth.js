const express = require('express');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { SECRET } = require('../middleware/auth');

const router = express.Router();
const usersFilePath = path.join(__dirname, '../data/users.json');

function readUsers() {
  return JSON.parse(fs.readFileSync(usersFilePath, 'utf-8'));
}

function writeUsers(users) {
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
}

router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const users = readUsers();

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

router.post('/signup', (req, res) => {
  const { username, password, name } = req.body;

  if (!username || !password || !name) {
    return res.status(400).json({ error: 'Username, password, and name are required' });
  }

  const users = readUsers();
  const usernameTaken = users.some((u) => u.username === username);

  if (usernameTaken) {
    return res.status(409).json({ error: 'Username already exists' });
  }

  const newUser = {
    id: users.length ? Math.max(...users.map((u) => u.id)) + 1 : 1,
    username,
    password,
    name,
    memberSince: 'March 2026'
  };

  users.push(newUser);
  writeUsers(users);

  const token = jwt.sign(
    { id: newUser.id, username: newUser.username },
    SECRET,
    { expiresIn: '2h' }
  );

  res.status(201).json({ token, username: newUser.username });
});

router.post('/logout', (req, res) => {
  // JWT is stateless — client discards the token
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;
