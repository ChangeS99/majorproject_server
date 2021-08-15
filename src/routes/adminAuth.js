const router = require('express').Router();

// controllers
const {
    adminSignup_POST,
    adminSignin_POST,
    adminAccountActivation_POST
} = require('../controllers/adminAuthController');

//validators
const {
    adminSigninValidator,
    adminSignupValidator
} = require('../validators');

//middlewares
const {
requireAdminSignin
} = require('../middlewares/adminMiddlewares');

//POST /api/auth/admin/signup
router.post("/signup", adminSignupValidator, adminSignup_POST);

//POST /api/auth/admin/account-activation
router.post("/account-activation", adminAccountActivation_POST);

//POST /api/auth/admin/signin
router.post("/signin", adminSigninValidator, adminSignin_POST);

//GET /api/auth/admin/check
router.get("/check", requireAdminSignin, (req, res) => {
    return res.json({
        cookies: req.signedCookies
    })
})


module.exports = router;