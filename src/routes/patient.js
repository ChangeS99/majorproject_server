const router = require('express').Router();

//controllers
const {
    hospitalPatientList_POST,
    patientHospitalSearch_POST,
    createPatient_POST,
    deletePatient_DELETE,
    readPatient_POST,
    updatePatient_PUT,
    patientStageCreate_POST,
    patientStageDelete_DELETE
} = require('../controllers/patientController');

//middlewares
const {
    verifyHospitalCookie
} = require('../middlewares/hospitalMiddleware');

//POST /api/hospital/patient/find
router.post("/find", verifyHospitalCookie, readPatient_POST);

//POST /api/hospital/patient/create
router.post("/create", verifyHospitalCookie, createPatient_POST);

//POST /api/hospital/patient/search
router.post("/search", verifyHospitalCookie, patientHospitalSearch_POST);

//POST /api/hospital/patient/list
router.post("/list", verifyHospitalCookie, hospitalPatientList_POST);

// PUT /api/hospital/patient/update
router.put("/update", verifyHospitalCookie, updatePatient_PUT);

//DELETE /api/hospital/patient/delete
router.delete("/delete", verifyHospitalCookie, deletePatient_DELETE);

//POST /api/hospital/patient/stage/create
router.post("/stage/create", verifyHospitalCookie, patientStageCreate_POST);

//DELETE /api/hospital/patient/stage/delete
router.delete("/stage/delete", verifyHospitalCookie, patientStageDelete_DELETE);


module.exports = router;