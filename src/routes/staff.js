const router = require('express').Router();

//controllers
const {
    hospitalStaffList_POST
} = require('../controllers/staffController');

//middlewares
const {
    verifyHospitalCookie
} = require('../middlewares/hospitalMiddleware');

//POST /api/hospital/staff/list
router.post("/list", verifyHospitalCookie, hospitalStaffList_POST);

module.exports = router;