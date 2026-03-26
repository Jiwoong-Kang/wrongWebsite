const mongoose = require('mongoose');

const friendSchema = new mongoose.Schema({
  name:    { type: String, required: true },
  initial: { type: String, required: true },
  status:  { type: String, enum: ['Online', 'Offline', 'Away'], default: 'Offline' },
});

module.exports = mongoose.model('Friend', friendSchema);
