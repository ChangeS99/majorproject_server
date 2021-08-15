const router = require('express').Router();

const {
    verifyNormalUser_POST
} = require('../controllers/userController');

//post /api/user/normal/verify
router.post("/normal/verify", verifyNormalUser_POST);

module.exports = router;