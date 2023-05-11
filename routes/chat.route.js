const { indexView,
        searchView, 
        sendRequest, 
        acceptRequest, 
        friendRequests, 
        allFriendsView,
        rejectRequest } = require("../controllers/chat.controller")
const { protectRoute } = require('../auth/protect');
const router = require("./auth.router");

router.get("/index", protectRoute, indexView);

router.get("/search", protectRoute, searchView);
router.get('/users/:id/send-request', protectRoute, sendRequest);
router.get('/users/friend-requests', protectRoute, friendRequests);
router.post('/users/:id/accept-request', protectRoute, acceptRequest);
router.get('/users/friends', protectRoute, allFriendsView);
router.post('/users/:id/reject-request', protectRoute, rejectRequest);





module.exports = router;