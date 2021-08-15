const router = require('express').Router();

//controllers
const {
    hospitalPatientList_POST,
    patientHospitalSearch_POST,
    createPatient_POST,
    deletePatient_DELETE
} = require('../controllers/patientController');

//middlewares
const {
    verifyHospitalCookie
} = require('../middlewares/hospitalMiddleware');

//POST /api/hospital/patient/create
router.post("/create", verifyHospitalCookie, createPatient_POST);

//POST /api/hospital/patient/search
router.post("/search", verifyHospitalCookie, patientHospitalSearch_POST);

//POST /api/hospital/patient/list
router.post("/list", verifyHospitalCookie, hospitalPatientList_POST);

//DELETE /api/hospital/patient/delete
router.delete("/delete", verifyHospitalCookie, deletePatient_DELETE);

module.exports = router;