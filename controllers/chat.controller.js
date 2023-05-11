const User = require('../models/user.model');
const Post = require('../models/post.model');

const ObjectId = require('mongodb').ObjectId;
const indexView = async (req, res) => {
  const userId = req.user._id;

  try {
    const user = await User.findById(userId);
    Post.find()
      .populate('user', 'name')
      .exec()
      .then(posts => {
        res.render('index', { posts, user });
      })
      .catch(error => {
        res.status(500).json({ error: 'An error occurred while retrieving posts.' });
      });
  } catch (e) {
    res.json(e)
  }
};
const searchView = async (req, res) => {
  try {
    const users = await User.find({ name: { $regex: `^${req.query.query}$` } });

    const senderId = req.user._id;

    for (const user of users) {
      const hasSent = user.friendRequests.some(friendRequest => {
        return friendRequest.toString() === senderId.toString();
      });
      user.isSent = hasSent;
    }

    res.render("_partial_views/search-results", { users, currentUser: req.user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
}
const sendRequest = async (req, res) => {
  const userId = req.params.id;
  const senderId = req.user._id;
  let isUnique = true;

  try {
    const recipient = await User.findById(userId);
    const sender = await User.findById(ObjectId(senderId).toString());

    recipient.friendRequests.forEach(firendRequest => {
      if (firendRequest.toString() === sender._id.toString()) {
        isUnique = false;
        return;
      }
    });

    if (isUnique) {
      recipient.friendRequests.push(sender);
      await recipient.save();

      const data = {
        message: 'Friend request sent successfully!',
        isFriendRequestSent: true
      };

      res.render('index', { data });
    } else {
      const data = {
        message: 'You have already sent a friend request to this user.',
        isFriendRequestSent: false
      };
      res.render('index', { data });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

const friendRequests = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('friendRequests', ['name', 'email']);
    res.render('_partial_views/friend-requests', { user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

const allFriendsView = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('friends', ['name', 'email']);

    res.render('_partial_views/friends', { friends: user.friends });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
}




const acceptRequest = async (req, res) => {
  const userId = req.user._id;
  const friendId = req.params.id;

  try {
    const user = await User.findById(userId);
    const friend = await User.findById(friendId);

    if (!user || !friend) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Add friend to the friends array of the accepting user
    user.friends.push(friend._id);
    await user.save();

    // Remove friend request from the friendRequests array of the accepting user
    user.friendRequests = user.friendRequests.filter(
      (request) => request.toString() !== friend._id.toString()
    );
    await user.save();

    // Add the accepting user to the friends array of the requesting user
    friend.friends.push(user._id);
    await friend.save();

    res.redirect('/users/friends');
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

const rejectRequest = async (req, res) => {
  try {
    const requestId = req.params.id;
    const user = await User.findById(req.user._id).populate('friendRequests');

    // Check if the request exists
    const requestExists = user.friendRequests.some(request => request._id.equals(requestId));
    if (!requestExists) {
      return res.status(404).json({ error: 'Friend request not found' });
    }

    // Remove the request from the user's friendRequests array
    user.friendRequests.pull(requestId);
    await user.save();

    res.redirect('/users/friend-requests');
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

module.exports = {
  indexView,
  searchView,
  sendRequest,
  acceptRequest,
  friendRequests,
  allFriendsView,
  rejectRequest,
};
