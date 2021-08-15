const router = require('express').Router();

// import controllers
const {
    signup_POST,
    accountActivation_POST,
    signin_POST,
    reSignin_POST,
    signout_POST
} = require('../controllers/authController');

// import middlewares
const {
    requireUserSignin,

} = require('../middlewares/authMiddlewares');

// import validators
const {
    userSignupValidator,
    userSigninValidator
} = require('../validators');


// signup route
// POST /api/auth/signup 
// SUCCESS 201 {message, user}
// FAILURE 400
router.post("/signup", userSignupValidator, signup_POST);

// activation route
// POST /api/auth/account-activation 
// SUCCESS 201 {message, user}
// FAILURE 400
router.post("/account-activation", accountActivation_POST);

// signin route
// POST /api/auth/signin 
// SUCCESS 201 {message}
// FAILURE 400
router.post("/signin", userSigninValidator, signin_POST);

router.post("/resignin", reSignin_POST);

router.post("/signout", requireUserSignin, signout_POST)

router.get("/check", requireUserSignin, (req, res) => {
    return res.json({
        message: "verified"
    });
})

module.exports = router;