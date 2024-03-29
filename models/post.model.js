const mongoose = require('mongoose');

// Define the Post schema
const postSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ]
});

// Create the Post model
const Post = mongoose.model('Post', postSchema);

module.exports = Post;
