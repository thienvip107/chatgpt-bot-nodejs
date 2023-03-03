const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  content: String,
  userMessage: String,
});

const Message = mongoose.models.Message || mongoose.model('Topic', schema);

module.exports = Message;
