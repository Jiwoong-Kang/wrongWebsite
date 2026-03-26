const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username:    { type: String, required: true, unique: true, trim: true },
  password:    { type: String, required: true },
  name:        { type: String, required: true },
  memberSince: { type: String, default: () => new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' }) },
  friends:     [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
});

module.exports = mongoose.model('User', userSchema);
