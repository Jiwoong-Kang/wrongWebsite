const express = require('express');
const User = require('../models/User');
const Friend = require('../models/Friend');
const FriendRequest = require('../models/FriendRequest');
const Post = require('../models/Post');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/dashboard', requireAuth, async (req, res) => {
  const [me, postCount, pendingRequests] = await Promise.all([
    User.findById(req.user.id, 'friends'),
    Post.countDocuments({ author: req.user.id }),
    FriendRequest.countDocuments({ to: req.user.id, status: 'pending' }),
  ]);

  res.json({
    totalFriends:  me.friends.length,
    messages:      0,
    notifications: pendingRequests,
    posts:         postCount,
  });
});

router.get('/friends', requireAuth, async (req, res) => {
  const me = await User.findById(req.user.id, 'friends').populate('friends', 'username name');
  const friends = me.friends.map(f => ({
    name: f.name,
    initial: f.name.charAt(0).toUpperCase(),
    status: 'Online',
    username: f.username,
  }));
  res.json(friends);
});

router.get('/profile', requireAuth, async (req, res) => {
  const user = await User.findById(req.user.id, '-password -__v');

  if (!user) return res.status(404).json({ error: 'User not found' });

  const postCount = await Post.countDocuments({ author: user._id });

  res.json({
    name: user.name,
    memberSince: user.memberSince,
    initial: user.name.charAt(0).toUpperCase(),
    posts: postCount,
    friends: user.friends.length,
    likes: 389,
  });
});

router.get('/users/search', requireAuth, async (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q) return res.json([]);

  const users = await User.find(
    {
      $or: [
        { username: { $regex: q, $options: 'i' } },
        { name: { $regex: q, $options: 'i' } },
      ],
      _id: { $ne: req.user.id },
    },
    'username name -_id'
  ).limit(10);

  res.json(users);
});

// Send a friend request
router.post('/friends/request', requireAuth, async (req, res) => {
  const { toUsername } = req.body;

  if (!toUsername) return res.status(400).json({ error: 'toUsername is required' });

  const toUser = await User.findOne({ username: toUsername });
  if (!toUser) return res.status(404).json({ error: 'User not found' });

  if (toUser._id.equals(req.user.id)) {
    return res.status(400).json({ error: 'Cannot send request to yourself' });
  }

  try {
    await FriendRequest.create({ from: req.user.id, to: toUser._id });
    res.json({ message: `Friend request sent to ${toUser.name}` });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Friend request already sent' });
    }
    throw err;
  }
});

// Accept a friend request
router.post('/friends/requests/:id/accept', requireAuth, async (req, res) => {
  const request = await FriendRequest.findOne({ _id: req.params.id, to: req.user.id });
  if (!request) return res.status(404).json({ error: 'Request not found' });

  request.status = 'accepted';
  await request.save();

  // Add each user to the other's friends array (avoid duplicates)
  await User.findByIdAndUpdate(req.user.id,      { $addToSet: { friends: request.from } });
  await User.findByIdAndUpdate(request.from,     { $addToSet: { friends: req.user.id } });

  res.json({ message: 'Friend request accepted' });
});

// Get incoming pending friend requests for the logged-in user
router.get('/friends/requests', requireAuth, async (req, res) => {
  const requests = await FriendRequest.find({ to: req.user.id, status: 'pending' })
    .populate('from', 'username name')
    .sort({ createdAt: -1 });

  res.json(requests.map(r => ({
    id: r._id,
    from: r.from.name,
    fromUsername: r.from.username,
    createdAt: r.createdAt,
  })));
});

// Create a post
router.post('/posts', requireAuth, async (req, res) => {
  const { content } = req.body;
  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'Content is required' });
  }
  const post = await Post.create({ author: req.user.id, content: content.trim() });
  await post.populate('author', 'name username');
  res.status(201).json(post);
});

// Get feed — posts from self + friends, newest first
router.get('/feed', requireAuth, async (req, res) => {
  const me = await User.findById(req.user.id, 'friends');
  const authorIds = [me._id, ...me.friends];

  const posts = await Post.find({ author: { $in: authorIds } })
    .populate('author', 'name username')
    .sort({ createdAt: -1 })
    .limit(50);

  res.json(posts.map(p => ({
    id: p._id,
    author: p.author.name,
    username: p.author.username,
    content: p.content,
    createdAt: p.createdAt,
  })));
});

module.exports = router;
