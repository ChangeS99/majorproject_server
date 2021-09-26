const router = require('express').Router();

//controllers
const {
    hospitalEmployeeList_POST,
    employeeHospitalSearch_POST,
    createEmployee_POST,
    deleteEmployee_DELETE,
    readEmployee_POST,
    updateEmployee_PATCH
} = require('../controllers/employeeController');

//middlewares
const {
    verifyHospitalCookie
} = require('../middlewares/hospitalMiddleware')

//POST /api/hospital/employee/create
router.post("/create", verifyHospitalCookie, createEmployee_POST);

//POST /api/hospital/employee/create
router.delete("/delete", verifyHospitalCookie, deleteEmployee_DELETE);

//POST /api/hospital/employee/list
router.post("/list", verifyHospitalCookie, hospitalEmployeeList_POST);

//POST /api/hospital/employee/list
router.post("/search", verifyHospitalCookie, employeeHospitalSearch_POST);

//POST /api/hospital/employee/read
router.post("/find", verifyHospitalCookie, readEmployee_POST);

// PUT /api/hospital/employee/update
router.patch("/update", verifyHospitalCookie, updateEmployee_PATCH);

module.exports = router